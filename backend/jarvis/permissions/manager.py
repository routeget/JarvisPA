from enum import Enum
from typing import Dict, Any, Optional, Tuple
from backend.jarvis.security.emergency import emergency_controller


class AutonomyLevel(int, Enum):
    LEVEL_0_ADVISORY = 0              # System only provides recommendations
    LEVEL_1_DRAFT = 1                 # System prepares actions/drafts, cannot execute
    LEVEL_2_APPROVAL = 2              # System can execute after user approval
    LEVEL_3_CONTROLLED_AUTONOMOUS = 3 # Pre-approved low-risk actions execute automatically
    LEVEL_4_ADVANCED_AUTONOMOUS = 4   # Configured workflows execute independently (disabled by default)


class ToolRiskLevel(str, Enum):
    READ = "READ"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PolicyDecision(str, Enum):
    ALLOWED = "ALLOWED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    BLOCKED = "BLOCKED"


class PermissionManager:
    """
    Enforces Section 3.3, 55-56, 127-128:
    Centrally validates whether a requested tool action may proceed,
    requires human approval, or is strictly blocked.
    """

    def __init__(self, user_autonomy_level: AutonomyLevel = AutonomyLevel.LEVEL_2_APPROVAL):
        self.user_autonomy_level = user_autonomy_level

        # Default tool risk levels per Section 127
        self.tool_risk_map: Dict[str, ToolRiskLevel] = {
            "search_email": ToolRiskLevel.READ,
            "read_email": ToolRiskLevel.READ,
            "read_document": ToolRiskLevel.READ,
            "search_teams": ToolRiskLevel.READ,
            "read_teams": ToolRiskLevel.READ,
            "search_slack": ToolRiskLevel.READ,
            "read_slack": ToolRiskLevel.READ,
            "search_azure_devops": ToolRiskLevel.READ,
            "search_github": ToolRiskLevel.READ,
            "view_calendar": ToolRiskLevel.READ,
            "unified_search": ToolRiskLevel.READ,
            "create_draft": ToolRiskLevel.LOW,
            "prepare_briefing": ToolRiskLevel.LOW,
            "create_issue": ToolRiskLevel.MEDIUM,
            "update_work_item": ToolRiskLevel.MEDIUM,
            "modify_meeting": ToolRiskLevel.MEDIUM,
            "send_email": ToolRiskLevel.HIGH,
            "send_teams_message": ToolRiskLevel.HIGH,
            "send_slack_message": ToolRiskLevel.HIGH,
            "create_calendar_event": ToolRiskLevel.HIGH,
            "merge_pr": ToolRiskLevel.HIGH,
            "delete_email": ToolRiskLevel.CRITICAL,
            "delete_repo": ToolRiskLevel.CRITICAL,
            "deploy_production": ToolRiskLevel.CRITICAL,
        }

    def get_tool_risk(self, tool_name: str) -> ToolRiskLevel:
        return self.tool_risk_map.get(tool_name.lower(), ToolRiskLevel.MEDIUM)

    def evaluate_action(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        is_external_comm: bool = False,
    ) -> Tuple[PolicyDecision, str]:
        # Check emergency controller
        if emergency_controller.is_emergency_stopped:
            return PolicyDecision.BLOCKED, "Emergency Stop is active. All tool executions are halted."

        if emergency_controller.disable_outbound_communication and is_external_comm:
            return PolicyDecision.BLOCKED, "Outbound communications are currently disabled by safety control."

        risk = self.get_tool_risk(tool_name)

        # Critical operations always blocked unless explicitly authorized by policy
        if risk == ToolRiskLevel.CRITICAL:
            return PolicyDecision.BLOCKED, f"Operation {tool_name} is classified as CRITICAL and is blocked by default."

        # Read operations always allowed
        if risk == ToolRiskLevel.READ:
            return PolicyDecision.ALLOWED, "Read operation approved automatically."

        # If Level 0 (Advisory) or Level 1 (Draft)
        if self.user_autonomy_level <= AutonomyLevel.LEVEL_1_DRAFT:
            if risk == ToolRiskLevel.LOW and "draft" in tool_name:
                return PolicyDecision.ALLOWED, "Draft creation permitted under Level 1."
            return PolicyDecision.APPROVAL_REQUIRED, f"Autonomy Level {self.user_autonomy_level.name} requires approval for execution."

        # If Level 2 (Approval)
        if self.user_autonomy_level == AutonomyLevel.LEVEL_2_APPROVAL:
            if risk in (ToolRiskLevel.READ, ToolRiskLevel.LOW):
                return PolicyDecision.ALLOWED, "Low-risk operation permitted."
            return PolicyDecision.APPROVAL_REQUIRED, f"Action {tool_name} ({risk.value}) requires explicit human approval."

        # If Level 3 (Controlled Autonomous)
        if self.user_autonomy_level >= AutonomyLevel.LEVEL_3_CONTROLLED_AUTONOMOUS:
            if risk in (ToolRiskLevel.READ, ToolRiskLevel.LOW, ToolRiskLevel.MEDIUM):
                return PolicyDecision.ALLOWED, "Permitted under Controlled Autonomous policy."
            return PolicyDecision.APPROVAL_REQUIRED, f"High-risk action {tool_name} requires explicit approval."

        return PolicyDecision.APPROVAL_REQUIRED, "Approval required by policy."


permission_manager = PermissionManager()
