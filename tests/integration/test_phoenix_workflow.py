import pytest
from backend.jarvis.agent.orchestrator import agent_orchestrator
from backend.jarvis.database.db import init_db
from backend.jarvis.approvals.manager import approval_manager


@pytest.mark.asyncio
async def test_phoenix_cross_system_workflow():
    await init_db()

    query = (
        "JARVIS, check my email, Teams, Slack and Azure DevOps for everything related to "
        "Project Phoenix, summarize the current status, identify anything urgent, and prepare the required responses."
    )

    result = await agent_orchestrator.execute_user_request(query)

    assert result["task_id"].startswith("task_")
    assert len(result["activity_trace"]) > 5
    assert len(result["citations"]) >= 5
    assert "Project Phoenix" in result["response"]
    assert "PR #847" in result["response"]
    assert len(result["pending_approvals"]) == 1

    # Check the created approval
    appr = result["pending_approvals"][0]
    assert appr["action_type"] == "send_email"
    assert appr["risk_level"] == "HIGH"

    # User decides to approve
    decision_res = await approval_manager.decide_approval(appr["id"], "APPROVED", "Approved for staging deployment")
    assert decision_res["status"] == "APPROVED"
