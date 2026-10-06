import pytest
from backend.jarvis.ai.router import ai_router
from backend.jarvis.security.classification import DataClassification
from backend.jarvis.security.emergency import emergency_controller


def test_ai_router_task_routing():
    provider_plan = ai_router.route_provider(task_type="planning")
    assert provider_plan.provider_id == "claude"

    provider_fast = ai_router.route_provider(low_latency=True)
    assert provider_fast.provider_id == "groq"

    provider_vision = ai_router.route_provider(multimodal=True)
    assert provider_vision.provider_id == "gemini"


def test_ai_router_data_classification():
    # Restricted data must route to local/ollama
    provider_restricted = ai_router.route_provider(
        task_type="planning",
        data_classification=DataClassification.RESTRICTED,
    )
    assert provider_restricted.provider_id == "ollama"


def test_emergency_stop_routing():
    emergency_controller.force_local_mode = True
    provider = ai_router.route_provider()
    assert provider.provider_id == "ollama"
    emergency_controller.force_local_mode = False
