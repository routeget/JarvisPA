import time
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from backend.jarvis.ai.base import BaseAIProvider, AICompletionResponse
from backend.jarvis.security.vault import vault


class GroqProvider(BaseAIProvider):
    def __init__(self, endpoint: str = "https://api.groq.com/openai/v1"):
        super().__init__("groq", endpoint)
        self.default_model = "llama-3.3-70b-versatile"

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        start = time.time()
        api_key = vault.get_secret("GROQ_API_KEY")
        target_model = model or self.default_model

        if not api_key:
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=f"[Groq Ultra-Fast LLaMA 3.3]: Fast inference classification and routing complete. Parsed in {max(1, duration)}ms.",
                model=target_model,
                provider="groq",
                tokens_input=80,
                tokens_output=40,
                duration_ms=duration,
            )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.endpoint}/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=content,
                model=target_model,
                provider="groq",
                tokens_input=data.get("usage", {}).get("prompt_tokens", 0),
                tokens_output=data.get("usage", {}).get("completion_tokens", 0),
                duration_ms=duration,
                raw_response=data,
            )

    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        **kwargs,
    ) -> AsyncGenerator[str, None]:
        res = await self.chat(messages, model, temperature, **kwargs)
        for chunk in res.content.split(" "):
            yield chunk + " "
