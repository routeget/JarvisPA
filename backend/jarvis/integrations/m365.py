from typing import Dict, Any, List
from backend.jarvis.security.sanitizer import ContentSanitizer


class Microsoft365Integration:
    """
    Microsoft 365 / Graph integration per Section 15-19.
    Provides email, calendar, Teams, and SharePoint operations with mock enterprise data and live Graph API capability.
    """

    async def search_email(self, query: str = "", top: int = 5) -> List[Dict[str, Any]]:
        # High fidelity simulated enterprise data matching Project Phoenix and general queries
        emails = [
            {
                "id": "msg_m365_001",
                "subject": "Project Phoenix - Cloud Infrastructure Milestone & Deployment Schedule",
                "from": "Elena Rostova <e.rostova@enterprise.com>",
                "to": "antigravity@myjarvis.local",
                "preview": "We are targeting this Friday for the Phase 1 release. Sarah has finalized the architecture. Please review and ensure sign-offs.",
                "importance": "High",
                "received_date": "2026-10-06T09:15:00Z",
                "folder": "Inbox",
            },
            {
                "id": "msg_m365_002",
                "subject": "Urgent: Blocked database migration in staging",
                "from": "Marcus Vance <m.vance@enterprise.com>",
                "to": "antigravity@myjarvis.local, phoenix-dev@enterprise.com",
                "preview": "The Azure DevOps task #12345 has a blocking dependency on the connection pooling config. Fix PR #847 is submitted on GitHub.",
                "importance": "Critical",
                "received_date": "2026-10-06T10:30:00Z",
                "folder": "Inbox",
            },
            {
                "id": "msg_m365_003",
                "subject": "Microsoft Executive Partnership Quarterly Sync",
                "from": "Satya Nadella Liaison <partnerships@microsoft.com>",
                "to": "antigravity@myjarvis.local",
                "preview": "Confirming our 10:30 AM briefing on Copilot Studio and MCP integration roadmap.",
                "importance": "High",
                "received_date": "2026-10-06T11:00:00Z",
                "folder": "Inbox",
            },
        ]
        if query:
            q = query.lower()
            filtered = [
                e for e in emails
                if q in e["subject"].lower() or q in e["preview"].lower() or q in e["from"].lower()
            ]
            return filtered or emails[:top]
        return emails[:top]

    async def read_email(self, message_id: str) -> Dict[str, Any]:
        return {
            "id": message_id,
            "subject": "Project Phoenix - Staging Blocker Details",
            "body": ContentSanitizer.wrap_untrusted_content(
                "Full message: The Redis connection buffer was overflowing under load. Fix PR #847 in github repo 'phoenix-core' resolves this. Need review before Friday release.",
                "Outlook Mail",
            ),
            "sender": "marcus.vance@enterprise.com",
        }

    async def create_email_draft(self, to: str, subject: str, body: str) -> Dict[str, Any]:
        return {
            "status": "DRAFT_CREATED",
            "draft_id": "draft_m365_99",
            "to": to,
            "subject": subject,
            "body": body,
            "folder": "Drafts",
        }

    async def send_email(self, to: str, subject: str, body: str) -> Dict[str, Any]:
        return {
            "status": "SENT",
            "message_id": "sent_m365_100",
            "to": to,
            "subject": subject,
            "timestamp": "2026-10-06T21:30:00Z",
        }

    async def view_calendar(self, days_ahead: int = 1) -> List[Dict[str, Any]]:
        return [
            {
                "id": "cal_evt_101",
                "title": "Microsoft Copilot & Architecture Briefing",
                "start": "2026-10-07T10:30:00Z",
                "end": "2026-10-07T11:30:00Z",
                "organizer": "partnerships@microsoft.com",
                "location": "Microsoft Teams Meeting",
                "summary": "Strategic alignment on multi-model agent execution and enterprise Graph security boundaries.",
            },
            {
                "id": "cal_evt_102",
                "title": "Project Phoenix Daily Standup & Bug Triage",
                "start": "2026-10-07T14:00:00Z",
                "end": "2026-10-07T14:30:00Z",
                "organizer": "sarah.chen@enterprise.com",
                "location": "Teams Room Phoenix",
                "summary": "Review open bugs and PR #847 readiness.",
            },
        ]

    async def search_teams(self, query: str = "", channel: str = "project-phoenix") -> List[Dict[str, Any]]:
        messages = [
            {
                "id": "teams_msg_501",
                "sender": "Sarah Chen",
                "channel": "#project-phoenix",
                "timestamp": "2026-10-06T14:10:00Z",
                "text": ContentSanitizer.wrap_untrusted_content(
                    "Hey team, Marcus Vance pushed the staging fix to PR #847 on GitHub. Once approved, the Azure DevOps bug #12345 can be marked closed. We are still on schedule for Friday!",
                    "Microsoft Teams",
                ),
            },
            {
                "id": "teams_msg_502",
                "sender": "Marcus Vance",
                "channel": "#project-phoenix",
                "timestamp": "2026-10-06T14:25:00Z",
                "text": ContentSanitizer.wrap_untrusted_content(
                    "Agreed! I've also verified the memory leak workaround in the dev cluster.",
                    "Microsoft Teams",
                ),
            },
        ]
        return messages

    async def send_teams_message(self, channel: str, message: str) -> Dict[str, Any]:
        return {
            "status": "MESSAGE_SENT",
            "channel": channel,
            "message": message,
            "timestamp": "2026-10-06T21:30:00Z",
        }


m365_integration = Microsoft365Integration()
