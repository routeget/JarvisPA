import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.jarvis.database.db import init_db
from backend.jarvis.api.routes import api_router
from backend.jarvis.mcp.tools_setup import setup_default_tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed data
    await init_db()
    # Initialize default tools
    setup_default_tools()
    yield


app = FastAPI(
    title="J.A.R.V.I.S. Desktop AI Agent Platform",
    description="Backend API for J.A.R.V.I.S. Level 2 Functional & Technical Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for desktop Electron renderer & local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)


# WebSocket for real-time streaming per Section 83 & 84
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


ws_manager = ConnectionManager()


@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ping/pong or process realtime events
            await websocket.send_json({"event": "ack", "received": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "J.A.R.V.I.S. Agent Runtime",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.jarvis.api.main:app", host="127.0.0.1", port=8000, reload=False)
