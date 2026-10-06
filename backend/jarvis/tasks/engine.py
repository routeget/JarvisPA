import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from backend.jarvis.database.models import Task, TaskExecution, ToolCall
from backend.jarvis.database.db import async_session_factory


class TaskEngine:
    """
    Manages task lifecycle, background executions, traces, and cancellation per Section 33, 34, 85, 102.
    """

    async def create_task(
        self,
        title: str,
        description: str = "",
        priority: str = "MEDIUM",
        assigned_agent: str = "Supervisor",
        plan: Optional[Dict[str, Any]] = None,
    ) -> Task:
        task_id = f"task_{uuid.uuid4().hex[:10]}"
        task = Task(
            id=task_id,
            title=title,
            description=description,
            priority=priority,
            assigned_agent=assigned_agent,
            status="Running",
            plan_json=plan or {},
            created_at=datetime.datetime.utcnow(),
        )
        async with async_session_factory() as session:
            session.add(task)
            await session.commit()
            await session.refresh(task)
        return task

    async def record_execution_step(
        self,
        task_id: str,
        step_name: str,
        status: str = "Completed",
        input_data: Optional[Dict[str, Any]] = None,
        output_data: Optional[Dict[str, Any]] = None,
        duration_ms: int = 0,
    ) -> None:
        exec_id = f"exec_{uuid.uuid4().hex[:10]}"
        execution = TaskExecution(
            id=exec_id,
            task_id=task_id,
            step_name=step_name,
            status=status,
            input_json=input_data or {},
            output_json=output_data or {},
            duration_ms=duration_ms,
            created_at=datetime.datetime.utcnow(),
        )
        async with async_session_factory() as session:
            session.add(execution)
            await session.commit()

    async def update_task_status(
        self,
        task_id: str,
        status: str,
        summary: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        async with async_session_factory() as session:
            task = await session.get(Task, task_id)
            if task:
                task.status = status
                if summary:
                    task.result_summary = summary
                if error:
                    task.error_message = error
                if status in ("Completed", "Failed", "Cancelled"):
                    task.completed_at = datetime.datetime.utcnow()
                await session.commit()

    async def cancel_task(self, task_id: str) -> bool:
        async with async_session_factory() as session:
            task = await session.get(Task, task_id)
            if task and task.status in ("Pending", "Running", "Waiting for approval"):
                task.status = "Cancelled"
                task.completed_at = datetime.datetime.utcnow()
                await session.commit()
                return True
            return False

    async def get_all_tasks(self) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            result = await session.execute(select(Task).order_by(Task.created_at.desc()))
            tasks = result.scalars().all()
            task_list = []
            for t in tasks:
                task_list.append({
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "status": t.status,
                    "priority": t.priority,
                    "assigned_agent": t.assigned_agent,
                    "plan": t.plan_json,
                    "result_summary": t.result_summary,
                    "error_message": t.error_message,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                    "completed_at": t.completed_at.isoformat() if t.completed_at else None,
                })
            return task_list


task_engine = TaskEngine()
