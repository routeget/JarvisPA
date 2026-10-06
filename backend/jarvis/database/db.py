import os
import datetime
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.jarvis.database.models import (
    Base,
    User,
    AIProviderConfig,
    AIModel,
    Connection,
    PermissionRule,
    Mission,
    Automation,
    Memory,
)

# Use SQLite as local zero-config fallback, or PostgreSQL if configured
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///jarvis.db")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial default configurations if not present
    async with async_session_factory() as session:
        # Check user
        default_user = await session.get(User, "user_default")
        if not default_user:
            session.add(
                User(
                    id="user_default",
                    name="Antigravity Architect",
                    email="admin@myjarvis.local",
                    role="owner",
                )
            )

        # AI Provider Configs
        default_providers = [
            ("claude", "Claude (Anthropic)", "https://api.anthropic.com/v1", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"),
            ("openai", "OpenAI", "https://api.openai.com/v1", "gpt-4o", "gpt-4o-mini"),
            ("gemini", "Google Gemini", "https://generativelanguage.googleapis.com/v1beta", "gemini-1.5-pro", "gemini-1.5-flash"),
            ("groq", "Groq Inference", "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"),
            ("openrouter", "OpenRouter Gateway", "https://openrouter.ai/api/v1", "anthropic/claude-3.5-sonnet", "openai/gpt-4o-mini"),
            ("ollama", "Ollama Local", "http://localhost:11434/api", "llama3.2:latest", "phi3:latest"),
            ("copilot", "Microsoft Copilot Studio", "https://api.copilotstudio.microsoft.com/v1", "copilot-enterprise-v1", "copilot-lite"),
        ]
        for pid, name, ep, def_m, fb_m in default_providers:
            existing = await session.get(AIProviderConfig, pid)
            if not existing:
                session.add(
                    AIProviderConfig(
                        id=pid,
                        provider_name=name,
                        endpoint=ep,
                        is_enabled=True,
                        default_model=def_m,
                        fallback_model=fb_m,
                    )
                )

        # AI Models
        models_data = [
            ("claude-3-5-sonnet-20241022", "claude", "Claude 3.5 Sonnet", 200000, True, True, 0.003, 0.015),
            ("claude-3-5-haiku-20241022", "claude", "Claude 3.5 Haiku", 200000, True, True, 0.001, 0.005),
            ("gpt-4o", "openai", "GPT-4o Omnimodel", 128000, True, True, 0.0025, 0.010),
            ("gpt-4o-mini", "openai", "GPT-4o Mini", 128000, True, True, 0.00015, 0.0006),
            ("gemini-1.5-pro", "gemini", "Gemini 1.5 Pro", 1000000, True, True, 0.00125, 0.005),
            ("gemini-1.5-flash", "gemini", "Gemini 1.5 Flash", 1000000, True, True, 0.000075, 0.0003),
            ("llama-3.3-70b-versatile", "groq", "Groq LLaMA 3.3 70B", 128000, True, False, 0.00059, 0.00079),
            ("llama3.2:latest", "ollama", "Ollama LLaMA 3.2 3B Local", 32000, True, False, 0.0, 0.0),
        ]
        for mid, pid, dname, ctx, tools, vis, cin, cout in models_data:
            existing_m = await session.get(AIModel, mid)
            if not existing_m:
                session.add(
                    AIModel(
                        id=mid,
                        provider_id=pid,
                        display_name=dname,
                        context_window=ctx,
                        supports_tools=tools,
                        supports_vision=vis,
                        cost_per_1k_input=cin,
                        cost_per_1k_output=cout,
                    )
                )

        # Connections (Enterprise and Collaboration Integrations)
        default_connections = [
            ("m365", "Microsoft 365 / Graph", "microsoft365", "Connected", "OAuth2", {"scopes": ["Mail.ReadWrite", "Calendars.ReadWrite", "Chat.ReadWrite"]}),
            ("azure_devops", "Azure DevOps", "azure_devops", "Connected", "PAT", {"org": "EnterpriseOrg", "project": "Phoenix"}),
            ("github", "GitHub Enterprise", "github", "Connected", "OAuth2", {"owner": "MyCompany", "repos": ["phoenix-core", "jarvis-desktop"]}),
            ("slack", "Slack Workspace", "slack", "Connected", "OAuth2", {"team": "TechOps", "channels": ["#project-phoenix", "#announcements"]}),
            ("google_workspace", "Google Workspace", "google_workspace", "Connected", "OAuth2", {"services": ["Gmail", "Calendar", "Drive"]}),
            ("n8n", "n8n Automation Engine", "n8n", "Connected", "APIKey", {"url": "http://localhost:5678"}),
            ("browser", "Playwright Controlled Browser", "browser", "Connected", "Local", {"headless": True}),
            ("windows", "Windows Automation Suite", "windows", "Connected", "Local", {"powershell": True}),
        ]
        for cid, cname, stype, cstat, atype, meta in default_connections:
            existing_c = await session.get(Connection, cid)
            if not existing_c:
                session.add(
                    Connection(
                        id=cid,
                        name=cname,
                        service_type=stype,
                        status=cstat,
                        auth_type=atype,
                        metadata_json=meta,
                        last_synced_at=datetime.datetime.utcnow(),
                    )
                )

        # Permissions per Section 3.3 and 127
        seed_permissions = [
            ("email.read", "email", "read", "ALLOWED", 1),
            ("email.draft", "email", "draft", "ALLOWED", 1),
            ("email.send", "email", "send", "APPROVAL_REQUIRED", 2),
            ("email.delete", "email", "delete", "BLOCKED", 0),
            ("calendar.read", "calendar", "read", "ALLOWED", 1),
            ("calendar.create", "calendar", "create", "APPROVAL_REQUIRED", 2),
            ("teams.read", "teams", "read", "ALLOWED", 1),
            ("teams.send", "teams", "send", "APPROVAL_REQUIRED", 2),
            ("azure_devops.read", "azure_devops", "read", "ALLOWED", 1),
            ("azure_devops.update", "azure_devops", "update", "APPROVAL_REQUIRED", 2),
            ("github.read", "github", "read", "ALLOWED", 1),
            ("github.create_pr", "github", "create_pr", "APPROVAL_REQUIRED", 2),
            ("github.merge_pr", "github", "merge_pr", "APPROVAL_REQUIRED", 2),
            ("github.delete_repo", "github", "delete_repo", "BLOCKED", 0),
            ("slack.read", "slack", "read", "ALLOWED", 1),
            ("slack.send", "slack", "send", "APPROVAL_REQUIRED", 2),
            ("google_drive.read", "google_drive", "read", "ALLOWED", 1),
        ]
        for pid, scope, act, pol, auto_lvl in seed_permissions:
            existing_p = await session.get(PermissionRule, pid)
            if not existing_p:
                session.add(
                    PermissionRule(
                        id=pid,
                        scope=scope,
                        action=act,
                        policy=pol,
                        autonomy_level=auto_lvl,
                    )
                )

        # Seed Active Mission
        existing_mission = await session.get(Mission, "mission_phoenix")
        if not existing_mission:
            session.add(
                Mission(
                    id="mission_phoenix",
                    title="Project Phoenix Oversight & Correlation",
                    objective="Monitor Microsoft 365, Teams, Azure DevOps, and GitHub for Project Phoenix updates, coordinate blockers, and prepare daily executive summaries.",
                    schedule="0 9 * * 1-5",
                    trigger_condition="High-priority bug or VIP customer communication",
                    sources_json=["Outlook", "Teams", "Azure DevOps", "GitHub", "Slack"],
                    tools_json=["search_email", "search_teams", "search_azure_devops", "search_github"],
                    status="Active",
                    last_execution=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
                    next_execution=datetime.datetime.utcnow() + datetime.timedelta(hours=6),
                )
            )

        # Seed Initial Memory
        existing_memory = await session.get(Memory, "mem_phoenix_context")
        if not existing_memory:
            session.add(
                Memory(
                    id="mem_phoenix_context",
                    memory_type="Project",
                    content="Project Phoenix is the Q4 cloud infrastructure modernization initiative. Key contacts: Lead Dev Sarah Chen, Architect Marcus Vance, Product Director Elena Rostova. Target release milestone: Friday.",
                    classification="INTERNAL",
                    confidence=0.98,
                    importance=5,
                    source="project_manifesto",
                    related_entities_json={"project": "Phoenix", "lead": "Sarah Chen"},
                )
            )

        await session.commit()
