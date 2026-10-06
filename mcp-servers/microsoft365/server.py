import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("m365-mcp-server")

server.register_tool(
    "search_email",
    "Search Outlook emails by query",
    {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
    lambda args: [{"subject": f"Email matching {args.get('query')}", "from": "colleague@enterprise.com"}],
)

server.register_tool(
    "view_calendar",
    "View upcoming meetings",
    {"type": "object", "properties": {"days": {"type": "integer"}}},
    lambda args: [{"title": "Team Standup", "start": "10:00 AM"}],
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
