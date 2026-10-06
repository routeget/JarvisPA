import uuid
import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.future import select
from backend.jarvis.database.models import Approval
from backend.jarvis.database.db import async_session_factory


class ApprovalManager:
    """
    Manages action approvals per Section 3.3, 47, and 128.
    Provides pending approvals list, decision logging, and execution resumption.
    """

    async def create_approval_request(
        self,
        task_id: str,
        tool_name: str,
        title: str,
        description: str,
        risk_level: str,
        payload: Dict[str, Any],
        target_resource: Optional[str] = None,
    ) -> Approval:
        approval_id = f"appr_{uuid.uuid4().hex[:12]}"
        approval = Approval(
            id=approval_id,
            task_id=task_id,
            tool_call_id=None,
            title=title,
            description=description,
            action_type=tool_name,
            risk_level=risk_level,
            target_resource=target_resource or tool_name,
            status="PENDING",
            payload_json=payload,
            requested_at=datetime.datetime.utcnow(),
        )

        async with async_session_factory() as session:
            session.add(approval)
            await session.commit()
            await session.refresh(approval)

        return approval

    async def get_pending_approvals(self) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            result = await session.execute(
                select(Approval).where(Approval.status == "PENDING").order_by(Approval.requested_at.desc())
            )
            approvals = result.scalars().all()
            return [
                {
                    "id": a.id,
                    "task_id": a.task_id,
                    "title": a.title,
                    "description": a.description,
                    "action_type": a.action_type,
                    "risk_level": a.risk_level,
                    "target_resource": a.target_resource,
                    "status": a.status,
                    "payload": a.payload_json,
                    "requested_at": a.requested_at.isoformat() if a.requested_at else None,
                }
                for a in approvals
            ]

    async def decide_approval(
        self,
        approval_id: str,
        decision: str,  # APPROVED or REJECTED
        reason: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        async with async_session_factory() as session:
            approval = await session.get(Approval, approval_id)
            if not approval:
                return None

            approval.status = decision.upper()
            approval.decision_reason = reason or ("Approved by user" if decision.upper() == "APPROVED" else "Rejected by user")
            approval.decided_at = datetime.datetime.utcnow()
            await session.commit()
            await session.refresh(approval)

            return {
                "id": approval.id,
                "status": approval.status,
                "task_id": approval.task_id,
                "decision_reason": approval.decision_reason,
                "action_type": approval.action_type,
                "payload": approval.payload_json,
            }


approval_manager = ApprovalManager()
