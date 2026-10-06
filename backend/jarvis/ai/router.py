import logging
from typing import Dict, Any, List, Optional
from backend.jarvis.ai.base import BaseAIProvider, AICompletionResponse
from backend.jarvis.ai.providers.claude import ClaudeProvider
from backend.jarvis.ai.providers.openai_provider import OpenAIProvider
from backend.jarvis.ai.providers.gemini import GeminiProvider
from backend.jarvis.ai.providers.groq import GroqProvider
from backend.jarvis.ai.providers.openrouter import OpenRouterProvider
from backend.jarvis.ai.providers.ollama import OllamaProvider
from backend.jarvis.ai.providers.copilot import CopilotProvider
from backend.jarvis.ai.providers.mock import MockProvider
from backend.jarvis.security.classification import DataClassification, DataSecurityPolicy
from backend.jarvis.security.emergency import emergency_controller

logger = logging.getLogger("jarvis.ai.router")


class AIRouter:
    """
    Intelligent AI Model & Provider Router per Section 7, 51, 59, 81, and 86.
    """

    def __init__(self):
        self.providers: Dict[str, BaseAIProvider] = {
            "claude": ClaudeProvider(),
            "openai": OpenAIProvider(),
            "gemini": GeminiProvider(),
            "groq": GroqProvider(),
            "openrouter": OpenRouterProvider(),
            "ollama": OllamaProvider(),
            "copilot": CopilotProvider(),
            "mock": MockProvider(),
        }

        # Fallback chains per Section 81
        self.fallback_order = ["claude", "openai", "openrouter", "ollama"]

    def get_provider(self, provider_id: str) -> Optional[BaseAIProvider]:
        return self.providers.get(provider_id.lower())

    def route_provider(
        self,
        task_type: str = "general",
        data_classification: DataClassification = DataClassification.INTERNAL,
        multimodal: bool = False,
        low_latency: bool = False,
        preferred_provider: Optional[str] = None,
    ) -> BaseAIProvider:
        # Check emergency safety controls
        if emergency_controller.force_local_mode or emergency_controller.disable_cloud_ai:
            return self.providers["ollama"]

        # 1. Enforce data classification per Section 59
        if data_classification == DataClassification.RESTRICTED:
            # Must be local/air-gapped
            return self.providers["ollama"]

        # 2. Preferred provider if specified and compliant
        if preferred_provider and preferred_provider in self.providers:
            if DataSecurityPolicy.is_provider_permitted(preferred_provider, data_classification):
                return self.providers[preferred_provider]

        # 3. Task-specific routing rules per Section 7 & 51
        if low_latency:
            return self.providers["groq"]

        if multimodal:
            return self.providers["gemini"]

        if task_type in ("planning", "complex_reasoning", "cross_system_correlation"):
            return self.providers["claude"]

        if task_type in ("microsoft_enterprise", "copilot_studio"):
            return self.providers["copilot"]

        if task_type in ("fast_classification", "intent_detection"):
            return self.providers["groq"]

        # Default reasoning model
        return self.providers["claude"]

    async def execute_with_fallback(
        self,
        messages: List[Dict[str, str]],
        task_type: str = "general",
        data_classification: DataClassification = DataClassification.INTERNAL,
        preferred_provider: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AICompletionResponse:
        """
        Executes chat completion with automated provider failover per Section 81.
        """
        primary = self.route_provider(
            task_type=task_type,
            data_classification=data_classification,
            preferred_provider=preferred_provider,
        )

        chain = [primary.provider_id] + [p for p in self.fallback_order if p != primary.provider_id]

        last_error = None
        for pid in chain:
            # Check compliance for fallback
            if not DataSecurityPolicy.is_provider_permitted(pid, data_classification):
                continue

            provider = self.providers.get(pid)
            if not provider or not provider.is_healthy:
                continue

            try:
                response = await provider.chat(messages=messages, tools=tools, **kwargs)
                return response
            except Exception as e:
                logger.warning(f"Provider {pid} failed during execution: {e}. Initiating fallback...")
                last_error = e

        # If all fail, return mock or local response
        mock_provider = self.providers["mock"]
        return await mock_provider.chat(messages=messages, **kwargs)


ai_router = AIRouter()
