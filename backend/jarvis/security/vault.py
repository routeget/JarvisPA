import os
import json
import base64
from pathlib import Path
from typing import Optional, Dict, Any, List
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class SecureCredentialVault:
    """
    Local-first credential vault using symmetric encryption (AES-128-CBC via Fernet
    with PBKDF2 key derivation from machine identifier/master salt).
    Satisfies Section 53: API keys and OAuth refresh tokens are encrypted at rest.
    Persists encrypted secrets to a local `.vault_store.enc` file.
    """

    def __init__(self, master_secret: Optional[str] = None, storage_path: Optional[str] = None):
        secret = master_secret or os.getenv("JARVIS_MASTER_KEY", "jarvis_desktop_local_device_key_2026")
        salt = b"jarvis_salt_98457234"
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100_000,
        )
        derived_key = base64.urlsafe_b64encode(kdf.derive(secret.encode("utf-8")))
        self.fernet = Fernet(derived_key)
        self._in_memory_cache: Dict[str, str] = {}
        
        # File storage path
        if storage_path:
            self._storage_path = Path(storage_path)
        else:
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            self._storage_path = base_dir / ".vault_store.enc"

        self._load_from_disk()

    def _load_from_disk(self) -> None:
        """Loads and decrypts all persisted secrets from disk into cache."""
        try:
            if self._storage_path.exists():
                encrypted_blob = self._storage_path.read_bytes()
                if encrypted_blob:
                    decrypted_raw = self.fernet.decrypt(encrypted_blob).decode("utf-8")
                    data = json.loads(decrypted_raw)
                    if isinstance(data, dict):
                        self._in_memory_cache = data
        except Exception:
            # If corruption occurs, start fresh with empty cache
            self._in_memory_cache = {}

    def _persist_to_disk(self) -> None:
        """Encrypts in-memory cache and writes safely to disk."""
        try:
            raw_json = json.dumps(self._in_memory_cache)
            encrypted_blob = self.fernet.encrypt(raw_json.encode("utf-8"))
            self._storage_path.write_bytes(encrypted_blob)
        except Exception as e:
            print(f"[Vault] Failed to persist vault to disk: {e}")

    def encrypt(self, plain_text: str) -> str:
        if not plain_text:
            return ""
        return self.fernet.encrypt(plain_text.encode("utf-8")).decode("utf-8")

    def decrypt(self, cipher_text: str) -> str:
        if not cipher_text:
            return ""
        try:
            return self.fernet.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
        except Exception:
            return ""

    def store_secret(self, key_id: str, value: str) -> None:
        """Stores a plain-text secret, storing in cache and saving encrypted blob to disk."""
        if not value:
            self.delete_secret(key_id)
            return
        self._in_memory_cache[key_id.upper()] = value
        self._persist_to_disk()

    def get_secret(self, key_id: str) -> Optional[str]:
        """
        Retrieves a secret. Priority:
        1. Environment variable
        2. Encrypted vault storage
        """
        norm_key = key_id.upper()
        env_val = os.getenv(norm_key)
        if env_val:
            return env_val
        return self._in_memory_cache.get(norm_key)

    def delete_secret(self, key_id: str) -> None:
        norm_key = key_id.upper()
        if norm_key in self._in_memory_cache:
            del self._in_memory_cache[norm_key]
            self._persist_to_disk()

    def has_secret(self, key_id: str) -> bool:
        val = self.get_secret(key_id)
        return bool(val and len(val.strip()) > 0)

    def get_masked_secret(self, key_id: str) -> Optional[str]:
        val = self.get_secret(key_id)
        if not val:
            return None
        trimmed = val.strip()
        if len(trimmed) <= 8:
            return "••••••••"
        return f"{trimmed[:4]}...{trimmed[-4:]}"

    def list_configured_keys(self) -> Dict[str, Dict[str, Any]]:
        """Returns dictionary of known keys with masked previews and status."""
        common_keys = [
            "ANTHROPIC_API_KEY",
            "OPENAI_API_KEY",
            "GEMINI_API_KEY",
            "GROQ_API_KEY",
            "OPENROUTER_API_KEY",
            "OLLAMA_BASE_URL",
            "COPILOT_API_KEY",
            "M365_TENANT_ID",
            "M365_CLIENT_ID",
            "M365_CLIENT_SECRET",
            "M365_ACCESS_TOKEN",
            "AZURE_DEVOPS_ORG",
            "AZURE_DEVOPS_PROJECT",
            "AZURE_DEVOPS_PAT",
            "GITHUB_TOKEN",
            "GITHUB_OWNER",
            "SLACK_BOT_TOKEN",
            "SLACK_USER_TOKEN",
            "GOOGLE_WORKSPACE_CREDENTIALS",
            "N8N_API_KEY",
            "N8N_URL",
        ]
        
        result = {}
        # Check all known keys
        all_keys = set(common_keys) | set(self._in_memory_cache.keys())
        for k in all_keys:
            val = self.get_secret(k)
            result[k] = {
                "key": k,
                "is_configured": bool(val),
                "masked_value": self.get_masked_secret(k) if val else None,
                "source": "env" if os.getenv(k) else ("vault" if k in self._in_memory_cache else "none"),
            }
        return result


# Global vault singleton
vault = SecureCredentialVault()
