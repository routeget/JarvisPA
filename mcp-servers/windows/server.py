import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("windows-mcp-server")

server.register_tool(
    "get_system_info",
    "Retrieve Windows platform and host information",
    {"type": "object", "properties": {}},
    lambda args: {"os": "Windows", "architecture": "x64", "status": "nominal"},
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
