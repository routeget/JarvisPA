import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("filesystem-mcp-server")

server.register_tool(
    "read_file",
    "Read content of a specified file",
    {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]},
    lambda args: {"content": f"File content of {args.get('path')}"},
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
