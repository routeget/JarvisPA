import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from backend.jarvis.database.models import Notification
from backend.jarvis.database.db import async_session_factory


class NotificationManager:
    """
    Manages notifications per Section 61 across Desktop, In-App, and Tray.
    """

    async def emit_notification(
        self,
        title: str,
        message: str,
        severity: str = "INFO",
        category: str = "system",
        action_url: Optional[str] = None,
    ) -> Notification:
        notif_id = f"notif_{uuid.uuid4().hex[:10]}"
        notif = Notification(
            id=notif_id,
            title=title,
            message=message,
            severity=severity.upper(),
            category=category,
            is_read=False,
            action_url=action_url,
            created_at=datetime.datetime.utcnow(),
        )
        async with async_session_factory() as session:
            session.add(notif)
            await session.commit()
            await session.refresh(notif)
        return notif

    async def list_notifications(self, unread_only: bool = False) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            stmt = select(Notification).order_by(Notification.created_at.desc())
            if unread_only:
                stmt = stmt.where(Notification.is_read == False)
            result = await session.execute(stmt)
            notifs = result.scalars().all()
            return [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "severity": n.severity,
                    "category": n.category,
                    "is_read": n.is_read,
                    "action_url": n.action_url,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                }
                for n in notifs
            ]

    async def mark_read(self, notification_id: str) -> bool:
        async with async_session_factory() as session:
            n = await session.get(Notification, notification_id)
            if n:
                n.is_read = True
                await session.commit()
                return True
            return False


notification_manager = NotificationManager()
