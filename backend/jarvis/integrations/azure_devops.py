from typing import Dict, Any, List
from backend.jarvis.security.sanitizer import ContentSanitizer


class AzureDevOpsIntegration:
    """
    Azure DevOps integration per Section 20-21.
    Provides work items, queries, boards, sprints, and status.
    """

    async def search_azure_devops(
        self,
        query: str = "",
        state: str = "Active",
        assigned_to: str = "",
    ) -> List[Dict[str, Any]]:
        items = [
            {
                "id": "12345",
                "title": "[Critical Bug] Staging connection pool exhaustion in Phoenix data service",
                "type": "Bug",
                "state": "Active",
                "severity": "1 - Critical",
                "assigned_to": "Marcus Vance",
                "iteration": "Sprint 42",
                "area": "Project Phoenix\\Backend",
                "description": ContentSanitizer.wrap_untrusted_content(
                    "Staging database connection pool hits max connections during high concurrent writes. Blocked until PR #847 is merged.",
                    "Azure DevOps Work Item #12345",
                ),
            },
            {
                "id": "12346",
                "title": "[Feature] Implement MCP standard tool registry adapter",
                "type": "User Story",
                "state": "In Progress",
                "severity": "2 - High",
                "assigned_to": "Sarah Chen",
                "iteration": "Sprint 42",
                "area": "Project Phoenix\\AI-Runtime",
                "description": "Expose standard MCP server discovery for Claude and OpenAI tool-calling.",
            },
            {
                "id": "12347",
                "title": "[Task] Prepare Release Readiness and Security Compliance Checklist",
                "type": "Task",
                "state": "Active",
                "severity": "3 - Medium",
                "assigned_to": "Elena Rostova",
                "iteration": "Sprint 42",
                "area": "Project Phoenix\\Governance",
                "description": "Audit logging and encryption verification for Friday deployment.",
            },
        ]
        if query:
            q = query.lower()
            return [
                it for it in items
                if q in it["title"].lower() or q in it["type"].lower() or q in it["id"]
            ]
        return items

    async def update_work_item(self, id: str, state: str, comment: str = "") -> Dict[str, Any]:
        return {
            "status": "UPDATED",
            "id": id,
            "new_state": state,
            "comment": comment,
            "updated_at": "2026-10-06T21:30:00Z",
        }


azure_devops_integration = AzureDevOpsIntegration()
