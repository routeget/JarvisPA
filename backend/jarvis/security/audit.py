import uuid
import datetime
import hashlib
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from backend.jarvis.database.models import AuditLog
from backend.jarvis.database.db import async_session_factory


class AuditLogger:
    """
    Implements Section 60: Audit Logging.
    Records every significant agent, tool, approval, and security event with argument hashing.
    """

    async def log_event(
        self,
        task_id: Optional[str] = None,
        user_id: Optional[str] = "user_default",
        provider: Optional[str] = None,
        model: Optional[str] = None,
        tool: Optional[str] = None,
        arguments: Optional[Dict[str, Any]] = None,
        result_status: str = "SUCCESS",
        approval_status: Optional[str] = None,
        duration_ms: int = 0,
        classification: str = "INTERNAL",
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        # Calculate SHA256 hash of arguments for privacy & non-repudiation
        args_str = str(sorted(arguments.items())) if arguments else ""
        args_hash = hashlib.sha256(args_str.encode("utf-8")).hexdigest()[:16] if args_str else None

        entry = AuditLog(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            timestamp=datetime.datetime.utcnow(),
            user_id=user_id,
            task_id=task_id,
            provider=provider,
            model=model,
            tool=tool,
            arguments_hash=args_hash,
            result_status=result_status,
            approval_status=approval_status,
            duration_ms=duration_ms,
            classification=classification,
            details_json=details or {},
        )

        async with async_session_factory() as session:
            session.add(entry)
            await session.commit()
            await session.refresh(entry)

        return entry

    async def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            result = await session.execute(
                select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
            )
            logs = result.scalars().all()
            return [
                {
                    "id": l.id,
                    "timestamp": l.timestamp.isoformat() if l.timestamp else None,
                    "user_id": l.user_id,
                    "task_id": l.task_id,
                    "provider": l.provider,
                    "model": l.model,
                    "tool": l.tool,
                    "arguments_hash": l.arguments_hash,
                    "result_status": l.result_status,
                    "approval_status": l.approval_status,
                    "duration_ms": l.duration_ms,
                    "classification": l.classification,
                    "details": l.details_json,
                }
                for l in logs
            ]


audit_logger = AuditLogger()
