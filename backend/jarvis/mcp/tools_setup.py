from backend.jarvis.mcp.registry import tool_registry, ToolDefinition
from backend.jarvis.permissions.manager import ToolRiskLevel
from backend.jarvis.integrations.m365 import m365_integration
from backend.jarvis.integrations.azure_devops import azure_devops_integration
from backend.jarvis.integrations.github_integration import github_integration
from backend.jarvis.integrations.slack_integration import slack_integration
from backend.jarvis.integrations.google_integration import google_workspace_integration
from backend.jarvis.integrations.system_tools import browser_integration, windows_integration, n8n_integration
from backend.jarvis.search.engine import unified_search_engine


def setup_default_tools() -> None:
    # 1. Search tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_unified_search",
            name="unified_search",
            description="Searches across all connected enterprise systems (Outlook, Teams, Azure DevOps, GitHub, Slack, Drive) simultaneously.",
            category="search",
            risk_level=ToolRiskLevel.READ,
            required_permission="search.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
        ),
        lambda args: unified_search_engine.search_all(args.get("query", "")),
    )

    # 2. Outlook / Email tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_search_email",
            name="search_email",
            description="Searches Outlook and enterprise email for messages matching query or project.",
            category="email",
            risk_level=ToolRiskLevel.READ,
            required_permission="email.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}, "top": {"type": "integer"}}},
        ),
        lambda args: m365_integration.search_email(args.get("query", ""), args.get("top", 5)),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_create_draft",
            name="create_draft",
            description="Creates an email draft in Outlook for review.",
            category="email",
            risk_level=ToolRiskLevel.LOW,
            required_permission="email.draft",
            approval_required=False,
            input_schema={"type": "object", "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}}, "required": ["to", "subject", "body"]},
        ),
        lambda args: m365_integration.create_email_draft(args.get("to", ""), args.get("subject", ""), args.get("body", "")),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_send_email",
            name="send_email",
            description="Sends an email via Outlook. High risk action requiring explicit human approval.",
            category="email",
            risk_level=ToolRiskLevel.HIGH,
            required_permission="email.send",
            approval_required=True,
            input_schema={"type": "object", "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}}, "required": ["to", "subject", "body"]},
        ),
        lambda args: m365_integration.send_email(args.get("to", ""), args.get("subject", ""), args.get("body", "")),
    )

    # 3. Calendar tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_view_calendar",
            name="view_calendar",
            description="Retrieves upcoming calendar meetings and briefings.",
            category="calendar",
            risk_level=ToolRiskLevel.READ,
            required_permission="calendar.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"days_ahead": {"type": "integer"}}},
        ),
        lambda args: m365_integration.view_calendar(args.get("days_ahead", 1)),
    )

    # 4. Teams tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_search_teams",
            name="search_teams",
            description="Searches Microsoft Teams messages and channel conversations.",
            category="teams",
            risk_level=ToolRiskLevel.READ,
            required_permission="teams.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}, "channel": {"type": "string"}}},
        ),
        lambda args: m365_integration.search_teams(args.get("query", ""), args.get("channel", "project-phoenix")),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_send_teams_message",
            name="send_teams_message",
            description="Sends a message to a Microsoft Teams channel. High risk action requiring approval.",
            category="teams",
            risk_level=ToolRiskLevel.HIGH,
            required_permission="teams.send",
            approval_required=True,
            input_schema={"type": "object", "properties": {"channel": {"type": "string"}, "message": {"type": "string"}}, "required": ["channel", "message"]},
        ),
        lambda args: m365_integration.send_teams_message(args.get("channel", ""), args.get("message", "")),
    )

    # 5. Azure DevOps tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_search_azure_devops",
            name="search_azure_devops",
            description="Searches Azure DevOps work items, bugs, user stories, and sprints.",
            category="azure_devops",
            risk_level=ToolRiskLevel.READ,
            required_permission="azure_devops.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}}},
        ),
        lambda args: azure_devops_integration.search_azure_devops(args.get("query", "")),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_update_work_item",
            name="update_work_item",
            description="Updates state or comments of an Azure DevOps work item.",
            category="azure_devops",
            risk_level=ToolRiskLevel.MEDIUM,
            required_permission="azure_devops.update",
            approval_required=True,
            input_schema={"type": "object", "properties": {"id": {"type": "string"}, "state": {"type": "string"}, "comment": {"type": "string"}}, "required": ["id", "state"]},
        ),
        lambda args: azure_devops_integration.update_work_item(args.get("id", ""), args.get("state", ""), args.get("comment", "")),
    )

    # 6. GitHub tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_search_github",
            name="search_github",
            description="Searches GitHub repositories, pull requests, issues, and commits.",
            category="github",
            risk_level=ToolRiskLevel.READ,
            required_permission="github.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}, "repo": {"type": "string"}}},
        ),
        lambda args: github_integration.search_github(args.get("query", ""), args.get("repo", "phoenix-core")),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_merge_pr",
            name="merge_pr",
            description="Merges an approved GitHub pull request into base branch. High risk action requiring approval.",
            category="github",
            risk_level=ToolRiskLevel.HIGH,
            required_permission="github.merge_pr",
            approval_required=True,
            input_schema={"type": "object", "properties": {"repo": {"type": "string"}, "pr_number": {"type": "integer"}}, "required": ["repo", "pr_number"]},
        ),
        lambda args: github_integration.merge_pr(args.get("repo", ""), int(args.get("pr_number", 0))),
    )

    # 7. Slack tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_search_slack",
            name="search_slack",
            description="Searches Slack workspace channels and team conversations.",
            category="slack",
            risk_level=ToolRiskLevel.READ,
            required_permission="slack.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}, "channel": {"type": "string"}}},
        ),
        lambda args: slack_integration.search_slack(args.get("query", ""), args.get("channel", "#project-phoenix")),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_send_slack_message",
            name="send_slack_message",
            description="Sends message to a Slack channel. High risk action requiring approval.",
            category="slack",
            risk_level=ToolRiskLevel.HIGH,
            required_permission="slack.send",
            approval_required=True,
            input_schema={"type": "object", "properties": {"channel": {"type": "string"}, "text": {"type": "string"}}, "required": ["channel", "text"]},
        ),
        lambda args: slack_integration.send_slack_message(args.get("channel", ""), args.get("text", "")),
    )

    # 8. Browser & System tools
    tool_registry.register_tool(
        ToolDefinition(
            id="tool_browser_search",
            name="browser_search",
            description="Performs controlled web search using browser automation.",
            category="browser",
            risk_level=ToolRiskLevel.READ,
            required_permission="browser.read",
            approval_required=False,
            input_schema={"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
        ),
        lambda args: browser_integration.browser_search(args.get("query", "")),
    )

    tool_registry.register_tool(
        ToolDefinition(
            id="tool_get_system_status",
            name="get_windows_status",
            description="Gets Windows OS environment and execution status.",
            category="windows",
            risk_level=ToolRiskLevel.READ,
            required_permission="windows.read",
            approval_required=False,
        ),
        lambda args: windows_integration.get_system_status(),
    )


# Automatically configure tools
setup_default_tools()
