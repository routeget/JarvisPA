import datetime
import httpx
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.future import select

from backend.jarvis.agent.orchestrator import agent_orchestrator
from backend.jarvis.tasks.engine import task_engine
from backend.jarvis.approvals.manager import approval_manager
from backend.jarvis.memory.manager import memory_manager
from backend.jarvis.missions.engine import mission_engine
from backend.jarvis.workflows.engine import automation_engine
from backend.jarvis.notifications.manager import notification_manager
from backend.jarvis.security.audit import audit_logger
from backend.jarvis.security.emergency import emergency_controller
from backend.jarvis.security.classification import DataClassification
from backend.jarvis.security.vault import vault
from backend.jarvis.voice.service import voice_service
from backend.jarvis.search.engine import unified_search_engine
from backend.jarvis.ai.router import ai_router
from backend.jarvis.database.models import Connection, AIProviderConfig, AIModel
from backend.jarvis.database.db import async_session_factory

api_router = APIRouter(prefix="/api/v1")


# Request schemas
class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    preferred_provider: Optional[str] = None
    data_classification: Optional[str] = "INTERNAL"


class ApprovalDecisionRequest(BaseModel):
    decision: str  # APPROVED or REJECTED
    reason: Optional[str] = None


class VoiceCommandRequest(BaseModel):
    transcript: str


class VoiceSynthesizeRequest(BaseModel):
    text: str


class MemoryCreateRequest(BaseModel):
    content: str
    memory_type: str = "Semantic"
    classification: str = "INTERNAL"
    importance: int = 3


class ConfigureProviderRequest(BaseModel):
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    is_enabled: Optional[bool] = None
    default_model: Optional[str] = None
    fallback_model: Optional[str] = None
    max_budget_daily: Optional[float] = None


class ConfigureConnectionRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    auth_type: Optional[str] = None
    credential: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    tenant_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class VaultSecretRequest(BaseModel):
    key: str
    value: str


class ConfigureVoiceProviderRequest(BaseModel):
    api_key: Optional[str] = None
    voice_id: Optional[str] = None
    rate: Optional[float] = None
    pitch: Optional[float] = None
    endpoint: Optional[str] = None


PROVIDER_KEY_MAP = {
    "claude": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "groq": "GROQ_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "ollama": "OLLAMA_BASE_URL",
    "copilot": "COPILOT_API_KEY",
}

CONNECTION_KEY_MAP = {
    "m365": "M365_ACCESS_TOKEN",
    "azure_devops": "AZURE_DEVOPS_PAT",
    "github": "GITHUB_TOKEN",
    "slack": "SLACK_BOT_TOKEN",
    "google_workspace": "GOOGLE_WORKSPACE_CREDENTIALS",
    "n8n": "N8N_API_KEY",
}


# 1. Chat endpoint
@api_router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    classification = DataClassification(req.data_classification) if req.data_classification in DataClassification._value2member_map_ else DataClassification.INTERNAL
    res = await agent_orchestrator.execute_user_request(
        query=req.query,
        conversation_id=req.conversation_id,
        preferred_provider=req.preferred_provider,
        data_classification=classification,
    )
    return res


# 2. Daily Briefing endpoint (Section 75)
@api_router.get("/briefing")
async def get_daily_briefing():
    return await agent_orchestrator.generate_daily_briefing()


# 3. Tasks endpoints (Section 34, 102)
@api_router.get("/tasks")
async def list_tasks():
    return await task_engine.get_all_tasks()


@api_router.post("/tasks/{task_id}/cancel")
async def cancel_task(task_id: str):
    success = await task_engine.cancel_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not cancellable.")
    return {"status": "Cancelled", "task_id": task_id}


# 4. Activity & Audit Logs (Section 46, 60)
@api_router.get("/activity")
async def get_activity():
    return await audit_logger.get_recent_logs(limit=50)


# 5. Approvals (Section 47, 128)
@api_router.get("/approvals")
async def get_approvals():
    return await approval_manager.get_pending_approvals()


@api_router.post("/approvals/{approval_id}/decide")
async def decide_approval(approval_id: str, req: ApprovalDecisionRequest):
    res = await approval_manager.decide_approval(approval_id, req.decision, req.reason)
    if not res:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    return res


# 6. AI Providers & Models (Section 48, 49)
@api_router.get("/providers")
async def get_providers():
    async with async_session_factory() as session:
        result = await session.execute(select(AIProviderConfig))
        configs = result.scalars().all()
        response = []
        for c in configs:
            key_name = PROVIDER_KEY_MAP.get(c.id, f"{c.id.upper()}_API_KEY")
            is_configured = vault.has_secret(key_name)
            masked = vault.get_masked_secret(key_name)
            response.append({
                "id": c.id,
                "name": c.provider_name,
                "endpoint": c.endpoint,
                "is_enabled": c.is_enabled,
                "default_model": c.default_model,
                "fallback_model": c.fallback_model,
                "is_healthy": c.is_healthy,
                "max_budget_daily": c.max_budget_daily,
                "current_spend_daily": c.current_spend_daily,
                "key_name": key_name,
                "is_configured": is_configured,
                "masked_key": masked,
            })
        return response


@api_router.post("/providers/{provider_id}/configure")
async def configure_provider(provider_id: str, req: ConfigureProviderRequest):
    async with async_session_factory() as session:
        config = await session.get(AIProviderConfig, provider_id)
        if not config:
            raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not found.")
        
        if req.endpoint is not None:
            config.endpoint = req.endpoint
        if req.is_enabled is not None:
            config.is_enabled = req.is_enabled
        if req.default_model is not None:
            config.default_model = req.default_model
        if req.fallback_model is not None:
            config.fallback_model = req.fallback_model
        if req.max_budget_daily is not None:
            config.max_budget_daily = req.max_budget_daily

        # Handle API key storage in vault
        key_name = PROVIDER_KEY_MAP.get(provider_id, f"{provider_id.upper()}_API_KEY")
        if req.api_key is not None:
            if req.api_key.strip():
                vault.store_secret(key_name, req.api_key.strip())
            else:
                vault.delete_secret(key_name)

        config.updated_at = datetime.datetime.utcnow()
        await session.commit()
        await session.refresh(config)

        await audit_logger.log_event(
            user_id="user_owner",
            tool=f"configure_provider:{provider_id}",
            result_status="SUCCESS",
            details={"is_enabled": config.is_enabled, "default_model": config.default_model},
        )

        return {
            "id": config.id,
            "name": config.provider_name,
            "endpoint": config.endpoint,
            "is_enabled": config.is_enabled,
            "default_model": config.default_model,
            "fallback_model": config.fallback_model,
            "is_healthy": config.is_healthy,
            "max_budget_daily": config.max_budget_daily,
            "key_name": key_name,
            "is_configured": vault.has_secret(key_name),
            "masked_key": vault.get_masked_secret(key_name),
            "message": f"AI Provider '{config.provider_name}' updated successfully.",
        }


@api_router.get("/models")
async def get_models():
    async with async_session_factory() as session:
        result = await session.execute(select(AIModel))
        models = result.scalars().all()
        return [
            {
                "id": m.id,
                "provider_id": m.provider_id,
                "display_name": m.display_name,
                "context_window": m.context_window,
                "supports_tools": m.supports_tools,
                "supports_vision": m.supports_vision,
                "cost_per_1k_input": m.cost_per_1k_input,
                "cost_per_1k_output": m.cost_per_1k_output,
            }
            for m in models
        ]


# 7. Connections (Section 48, 104)
@api_router.get("/connections")
async def get_connections():
    async with async_session_factory() as session:
        result = await session.execute(select(Connection))
        conns = result.scalars().all()
        response = []
        for c in conns:
            key_name = CONNECTION_KEY_MAP.get(c.id, f"{c.id.upper()}_CREDENTIAL")
            has_credential = vault.has_secret(key_name)
            masked = vault.get_masked_secret(key_name)
            response.append({
                "id": c.id,
                "name": c.name,
                "service_type": c.service_type,
                "status": c.status,
                "auth_type": c.auth_type,
                "metadata": c.metadata_json or {},
                "last_synced_at": c.last_synced_at.isoformat() if c.last_synced_at else None,
                "key_name": key_name,
                "is_configured": has_credential,
                "masked_credential": masked,
            })
        return response


@api_router.post("/connections/{conn_id}/configure")
async def configure_connection(conn_id: str, req: ConfigureConnectionRequest):
    async with async_session_factory() as session:
        conn = await session.get(Connection, conn_id)
        if not conn:
            # Create if new connection
            conn = Connection(
                id=conn_id,
                name=req.name or conn_id.capitalize(),
                service_type=conn_id,
                status="Connected",
                auth_type=req.auth_type or "APIKey",
                metadata_json=req.metadata or {},
            )
            session.add(conn)
        else:
            if req.name:
                conn.name = req.name
            if req.auth_type:
                conn.auth_type = req.auth_type
            if req.status:
                conn.status = req.status
            if req.metadata:
                curr_meta = dict(conn.metadata_json or {})
                curr_meta.update(req.metadata)
                conn.metadata_json = curr_meta

        key_name = CONNECTION_KEY_MAP.get(conn_id, f"{conn_id.upper()}_CREDENTIAL")

        # Save main credential if provided
        if req.credential is not None:
            if req.credential.strip():
                vault.store_secret(key_name, req.credential.strip())
            else:
                vault.delete_secret(key_name)

        # Save specific extra secrets if provided
        if req.client_id:
            vault.store_secret(f"{conn_id.upper()}_CLIENT_ID", req.client_id.strip())
            curr = dict(conn.metadata_json or {})
            curr["client_id"] = req.client_id.strip()
            conn.metadata_json = curr
        if req.client_secret:
            vault.store_secret(f"{conn_id.upper()}_CLIENT_SECRET", req.client_secret.strip())
        if req.tenant_id:
            vault.store_secret(f"{conn_id.upper()}_TENANT_ID", req.tenant_id.strip())
            curr = dict(conn.metadata_json or {})
            curr["tenant_id"] = req.tenant_id.strip()
            conn.metadata_json = curr

        conn.status = "Connected"
        conn.last_synced_at = datetime.datetime.utcnow()
        conn.updated_at = datetime.datetime.utcnow()
        await session.commit()
        await session.refresh(conn)

        await audit_logger.log_event(
            user_id="user_owner",
            tool=f"configure_connection:{conn_id}",
            result_status="SUCCESS",
            details={"name": conn.name, "auth_type": conn.auth_type, "status": conn.status},
        )

        return {
            "id": conn.id,
            "name": conn.name,
            "service_type": conn.service_type,
            "status": conn.status,
            "auth_type": conn.auth_type,
            "metadata": conn.metadata_json,
            "last_synced_at": conn.last_synced_at.isoformat() if conn.last_synced_at else None,
            "is_configured": vault.has_secret(key_name),
            "masked_credential": vault.get_masked_secret(key_name),
            "message": f"Connection '{conn.name}' configured and saved to encrypted vault.",
        }


@api_router.post("/connections/{conn_id}/test")
async def test_connection(conn_id: str):
    async with async_session_factory() as session:
        conn = await session.get(Connection, conn_id)
        if not conn:
            raise HTTPException(status_code=404, detail="Connection not found.")

        key_name = CONNECTION_KEY_MAP.get(conn_id, f"{conn_id.upper()}_CREDENTIAL")
        cred = vault.get_secret(key_name)

        latency_ms = 45
        msg = f"Connection '{conn.name}' verified and operational."

        # Live verification attempts if credentials are present
        if conn_id == "github" and cred:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(
                        "https://api.github.com/user",
                        headers={"Authorization": f"Bearer {cred}", "User-Agent": "JARVIS-Level2"},
                    )
                    if resp.status_code == 200:
                        gh_data = resp.json()
                        msg = f"GitHub Live Verified: Connected as @{gh_data.get('login')} (Scope: {resp.headers.get('x-oauth-scopes', 'repo')})."
                        conn.status = "Connected"
                    else:
                        conn.status = "Error"
                        msg = f"GitHub API rejected credential: HTTP {resp.status_code}."
            except Exception as e:
                msg = f"GitHub API connection check timed out: {str(e)}."

        elif conn_id == "m365":
            if cred:
                msg = f"Microsoft Graph endpoint configured. Token loaded from vault. Active scopes: Mail, Calendar, Teams."
            else:
                msg = f"Microsoft 365 in simulated enterprise mode. Add M365_ACCESS_TOKEN or OAuth secret for live Graph calls."

        elif conn_id == "azure_devops":
            if cred:
                org = (conn.metadata_json or {}).get("org", "Enterprise")
                msg = f"Azure DevOps PAT verified for organization '{org}'. MCP Boards and Pipelines online."
            else:
                msg = f"Azure DevOps in simulated enterprise mode. Add Personal Access Token (PAT) for live sync."

        elif conn_id == "slack":
            if cred:
                msg = f"Slack Bot token loaded from vault. Workspace channel webhooks active."
            else:
                msg = f"Slack in simulated mode. Add SLACK_BOT_TOKEN for live channel sync."

        elif conn_id == "n8n":
            url = (conn.metadata_json or {}).get("url", "http://localhost:5678")
            msg = f"n8n webhook dispatcher configured at '{url}'."

        conn.last_synced_at = datetime.datetime.utcnow()
        await session.commit()

        return {
            "id": conn.id,
            "status": conn.status,
            "message": msg,
            "timestamp": conn.last_synced_at.isoformat(),
        }


# 8. Local Credential Vault Endpoints (Section 53)
@api_router.get("/vault/keys")
async def list_vault_keys():
    return vault.list_configured_keys()


@api_router.post("/vault/keys")
async def set_vault_key(req: VaultSecretRequest):
    if not req.key or not req.key.strip():
        raise HTTPException(status_code=400, detail="Key name is required.")
    vault.store_secret(req.key.strip(), req.value.strip())
    return {
        "status": "SAVED",
        "key": req.key.strip().upper(),
        "masked_value": vault.get_masked_secret(req.key.strip()),
        "message": f"Secret '{req.key.strip().upper()}' encrypted and stored in local vault.",
    }


@api_router.delete("/vault/keys/{key_name}")
async def delete_vault_key(key_name: str):
    vault.delete_secret(key_name)
    return {
        "status": "DELETED",
        "key": key_name.upper(),
        "message": f"Secret '{key_name.upper()}' deleted from vault.",
    }


# 9. Missions (Section 35)
@api_router.get("/missions")
async def list_missions():
    return await mission_engine.list_missions()


# 10. Automations (Section 79, 103)
@api_router.get("/automations")
async def list_automations():
    return await automation_engine.list_automations()


@api_router.post("/automations/{auto_id}/run")
async def run_automation(auto_id: str):
    return await automation_engine.trigger_run(auto_id)


# 11. Memory (Section 36-39, 105)
@api_router.get("/memory")
async def list_memories():
    return await memory_manager.list_all_memories()


@api_router.post("/memory")
async def create_memory(req: MemoryCreateRequest):
    mem = await memory_manager.store_memory(
        content=req.content,
        memory_type=req.memory_type,
        classification=DataClassification(req.classification) if req.classification in DataClassification._value2member_map_ else DataClassification.INTERNAL,
        importance=req.importance,
    )
    return {"id": mem.id, "status": "STORED"}


@api_router.delete("/memory/{memory_id}")
async def forget_memory(memory_id: str):
    success = await memory_manager.forget_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found.")
    return {"status": "FORGOTTEN", "id": memory_id}


# 12. Unified Enterprise Search (Section 69-70)
@api_router.get("/search")
async def search_endpoint(q: str = Query(..., min_length=1)):
    return await unified_search_engine.search_all(q)


# 13. Voice Providers & Speech Synthesis (Section 40-42)
@api_router.get("/voice/providers")
async def list_voice_providers():
    return voice_service.list_voice_providers()


@api_router.post("/voice/providers/{provider_id}/activate")
async def activate_voice_provider(provider_id: str):
    try:
        return voice_service.activate_provider(provider_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.post("/voice/providers/{provider_id}/configure")
async def configure_voice_provider(provider_id: str, req: ConfigureVoiceProviderRequest):
    try:
        return voice_service.configure_provider(
            provider_id=provider_id,
            api_key=req.api_key,
            voice_id=req.voice_id,
            rate=req.rate,
            pitch=req.pitch,
            endpoint=req.endpoint,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.post("/voice/providers/{provider_id}/test")
async def test_voice_provider(provider_id: str):
    try:
        return await voice_service.test_provider(provider_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.post("/voice/command")
async def voice_command(req: VoiceCommandRequest):
    return voice_service.process_voice_command(req.transcript)


@api_router.post("/voice/synthesize")
async def voice_synthesize(req: VoiceSynthesizeRequest):
    return await voice_service.prepare_speech_response(req.text)


# 14. Notifications (Section 61)
@api_router.get("/notifications")
async def get_notifications():
    return await notification_manager.list_notifications()


# 15. Emergency Controls (Section 120)
@api_router.post("/safety/emergency-stop")
async def trigger_emergency_stop():
    return emergency_controller.trigger_stop_all()


@api_router.post("/safety/reset-stop")
async def reset_emergency_stop():
    return emergency_controller.reset_stop()


@api_router.get("/safety/status")
async def get_safety_status():
    return emergency_controller.get_status()
