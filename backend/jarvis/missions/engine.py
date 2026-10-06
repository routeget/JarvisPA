import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from backend.jarvis.database.models import Mission
from backend.jarvis.database.db import async_session_factory


class MissionEngine:
    """
    Implements Section 35: Persistent Missions.
    Manages long-running autonomous monitoring and synchronization missions.
    """

    async def list_missions(self) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            result = await session.execute(select(Mission).order_by(Mission.created_at.desc()))
            missions = result.scalars().all()
            return [
                {
                    "id": m.id,
                    "title": m.title,
                    "objective": m.objective,
                    "schedule": m.schedule,
                    "trigger_condition": m.trigger_condition,
                    "sources": m.sources_json,
                    "tools": m.tools_json,
                    "status": m.status,
                    "last_execution": m.last_execution.isoformat() if m.last_execution else None,
                    "next_execution": m.next_execution.isoformat() if m.next_execution else None,
                }
                for m in missions
            ]

    async def create_mission(
        self,
        title: str,
        objective: str,
        schedule: Optional[str] = None,
        trigger_condition: Optional[str] = None,
        sources: Optional[List[str]] = None,
        tools: Optional[List[str]] = None,
    ) -> Mission:
        mission_id = f"mission_{uuid.uuid4().hex[:10]}"
        mission = Mission(
            id=mission_id,
            title=title,
            objective=objective,
            schedule=schedule or "0 9 * * 1-5",
            trigger_condition=trigger_condition,
            sources_json=sources or ["Outlook", "Teams"],
            tools_json=tools or ["search_email", "search_teams"],
            status="Active",
            created_at=datetime.datetime.utcnow(),
            next_execution=datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        )
        async with async_session_factory() as session:
            session.add(mission)
            await session.commit()
            await session.refresh(mission)
        return mission


mission_engine = MissionEngine()
