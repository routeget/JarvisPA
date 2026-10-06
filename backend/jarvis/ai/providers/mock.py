import time
from typing import AsyncGenerator, Dict, Any, List, Optional
from backend.jarvis.ai.base import BaseAIProvider, AICompletionResponse


class MockProvider(BaseAIProvider):
    """
    Mock AI Provider per Section 95 for automated testing and offline development.
    Can be configured with deterministic mock outputs or tool-calling plans.
    """

    def __init__(self, canned_response: Optional[str] = None):
        super().__init__("mock", "http://mock-ai.local")
        self.canned_response = canned_response

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        start = time.time()
        last_user_msg = next((m.get("content", "") for m in reversed(messages) if m.get("role") == "user"), "")
        content = self.canned_response or f"[Mock Provider]: Successfully processed query: '{last_user_msg}'"
        duration = int((time.time() - start) * 1000)

        return AICompletionResponse(
            content=content,
            model=model or "mock-model-v1",
            provider="mock",
            tokens_input=50,
            tokens_output=30,
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
