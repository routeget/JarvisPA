import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("slack-mcp-server")

server.register_tool(
    "search_messages",
    "Search Slack messages across channels",
    {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
    lambda args: [{"channel": "#general", "text": f"Found {args.get('query')}"}],
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
