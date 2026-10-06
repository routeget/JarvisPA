import asyncio
from typing import Dict, Any, List
from backend.jarvis.integrations.m365 import m365_integration
from backend.jarvis.integrations.azure_devops import azure_devops_integration
from backend.jarvis.integrations.github_integration import github_integration
from backend.jarvis.integrations.slack_integration import slack_integration
from backend.jarvis.integrations.google_integration import google_workspace_integration


class UnifiedSearchEngine:
    """
    Implements Section 69-70: Unified Cross-System Search across
    Outlook, Teams, Azure DevOps, GitHub, Slack, and Google Workspace.
    """

    async def search_all(self, query: str) -> Dict[str, Any]:
        # Execute cross-system queries in parallel
        results = await asyncio.gather(
            m365_integration.search_email(query),
            m365_integration.search_teams(query),
            azure_devops_integration.search_azure_devops(query),
            github_integration.search_github(query),
            slack_integration.search_slack(query),
            google_workspace_integration.search_google_drive(query),
            return_exceptions=True,
        )

        emails = results[0] if isinstance(results[0], list) else []
        teams = results[1] if isinstance(results[1], list) else []
        devops = results[2] if isinstance(results[2], list) else []
        github = results[3] if isinstance(results[3], list) else []
        slack = results[4] if isinstance(results[4], list) else []
        drive = results[5] if isinstance(results[5], list) else []

        # Correlate citations & sources per Section 117
        sources = []
        for e in emails:
            sources.append({
                "system": "Outlook Mail",
                "title": e.get("subject"),
                "sender": e.get("from"),
                "date": e.get("received_date"),
                "citation": f"Outlook: '{e.get('subject')}' from {e.get('from')}",
                "data": e,
            })
        for t in teams:
            sources.append({
                "system": "Microsoft Teams",
                "title": f"Teams message in {t.get('channel')}",
                "sender": t.get("sender"),
                "date": t.get("timestamp"),
                "citation": f"Teams ({t.get('channel')}): {t.get('sender')}",
                "data": t,
            })
        for d in devops:
            sources.append({
                "system": "Azure DevOps",
                "title": f"Work Item #{d.get('id')}: {d.get('title')}",
                "type": d.get("type"),
                "assigned_to": d.get("assigned_to"),
                "citation": f"Azure DevOps #{d.get('id')} ({d.get('type')}) - {d.get('title')}",
                "data": d,
            })
        for g in github:
            sources.append({
                "system": "GitHub",
                "title": f"{g.get('type')} #{g.get('number')}: {g.get('title')}",
                "repo": g.get("repo"),
                "citation": f"GitHub ({g.get('repo')}) #{g.get('number')} - {g.get('title')}",
                "data": g,
            })
        for s in slack:
            sources.append({
                "system": "Slack",
                "title": f"Slack message in {s.get('channel')}",
                "sender": s.get("user"),
                "citation": f"Slack ({s.get('channel')}): {s.get('user')}",
                "data": s,
            })
        for dr in drive:
            sources.append({
                "system": "Google Drive",
                "title": dr.get("name"),
                "owner": dr.get("owner"),
                "citation": f"Google Drive: {dr.get('name')}",
                "data": dr,
            })

        return {
            "query": query,
            "total_items": len(sources),
            "sources": sources,
            "breakdown": {
                "emails_count": len(emails),
                "teams_count": len(teams),
                "azure_devops_count": len(devops),
                "github_count": len(github),
                "slack_count": len(slack),
                "drive_count": len(drive),
            },
        }


unified_search_engine = UnifiedSearchEngine()
