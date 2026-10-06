import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from mcp_base import StandaloneMCPServer

server = StandaloneMCPServer("browser-mcp-server")

server.register_tool(
    "navigate_page",
    "Navigate browser to URL",
    {"type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]},
    lambda args: {"status": "success", "title": "Page Loaded", "url": args.get("url")},
)

if __name__ == "__main__":
    import json
    req = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    print(json.dumps(server.handle_request(req)))
