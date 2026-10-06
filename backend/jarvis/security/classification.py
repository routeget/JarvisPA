from enum import Enum
from typing import Dict, List, Tuple


class DataClassification(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    SENSITIVE = "SENSITIVE"
    RESTRICTED = "RESTRICTED"


# Level ordering for comparison
CLASSIFICATION_LEVELS = {
    DataClassification.PUBLIC: 1,
    DataClassification.INTERNAL: 2,
    DataClassification.CONFIDENTIAL: 3,
    DataClassification.SENSITIVE: 4,
    DataClassification.RESTRICTED: 5,
}

# Maximum classification allowed per provider per Section 58
PROVIDER_CLASSIFICATION_CEILING = {
    "ollama": DataClassification.RESTRICTED,     # Local model can handle restricted
    "claude": DataClassification.CONFIDENTIAL,  # Anthropic enterprise agreement
    "openai": DataClassification.CONFIDENTIAL,  # OpenAI enterprise agreement
    "copilot": DataClassification.CONFIDENTIAL, # Microsoft Entra boundary
    "gemini": DataClassification.CONFIDENTIAL,  # Google Cloud Vertex / enterprise
    "groq": DataClassification.INTERNAL,        # Fast inference cloud
    "openrouter": DataClassification.INTERNAL,  # Gateway proxy
}


class DataSecurityPolicy:
    """
    Enforces Section 58-59: Data Routing Policy and classification verification.
    """

    @staticmethod
    def is_provider_permitted(provider_id: str, classification: DataClassification) -> bool:
        ceiling = PROVIDER_CLASSIFICATION_CEILING.get(provider_id.lower(), DataClassification.INTERNAL)
        return CLASSIFICATION_LEVELS[classification] <= CLASSIFICATION_LEVELS[ceiling]

    @staticmethod
    def filter_permitted_providers(
        providers: List[str], classification: DataClassification
    ) -> List[str]:
        return [p for p in providers if DataSecurityPolicy.is_provider_permitted(p, classification)]
