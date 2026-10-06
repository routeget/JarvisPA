import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("google-workspace-mcp-server")

server.register_tool(
    "search_drive",
    "Search Google Drive files and documents",
    {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
    lambda args: [{"name": f"Document on {args.get('query')}", "type": "Google Doc"}],
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
