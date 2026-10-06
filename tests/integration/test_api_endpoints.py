import pytest
from httpx import AsyncClient, ASGITransport
from backend.jarvis.api.main import app
from backend.jarvis.database.db import init_db


@pytest.mark.asyncio
async def test_api_endpoints():
    await init_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "HEALTHY"

        # 2. Daily briefing
        res = await client.get("/api/v1/briefing")
        assert res.status_code == 200
        assert "briefing" in res.json()

        # 3. AI Providers
        res = await client.get("/api/v1/providers")
        assert res.status_code == 200
        assert len(res.json()) >= 6

        # 4. Connections
        res = await client.get("/api/v1/connections")
        assert res.status_code == 200
        assert len(res.json()) >= 6

        # 5. Safety status
        res = await client.get("/api/v1/safety/status")
        assert res.status_code == 200
        assert "is_emergency_stopped" in res.json()

        # 6. Test Chat API
        chat_res = await client.post("/api/v1/chat", json={
            "query": "Review today's important emails and prepare a summary.",
            "preferred_provider": "claude",
        })
        assert chat_res.status_code == 200
        data = chat_res.json()
        assert "response" in data
        assert "task_id" in data
