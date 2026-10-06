import hashlib
from typing import Dict, Any, List, Optional, Callable, Awaitable
from pydantic import BaseModel, Field
from backend.jarvis.permissions.manager import ToolRiskLevel, PolicyDecision, permission_manager


class ToolDefinition(BaseModel):
    id: str
    name: str
    description: str
    category: str  # email, calendar, teams, slack, github, azure_devops, google, browser, windows, n8n, search
    risk_level: ToolRiskLevel
    required_permission: str
    approval_required: bool
    input_schema: Dict[str, Any] = Field(default_factory=dict)
    output_schema: Dict[str, Any] = Field(default_factory=dict)


class ToolRegistry:
    """
    Manages MCP and native tool definitions, progressive discovery, and dispatch per Section 30, 31, 125, 126.
    """

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._executors: Dict[str, Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]] = {}

    def register_tool(
        self,
        tool: ToolDefinition,
        executor: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]],
    ) -> None:
        self._tools[tool.name] = tool
        self._executors[tool.name] = executor

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_all_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())

    def discover_tools_for_query(self, user_query: str) -> List[ToolDefinition]:
        """
        Implements Progressive Tool Discovery (Section 126):
        Discovers tools based on semantic and keyword relevance to avoid bloating the context window.
        """
        q = user_query.lower()
        selected_categories = set()

        if any(w in q for w in ("email", "mail", "outlook", "inbox", "gmail")):
            selected_categories.add("email")
        if any(w in q for w in ("calendar", "meeting", "schedule", "events")):
            selected_categories.add("calendar")
        if any(w in q for w in ("teams", "channel", "chat")):
            selected_categories.add("teams")
        if any(w in q for w in ("slack", "dm")):
            selected_categories.add("slack")
        if any(w in q for w in ("azure", "devops", "work item", "bug", "sprint")):
            selected_categories.add("azure_devops")
        if any(w in q for w in ("github", "repo", "pr", "pull request", "commit", "issue")):
            selected_categories.add("github")
        if any(w in q for w in ("google", "drive", "docs")):
            selected_categories.add("google")
        if any(w in q for w in ("browser", "web", "page", "scrape", "search online")):
            selected_categories.add("browser")
        if any(w in q for w in ("windows", "pc", "desktop", "powershell", "system")):
            selected_categories.add("windows")
        if any(w in q for w in ("workflow", "n8n", "automate")):
            selected_categories.add("n8n")

        # Always include unified enterprise search
        selected_categories.add("search")

        # If no specific category matched, return all discovery tools
        if len(selected_categories) <= 1:
            return list(self._tools.values())

        return [t for t in self._tools.values() if t.category in selected_categories or t.category == "search"]

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        executor = self._executors.get(tool_name)
        if not executor:
            return {"error": f"Tool '{tool_name}' not registered in registry."}

        return await executor(arguments)


tool_registry = ToolRegistry()
