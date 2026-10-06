from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from pydantic import BaseModel, Field


class AICompletionResponse(BaseModel):
    content: str
    model: str
    provider: str
    tokens_input: int = 0
    tokens_output: int = 0
    duration_ms: int = 0
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    raw_response: Optional[Dict[str, Any]] = None


class BaseAIProvider(ABC):
    """
    Abstract AI Provider Interface adhering to Section 6 of Level 2 specification.
    """

    def __init__(self, provider_id: str, endpoint: Optional[str] = None):
        self.provider_id = provider_id
        self.endpoint = endpoint
        self.is_healthy = True

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        pass

    @abstractmethod
    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        **kwargs,
    ) -> AsyncGenerator[str, None]:
        pass

    async def embeddings(self, text: str, model: Optional[str] = None) -> List[float]:
        """Default fallback embedding generator."""
        # 16-dim deterministic normalized pseudo-vector for local semantic fallback
        import hashlib
        import math
        h = hashlib.sha256(text.encode("utf-8")).digest()
        vec = [float((b - 128) / 128.0) for b in h[:16]]
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]
