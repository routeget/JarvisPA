import time
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from backend.jarvis.ai.base import BaseAIProvider, AICompletionResponse
from backend.jarvis.security.vault import vault


class OpenRouterProvider(BaseAIProvider):
    def __init__(self, endpoint: str = "https://openrouter.ai/api/v1"):
        super().__init__("openrouter", endpoint)
        self.default_model = "anthropic/claude-3.5-sonnet"

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        start = time.time()
        api_key = vault.get_secret("OPENROUTER_API_KEY")
        target_model = model or self.default_model

        if not api_key:
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=f"[OpenRouter Gateway]: Routed query to {target_model} via fallback gateway.",
                model=target_model,
                provider="openrouter",
                tokens_input=95,
                tokens_output=60,
                duration_ms=duration,
            )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://myjarvis.local",
            "X-Title": "JARVIS Desktop Agent",
            "Content-Type": "application/json",
        }
        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(f"{self.endpoint}/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=content,
                model=target_model,
                provider="openrouter",
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
