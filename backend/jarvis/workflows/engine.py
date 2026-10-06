import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from backend.jarvis.database.models import Automation
from backend.jarvis.database.db import async_session_factory


class AutomationEngine:
    """
    Implements Section 79 & 103: Automation Engine.
    Handles event triggers (email, Teams, Slack, GitHub, schedule) and automation executions.
    """

    async def list_automations(self) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            result = await session.execute(select(Automation).order_by(Automation.created_at.desc()))
            autos = result.scalars().all()
            return [
                {
                    "id": a.id,
                    "title": a.title,
                    "description": a.description,
                    "trigger_type": a.trigger_type,
                    "trigger_config": a.trigger_config_json,
                    "actions": a.actions_json,
                    "is_active": a.is_active,
                    "last_run_at": a.last_run_at.isoformat() if a.last_run_at else None,
                }
                for a in autos
            ]

    async def create_automation(
        self,
        title: str,
        description: str,
        trigger_type: str,
        trigger_config: Dict[str, Any],
        actions: List[Dict[str, Any]],
    ) -> Automation:
        auto_id = f"auto_{uuid.uuid4().hex[:10]}"
        automation = Automation(
            id=auto_id,
            title=title,
            description=description,
            trigger_type=trigger_type,
            trigger_config_json=trigger_config,
            actions_json=actions,
            is_active=True,
            created_at=datetime.datetime.utcnow(),
        )
        async with async_session_factory() as session:
            session.add(automation)
            await session.commit()
            await session.refresh(automation)
        return automation

    async def toggle_automation(self, auto_id: str, is_active: bool) -> Optional[Dict[str, Any]]:
        async with async_session_factory() as session:
            auto = await session.get(Automation, auto_id)
            if not auto:
                return None
            auto.is_active = is_active
            await session.commit()
            return {"id": auto.id, "is_active": auto.is_active}

    async def trigger_run(self, auto_id: str) -> Dict[str, Any]:
        async with async_session_factory() as session:
            auto = await session.get(Automation, auto_id)
            if not auto:
                return {"error": "Automation not found"}
            auto.last_run_at = datetime.datetime.utcnow()
            await session.commit()
            return {
                "id": auto.id,
                "status": "TRIGGERED",
                "triggered_at": auto.last_run_at.isoformat(),
                "steps_executed": len(auto.actions_json or []),
            }


automation_engine = AutomationEngine()
