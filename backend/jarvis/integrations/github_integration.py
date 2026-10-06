from typing import Dict, Any, List
from backend.jarvis.security.sanitizer import ContentSanitizer


class GitHubIntegration:
    """
    GitHub integration per Section 22-23.
    Provides repository search, issues, pull requests, commits, and PR actions.
    """

    async def search_github(self, query: str = "", repo: str = "phoenix-core") -> List[Dict[str, Any]]:
        prs_and_issues = [
            {
                "id": "PR-847",
                "number": 847,
                "type": "PullRequest",
                "title": "Fix(staging): Increase connection pool threshold and optimize asyncpg retry backoff",
                "state": "open",
                "author": "marcus-vance",
                "repo": "MyCompany/phoenix-core",
                "ci_status": "passing",
                "reviews": "1 approval (Sarah Chen), 0 changes requested",
                "description": ContentSanitizer.wrap_untrusted_content(
                    "Resolves Azure DevOps #12345. Benchmarked under 5,000 req/sec without pool exhaustion.",
                    "GitHub PR #847",
                ),
            },
            {
                "id": "Issue-312",
                "number": 312,
                "type": "Issue",
                "title": "Security audit: Verify DPAPI secret encryption in Windows desktop package",
                "state": "open",
                "author": "elena-rostova",
                "repo": "MyCompany/jarvis-desktop",
                "ci_status": "passing",
                "description": "Ensure zero plain-text tokens exist in app config or renderer bundle.",
            },
        ]
        if query:
            q = query.lower()
            return [
                item for item in prs_and_issues
                if q in item["title"].lower() or str(item.get("number")) in q
            ]
        return prs_and_issues

    async def merge_pr(self, repo: str, pr_number: int, commit_title: str = "") -> Dict[str, Any]:
        return {
            "status": "MERGED",
            "repo": repo,
            "pr_number": pr_number,
            "commit_title": commit_title or f"Merge PR #{pr_number}",
            "merged_at": "2026-10-06T21:30:00Z",
        }

    async def create_issue(self, repo: str, title: str, body: str) -> Dict[str, Any]:
        return {
            "status": "CREATED",
            "repo": repo,
            "number": 313,
            "title": title,
            "body": body,
            "created_at": "2026-10-06T21:30:00Z",
        }


github_integration = GitHubIntegration()
