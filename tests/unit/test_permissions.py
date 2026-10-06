import pytest
from backend.jarvis.permissions.manager import PermissionManager, AutonomyLevel, PolicyDecision, ToolRiskLevel


def test_permission_read_allowed():
    pm = PermissionManager(user_autonomy_level=AutonomyLevel.LEVEL_2_APPROVAL)
    decision, reason = pm.evaluate_action("search_email", {})
    assert decision == PolicyDecision.ALLOWED


def test_permission_send_email_requires_approval():
    pm = PermissionManager(user_autonomy_level=AutonomyLevel.LEVEL_2_APPROVAL)
    decision, reason = pm.evaluate_action("send_email", {}, is_external_comm=True)
    assert decision == PolicyDecision.APPROVAL_REQUIRED


def test_permission_critical_blocked():
    pm = PermissionManager(user_autonomy_level=AutonomyLevel.LEVEL_3_CONTROLLED_AUTONOMOUS)
    decision, reason = pm.evaluate_action("delete_email", {})
    assert decision == PolicyDecision.BLOCKED


def test_permission_controlled_autonomous():
    pm = PermissionManager(user_autonomy_level=AutonomyLevel.LEVEL_3_CONTROLLED_AUTONOMOUS)
    decision, reason = pm.evaluate_action("create_draft", {})
    assert decision == PolicyDecision.ALLOWED
