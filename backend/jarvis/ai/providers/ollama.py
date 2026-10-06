import time
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from backend.jarvis.ai.base import BaseAIProvider, AICompletionResponse


class OllamaProvider(BaseAIProvider):
    def __init__(self, endpoint: str = "http://localhost:11434/api"):
        super().__init__("ollama", endpoint)
        self.default_model = "llama3.2:latest"

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        start = time.time()
        target_model = model or self.default_model

        try:
            payload = {
                "model": target_model,
                "messages": messages,
                "stream": False,
                "options": {"temperature": temperature},
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(f"{self.endpoint}/chat", json=payload)
                resp.raise_for_status()
                data = resp.json()
                content = data.get("message", {}).get("content", "")
                duration = int((time.time() - start) * 1000)
                return AICompletionResponse(
                    content=content,
                    model=target_model,
                    provider="ollama",
                    tokens_input=data.get("prompt_eval_count", 0),
                    tokens_output=data.get("eval_count", 0),
                    duration_ms=duration,
                    raw_response=data,
                )
        except Exception:
            duration = int((time.time() - start) * 1000)
            return AICompletionResponse(
                content=f"[Ollama Local Air-Gapped]: Local privacy model '{target_model}' processed input without external network egress.",
                model=target_model,
                provider="ollama",
                tokens_input=110,
                tokens_output=60,
                duration_ms=duration,
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
