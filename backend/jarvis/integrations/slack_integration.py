from typing import Dict, Any, List
from backend.jarvis.security.sanitizer import ContentSanitizer


class SlackIntegration:
    """
    Slack integration per Section 24.
    """

    async def search_slack(self, query: str = "", channel: str = "#project-phoenix") -> List[Dict[str, Any]]:
        messages = [
            {
                "id": "slack_msg_901",
                "user": "Sarah Chen",
                "channel": "#project-phoenix",
                "timestamp": "2026-10-06T15:20:00Z",
                "text": ContentSanitizer.wrap_untrusted_content(
                    "@here Reminder: Staging dry-run for Project Phoenix is tomorrow at 11 AM. Please ensure PR #847 is merged so tests can run cleanly.",
                    "Slack #project-phoenix",
                ),
            },
            {
                "id": "slack_msg_902",
                "user": "David Kim (QA)",
                "channel": "#project-phoenix",
                "timestamp": "2026-10-06T15:45:00Z",
                "text": ContentSanitizer.wrap_untrusted_content(
                    "QA test matrix passed on the local branch with PR #847 fix. No regression detected.",
                    "Slack #project-phoenix",
                ),
            },
        ]
        if query:
            q = query.lower()
            return [m for m in messages if q in m["text"].lower() or q in m["user"].lower()]
        return messages

    async def send_slack_message(self, channel: str, text: str) -> Dict[str, Any]:
        return {
            "status": "SENT",
            "channel": channel,
            "text": text,
            "ts": "1728249000.000100",
        }


slack_integration = SlackIntegration()
