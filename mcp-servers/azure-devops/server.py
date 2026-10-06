import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("azure-devops-mcp-server")

server.register_tool(
    "search_work_items",
    "Search Azure DevOps work items and bugs",
    {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
    lambda args: [{"id": "12345", "title": f"Work item matching {args.get('query')}", "state": "Active"}],
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
