import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(64), default="owner")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversations = relationship("Conversation", back_populates="user")
    tasks = relationship("Task", back_populates="user")


class AIProviderConfig(Base):
    __tablename__ = "ai_provider_configs"

    id = Column(String(64), primary_key=True)  # claude, openai, gemini, groq, openrouter, ollama, copilot
    provider_name = Column(String(128), nullable=False)
    endpoint = Column(String(512), nullable=True)
    is_enabled = Column(Boolean, default=True)
    default_model = Column(String(128), nullable=True)
    fallback_model = Column(String(128), nullable=True)
    temperature = Column(Float, default=0.7)
    context_limit = Column(Integer, default=128000)
    max_budget_daily = Column(Float, default=20.0)
    current_spend_daily = Column(Float, default=0.0)
    is_healthy = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String(128), primary_key=True)
    provider_id = Column(String(64), ForeignKey("ai_provider_configs.id"), nullable=False)
    display_name = Column(String(255), nullable=False)
    context_window = Column(Integer, default=128000)
    supports_tools = Column(Boolean, default=True)
    supports_vision = Column(Boolean, default=False)
    supports_streaming = Column(Boolean, default=True)
    cost_per_1k_input = Column(Float, default=0.001)
    cost_per_1k_output = Column(Float, default=0.002)


class Connection(Base):
    __tablename__ = "connections"

    id = Column(String(64), primary_key=True)  # m365, github, azure_devops, slack, google_workspace, n8n, etc.
    name = Column(String(255), nullable=False)
    service_type = Column(String(64), nullable=False)
    status = Column(String(64), default="Disconnected")  # Connected, Disconnected, Testing, Error
    auth_type = Column(String(64), default="OAuth2")  # OAuth2, PAT, APIKey
    metadata_json = Column(JSON, default=dict)
    last_synced_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), default="New Chat")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True)
    conversation_id = Column(String(64), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(32), nullable=False)  # user, assistant, system, tool
    content = Column(Text, nullable=False)
    model_used = Column(String(128), nullable=True)
    provider_used = Column(String(64), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    tool_calls_json = Column(JSON, default=list)
    sources_json = Column(JSON, default=list)
    activity_steps_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(64), default="Pending")  # Pending, Running, Completed, Failed, Cancelled, Waiting for approval, Scheduled
    priority = Column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    assigned_agent = Column(String(64), default="Supervisor")
    plan_json = Column(JSON, default=dict)
    result_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tasks")
    executions = relationship("TaskExecution", back_populates="task", cascade="all, delete-orphan")
    tool_calls = relationship("ToolCall", back_populates="task", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="task", cascade="all, delete-orphan")


class TaskExecution(Base):
    __tablename__ = "task_executions"

    id = Column(String(64), primary_key=True)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    step_name = Column(String(255), nullable=False)
    status = Column(String(64), default="Running")  # Running, Completed, Failed
    input_json = Column(JSON, default=dict)
    output_json = Column(JSON, default=dict)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    task = relationship("Task", back_populates="executions")


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(String(64), primary_key=True)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=True)
    tool_name = Column(String(128), nullable=False)
    risk_level = Column(String(32), default="LOW")  # READ, LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(64), default="PENDING")  # PENDING, EXECUTED, BLOCKED, FAILED, AWAITING_APPROVAL
    arguments_json = Column(JSON, default=dict)
    arguments_hash = Column(String(64), nullable=True)
    result_json = Column(JSON, default=dict)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    task = relationship("Task", back_populates="tool_calls")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=True)
    tool_call_id = Column(String(64), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    action_type = Column(String(128), nullable=False)
    risk_level = Column(String(32), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    target_resource = Column(String(255), nullable=True)
    status = Column(String(64), default="PENDING")  # PENDING, APPROVED, REJECTED
    payload_json = Column(JSON, default=dict)
    decision_reason = Column(Text, nullable=True)
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="approvals")


class PermissionRule(Base):
    __tablename__ = "permissions"

    id = Column(String(64), primary_key=True)
    scope = Column(String(128), nullable=False)  # email, teams, github, etc.
    action = Column(String(128), nullable=False)  # read, send, delete, etc.
    policy = Column(String(64), default="APPROVAL_REQUIRED")  # ALLOWED, APPROVAL_REQUIRED, BLOCKED
    autonomy_level = Column(Integer, default=2)  # 0 to 4
    conditions_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Automation(Base):
    __tablename__ = "automations"

    id = Column(String(64), primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(64), nullable=False)  # time, schedule, email, teams, slack, github, webhook
    trigger_config_json = Column(JSON, default=dict)
    actions_json = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Mission(Base):
    __tablename__ = "missions"

    id = Column(String(64), primary_key=True)
    title = Column(String(255), nullable=False)
    objective = Column(Text, nullable=False)
    schedule = Column(String(128), nullable=True)
    trigger_condition = Column(Text, nullable=True)
    sources_json = Column(JSON, default=list)
    tools_json = Column(JSON, default=list)
    status = Column(String(64), default="Active")  # Active, Paused, Completed
    last_execution = Column(DateTime, nullable=True)
    next_execution = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Memory(Base):
    __tablename__ = "memories"

    id = Column(String(64), primary_key=True)
    memory_type = Column(String(64), default="Semantic")  # Conversation, Task, Preference, Project, Semantic, Episodic, Working
    content = Column(Text, nullable=False)
    classification = Column(String(32), default="INTERNAL")  # PUBLIC, INTERNAL, CONFIDENTIAL, SENSITIVE, RESTRICTED
    confidence = Column(Float, default=0.9)
    importance = Column(Integer, default=3)  # 1 to 5
    source = Column(String(255), default="user_dialogue")
    embedding_json = Column(JSON, nullable=True)  # List[float] embedding vector
    related_entities_json = Column(JSON, default=dict)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(32), default="INFO")  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    category = Column(String(64), default="system")
    is_read = Column(Boolean, default=False)
    action_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String(64), nullable=True)
    task_id = Column(String(64), nullable=True)
    provider = Column(String(64), nullable=True)
    model = Column(String(128), nullable=True)
    tool = Column(String(128), nullable=True)
    arguments_hash = Column(String(64), nullable=True)
    result_status = Column(String(64), default="SUCCESS")
    approval_status = Column(String(64), nullable=True)
    duration_ms = Column(Integer, default=0)
    classification = Column(String(32), default="INTERNAL")
    details_json = Column(JSON, default=dict)


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(String(64), primary_key=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    provider = Column(String(64), nullable=False)
    model = Column(String(128), nullable=False)
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0.0)
    task_id = Column(String(64), nullable=True)
