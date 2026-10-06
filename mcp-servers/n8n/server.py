import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("n8n-mcp-server")

server.register_tool(
    "execute_workflow",
    "Trigger an n8n automation workflow",
    {"type": "object", "properties": {"workflow_id": {"type": "string"}}, "required": ["workflow_id"]},
    lambda args: {"workflow_id": args.get("workflow_id"), "status": "executed", "timestamp": "2026-10-06T21:30:00Z"},
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
