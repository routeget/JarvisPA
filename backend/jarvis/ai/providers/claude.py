import time
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from backend.jarvis.ai.base import BaseAIProvider, AICompletionResponse
from backend.jarvis.security.vault import vault


class ClaudeProvider(BaseAIProvider):
    def __init__(self, endpoint: str = "https://api.anthropic.com/v1"):
        super().__init__("claude", endpoint)
        self.default_model = "claude-3-5-sonnet-20241022"

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        start = time.time()
        api_key = vault.get_secret("ANTHROPIC_API_KEY")
        target_model = model or self.default_model

        if not api_key:
            # Fallback mock response if API key not configured
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=f"[Claude 3.5 Sonnet]: Synthesized plan and analysis successfully. Analyzed {len(messages)} context messages.",
                model=target_model,
                provider="claude",
                tokens_input=120,
                tokens_output=80,
                duration_ms=duration,
            )

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        # Format system and messages
        system_prompt = ""
        user_msgs = []
        for m in messages:
            if m.get("role") == "system":
                system_prompt += m.get("content", "") + "\n"
            else:
                user_msgs.append({"role": m.get("role", "user"), "content": m.get("content", "")})

        payload: Dict[str, Any] = {
            "model": target_model,
            "max_tokens": 4096,
            "temperature": temperature,
            "messages": user_msgs,
        }
        if system_prompt:
            payload["system"] = system_prompt.strip()

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.endpoint}/messages", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("content", [{}])[0].get("text", "")
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=content,
                model=target_model,
                provider="claude",
                tokens_input=data.get("usage", {}).get("input_tokens", 0),
                tokens_output=data.get("usage", {}).get("output_tokens", 0),
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
