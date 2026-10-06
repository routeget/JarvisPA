# J.A.R.V.I.S. Desktop AI Agent Platform (Level 2)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![Node: 18+](https://img.shields.io/badge/Node-18%2B-green.svg)](https://nodejs.org/)
[![Electron: 33+](https://img.shields.io/badge/Electron-33%2B-cyan.svg)](https://www.electronjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-teal.svg)](https://fastapi.tiangolo.com/)
[![React: 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Branch: JarvisPA_v1.0.0](https://img.shields.io/badge/Branch-JarvisPA__v1.0.0-purple.svg)](https://github.com/routeget/JarvisPA/tree/JarvisPA_v1.0.0)

An extensible, local-first, multi-model, multi-platform personal AI agent platform built strictly in accordance with the **Level 2 Functional and Technical Specification** (`FSD/JARVIS_DESKTOP_AI_AGENT_LEVEL_2.md`).

J.A.R.V.I.S. acts as an executive AI companion operating with **Autonomous Level 2 (Supervised Execution)**. It proactively correlates data across enterprise tools (Microsoft 365, Azure DevOps, GitHub, Slack, Google Workspace), provides natural bidirectional voice interaction, securely handles credentials, and strictly enforces human-in-the-loop approvals for sensitive actions.

---

## 🌟 Current Features

### 1. Multi-Model AI Routing Engine
- **Dynamic Model Selection**: Selects optimal models based on task complexity, speed requirements, context length, cost, and data sensitivity.
- **Supported Providers**:
  - **Anthropic Claude 3.5 Sonnet** (Default for complex multi-step reasoning and coding)
  - **OpenAI GPT-4o / GPT-4o-mini** (Fast generation and structured tool execution)
  - **Google Gemini 1.5 Pro / Flash** (Ultra-long context windows and document processing)
  - **Groq LLaMA 3.3 70B** (Ultra-low latency sub-second generation)
  - **OpenRouter Gateway** (Access to 200+ open-source and commercial models)
  - **Ollama Air-Gapped Local** (Zero external data egress for `RESTRICTED` or offline operations)
  - **Microsoft Copilot Studio & Mock Fallbacks**
- **Automated Fallback Chains**: Seamless failover to secondary providers if rate limits, timeouts, or network outages occur.
- **Token & Cost Accounting**: Tracks estimated API expenses per session, model, and task.

### 2. Model Context Protocol (MCP) Tool Ecosystem
- Built on standard JSON-RPC 2.0 architecture with client tool introspection and automatic parameter validation.
- **8 Native Connectors**:
  - 📧 **Microsoft 365 Connector**: Outlook email searching/drafting/sending, calendar event scheduling, Teams channel messaging.
  - 🛠️ **Azure DevOps Connector**: Query work items, fetch sprint backlogs, inspect CI/CD pipeline runs.
  - 🐙 **GitHub Connector**: List repositories, search issues, fetch pull requests, trigger workflows, merge PRs.
  - 💬 **Slack Connector**: List channels, post status updates, read threads, query user status.
  - 📁 **Google Workspace Connector**: Search Google Drive docs, read files, draft Gmail messages.
  - 💻 **Windows Automation Connector**: Run PowerShell commands, launch applications, monitor processes, read registry keys.
  - 🌐 **Browser Automation Connector**: Headless Playwright integration for web scraping, form filling, and DOM extraction.
  - ⚡ **n8n Workflow Connector**: Trigger low-code automation webhooks and monitor executions.

### 3. Voice Interaction Engine (STT & TTS)
- **Bidirectional Speech**:
  - **Speech-to-Text (STT)**: High-accuracy real-time browser Web Speech recognition with silence detection and live transcript previews.
  - **Text-to-Speech (TTS)**: Natural, prosody-tuned voice synthesis with custom pitch, rate, and British accent styling.
- **Speech Intelligence**:
  - **Markdown & Code Filtering**: Regex-based speech sanitizer strips code blocks, URLs, and markdown punctuation so code is never read aloud awkwardly.
  - **Per-Message Read Aloud**: Interactive speaker buttons on every chat response to replay or pause audio.
  - **Cybernetic Audio Visualizer**: Floating modal (`Ctrl + Shift + V` or header mic button) featuring animated sound wave bars and status indicators.
- **Backend Synthesis Endpoint**: `/api/v1/voice/synthesize` endpoint for programmatic audio processing.

### 4. Cross-System Correlation & Mission Planner
- **Cross-System Reasoning**: Simultaneously correlates information across multiple tools. Example: Automatically connects an urgent Teams ping to Azure DevOps bug `#12345`, locates the corresponding GitHub PR `#847`, and drafts an Outlook summary to stakeholders.
- **DAG-Based Task Engine**: Decomposes complex user goals into dependency-ordered subtasks with retries, timeouts, and state machines (`PENDING`, `RUNNING`, `WAITING_APPROVAL`, `COMPLETED`, `FAILED`).
- **Autonomy Levels 0 to 4**:
  - `Level 0`: Observer (Read-only advice)
  - `Level 1`: Assistant (Formulates plans, user executes)
  - `Level 2`: Semi-Autonomous (Executes safe actions, prompts for sensitive actions — **Default**)
  - `Level 3`: Autonomous with Pre-Approval (Executes entire approved mission without micro-prompts)
  - `Level 4`: Fully Autonomous (Self-governed within defined security boundaries)

### 5. Human-in-the-Loop (HITL) & Security Governance
- **Interactive Approval Center**:
  - High-risk actions (`send_email`, `merge_pr`, `delete_file`, `execute_script`) are intercepted and held in `PENDING` status.
  - Real-time notification banners and dedicated Approvals tab allow users to Inspect, Approve, or Reject with reasons.
- **5-Tier Data Classification**:
  - Categorizes inputs and assets into `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `SENSITIVE`, or `RESTRICTED`.
  - Automatically restricts external LLM egress for `RESTRICTED` data, routing only to local Ollama instances.
- **Local Credential Vault**:
  - Zero plain-text credentials stored on disk.
  - AES-256 / Fernet symmetric encryption with PBKDF2 HMAC-SHA256 key derivation.
- **Emergency Safety Controls**:
  - Global `STOP ALL` kill-switch: Immediately cancels all active tasks, kills running MCP sub-processes, and enters safe mode.
  - `PAUSE AGENT` and `DISABLE OUTBOUND` modes.
- **Prompt Injection Defense**: Sanitizes external content, emails, and web pages before passing them to LLM context.

### 6. Semantic Memory & Context Manager
- **Tiered Memory System**:
  - **Working Memory**: In-flight conversation buffer and mission context.
  - **Episodic Memory**: History of past actions, commands, and workflow results.
  - **Factual / Semantic Memory**: User preferences, team contacts, and architectural rules.
- **Vector Search**: Computes embeddings for long-term similarity matching and associative recall.
- **Privacy & GDPR Controls**: "Forget" commands to wipe specific memory entries or clear entire domains.

### 7. Native Desktop Shell & HUD
- **Electron 33 Desktop Shell**:
  - Context isolation enabled, Node integration disabled for security.
  - Granular Content Security Policy (CSP).
  - Background System Tray with quick minimize/restore.
- **Global Command Bar**:
  - Press `Ctrl + Space` anywhere in the operating system to summon the floating Spotlight-style quick-action bar.
- **Modern Cybernetic UI**:
  - Glassmorphic dark theme (`#080C14` background, `#00F0FF` cyan accents, `#6C5CE7` violet gradients).
  - Built with React 18, Vite, Tailwind CSS, Lucide icons, and Zustand state stores.
  - Dedicated pages: **Home Overview**, **Conversational Agent**, **Task Manager**, **Activity Audit**, **Automation Workflows**, **Memory Graph**, **Integrations & MCP Tools**, **Settings & Security Vault**.

---

## 🏗️ Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      J.A.R.V.I.S. DESKTOP CLIENT                       │
│              Electron 33 + React 18 + Vite + Tailwind CSS              │
│  [Spotlight Ctrl+Space] [Voice Modal] [Approvals HUD] [Chat & Tasks]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC / HTTP / SSE
┌───────────────────────────────────▼────────────────────────────────────┐
│                    J.A.R.V.I.S. CORE BACKEND (FastAPI)                 │
│                                                                        │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │  Agent Orchestrator  │  │   Task & Mission    │  │ Voice Engine   │ │
│  │  (Multi-Step Planner)│  │   (DAG Engine)      │  │ (STT / TTS)    │ │
│  └──────────┬───────────┘  └──────────┬──────────┘  └────────────────┘ │
│             │                         │                                │
│  ┌──────────▼───────────┐  ┌──────────▼──────────┐  ┌────────────────┐ │
│  │   AI Router          │  │ Security Vault (AES)│  │ Memory Manager │ │
│  │ (Multi-LLM + Failover│  │ & Sanitizer Engine  │  │ (Vector Store) │ │
│  └──────────┬───────────┘  └──────────┬──────────┘  └────────────────┘ │
│             │                         │                                │
│  ┌──────────▼─────────────────────────▼──────────────────────────────┐ │
│  │         Permissions & Human-in-the-Loop Approval Manager          │ │
│  └────────────────────────────────────┬──────────────────────────────┘ │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │ JSON-RPC 2.0 (Stdio / SSE)
┌───────────────────────────────────────▼────────────────────────────────┐
│                     MODEL CONTEXT PROTOCOL (MCP) TOOLS                 │
│  • Microsoft 365 (Mail, Teams, Calendar)   • Azure DevOps (WorkItems)  │
│  • GitHub (PRs, Issues, Actions)           • Slack (Channels, Direct)  │
│  • Google Workspace (Drive, Gmail)         • Playwright Browser        │
│  • Windows System (PowerShell, Registry)   • n8n Webhook Automations   │
└───────────────────────────────────────┬────────────────────────────────┘
                                        │ Secure API Calls
┌───────────────────────────────────────▼────────────────────────────────┐
│                            AI PROVIDERS                                │
│  Claude 3.5 | GPT-4o | Gemini 1.5 | Groq Llama 3.3 | Ollama (Local)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Setup & Installation Guide

### Prerequisites
Make sure your system meets the following requirements:
- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu 22.04+ (Windows recommended for Windows MCP tools)
- **Python**: Version `3.12` or higher (Python `3.14` tested and supported)
- **Node.js**: Version `18.0.0` or higher (`v24.21.0` tested)
- **Package Manager**: `npm` (included with Node.js)
- **Git**: Installed and configured on your system

---

### Step 1: Clone the Repository & Checkout Branch
```bash
git clone https://github.com/routeget/JarvisPA.git
cd JarvisPA
git checkout JarvisPA_v1.0.0
```

---

### Step 2: Backend Setup (Python & FastAPI)

1. **Create and Activate Python Virtual Environment**:
   ```bash
   # Windows (PowerShell):
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Windows (CMD):
   python -m venv .venv
   .\.venv\Scripts\activate.bat

   # macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install Python Dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the project root to supply your AI provider API keys:
   ```env
   # AI Provider Keys (at least one is recommended; Mock provider is used if absent)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Ollama Configuration (for air-gapped local AI)
   OLLAMA_BASE_URL=http://localhost:11434

   # Core Security Settings
   JARVIS_SECRET_KEY=change_me_to_a_random_32_byte_secret_string
   DEFAULT_AUTONOMY_LEVEL=2
   DATABASE_URL=sqlite+aiosqlite:///./jarvis.db
   ```

4. **Verify and Run Backend Server**:
   ```bash
   python -m uvicorn backend.jarvis.api.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - **Interactive API Docs (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Health Check Endpoint**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

### Step 3: Frontend & Desktop Setup (Electron + React)

1. **Navigate to Desktop Directory and Install Dependencies**:
   ```bash
   cd desktop
   npm install
   ```

2. **Run in Web Development Mode (Vite)**:
   ```bash
   npm run dev
   ```
   The browser UI will be accessible at: [http://localhost:5173](http://localhost:5173)

3. **Run as Native Electron Desktop Application**:
   Open a separate terminal window, ensure the backend is running, and execute:
   ```bash
   cd desktop
   npm run electron:dev
   ```
   This will:
   - Compile the TypeScript Electron main process (`desktop/electron/main.ts`)
   - Launch Vite dev server
   - Launch the native framed Electron desktop window with tray and global shortcuts enabled.

---

### Step 4: One-Click Startup Scripts

For convenience, ready-to-run startup scripts are provided in the [`scripts/`](scripts/) directory:

- **Windows Batch**:
  ```cmd
  scripts\start-jarvis.bat
  ```
- **Windows PowerShell**:
  ```powershell
  .\scripts\start-jarvis.ps1
  ```

These scripts will activate `.venv`, launch the Uvicorn backend, start Vite, and launch the Electron application concurrently.

---

### Step 5: Optional Docker Compose Setup (PostgreSQL + Redis + n8n)

For production deployments with PostgreSQL (with pgvector extension), Redis caching, and an n8n workflow engine:

```bash
cd infrastructure/docker
docker-compose up -d
```

This starts:
- **PostgreSQL 16 + pgvector**: `localhost:5432` (database: `jarvis`)
- **Redis Cache**: `localhost:6379`
- **n8n Automation Engine**: `http://localhost:5678`
- **J.A.R.V.I.S. Backend Container**: `http://localhost:8000`

---

## 🧪 Testing & Validation

The test suite covers unit and integration scenarios across AI routing, security sanitization, permissions, API routes, and the Phoenix cross-system workflow.

Run all tests via pytest:
```bash
# From the repository root (with .venv active):
pytest tests/ -v
```

Expected result:
```text
tests/integration/test_api_endpoints.py::test_health_endpoint PASSED
tests/integration/test_api_endpoints.py::test_tools_endpoint PASSED
tests/integration/test_api_endpoints.py::test_chat_message_flow PASSED
tests/integration/test_api_endpoints.py::test_task_lifecycle PASSED
tests/integration/test_phoenix_workflow.py::test_phoenix_correlation_pipeline PASSED
tests/unit/test_ai_router.py::test_model_selection_coding PASSED
tests/unit/test_ai_router.py::test_model_selection_restricted_fallback PASSED
tests/unit/test_permissions.py::test_autonomous_level_checks PASSED
tests/unit/test_permissions.py::test_sensitive_action_requires_approval PASSED
tests/unit/test_security_sanitizer.py::test_prompt_injection_detection PASSED
tests/unit/test_security_sanitizer.py::test_clean_content_passes PASSED

============================= 11 passed in 1.45s =============================
```

---

## ⌨️ Global Shortcuts & Controls

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + Space` | **Summon Spotlight Bar** | Toggles the floating quick command bar anywhere in Windows/macOS. |
| `Ctrl + Shift + V` | **Voice Assistant Modal** | Opens the voice HUD with active waveform audio visualizer and STT. |
| `Escape` | **Dismiss Spotlight / Modal** | Closes overlays and returns focus to the active desktop workspace. |
| `Header Mic Button` | **Voice Listen Toggle** | Starts/stops listening to user speech in the chat interface. |
| `Speaker Icon` | **Read Aloud** | Synthesizes and speaks aloud an individual AI message. |
| `Red Danger Button` | **Emergency Stop** | Halts all running missions, revokes execution permissions, and pauses agent. |

---

## 📂 Project Directory Structure

```text
MyJarvis/
├── FSD/
│   └── JARVIS_DESKTOP_AI_AGENT_LEVEL_2.md    # Master Level 2 Functional Specification
├── backend/
│   └── jarvis/
│       ├── agent/
│       │   └── orchestrator.py               # Core Multi-Step Agent Orchestrator
│       ├── ai/
│       │   ├── base.py                       # Base AI Provider Interface
│       │   ├── router.py                     # Multi-Model Router & Cost Tracker
│       │   └── providers/                    # Claude, GPT-4o, Gemini, Groq, Ollama, OpenRouter
│       ├── api/
│       │   ├── main.py                       # FastAPI Application entrypoint
│       │   └── routes.py                     # REST & SSE endpoints (/chat, /tasks, /approvals, etc.)
│       ├── approvals/
│       │   └── manager.py                    # Human-in-the-Loop Approval workflow
│       ├── database/
│       │   ├── db.py                         # Async database connection & init
│       │   └── models.py                     # SQLAlchemy models (Tasks, Memory, Approvals, Audit)
│       ├── integrations/                     # M365, Azure DevOps, GitHub, Slack, Google
│       ├── mcp/
│       │   ├── registry.py                   # MCP Server Registration & JSON-RPC Client
│       │   └── tools_setup.py                # Preloaded tool definitions & dispatcher
│       ├── memory/
│       │   └── manager.py                    # Semantic, Working & Vector Memory Manager
│       ├── missions/                         # High-level mission execution
│       ├── notifications/                    # Real-time WebSocket/Desktop notifications
│       ├── permissions/
│       │   └── manager.py                    # Autonomy Level & Tool Gating enforcement
│       ├── search/                           # Hybrid keyword & semantic search engine
│       ├── security/
│       │   ├── audit.py                      # Immutable audit logging
│       │   ├── classification.py             # 5-Tier Data Sensitivity classifier
│       │   ├── emergency.py                  # Emergency Stop & Safe Mode controller
│       │   ├── sanitizer.py                  # Prompt Injection & Content Sanitizer
│       │   └── vault.py                      # AES-256 / PBKDF2 Credential Vault
│       ├── tasks/
│       │   └── engine.py                     # DAG-based Task Execution Engine
│       ├── voice/
│       │   └── service.py                    # Text-to-Speech & Speech-to-Text service
│       └── workflows/                        # Automated workflow sequences
├── desktop/
│   ├── electron/
│   │   ├── main.ts                           # Electron Main process (Tray, Window, Shortcuts)
│   │   ├── preload.ts                        # Secure Preload Context Bridge
│   │   └── security/csp.ts                   # Content Security Policy definition
│   └── renderer/
│       ├── src/
│       │   ├── components/                   # Header, Sidebar, CommandBar, VoiceModal
│       │   ├── pages/                        # Home, Chat, Tasks, Activity, Memory, Connections
│       │   ├── services/                     # Axios API client & Web Speech AudioService
│       │   └── stores/                       # Zustand Reactive App State Store
│       ├── index.html                        # HTML5 Desktop Shell Entrypoint
│       ├── package.json                      # Desktop Dependencies
│       ├── tailwind.config.js                # Custom Cyberpunk / Dark Glass HUD theme
│       └── vite.config.ts                    # Vite build configuration
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile                        # Multi-stage Python Backend container
│   │   └── docker-compose.yml                # Full stack: Postgres, Redis, n8n, Backend
│   └── postgres/
│       └── init.sql                          # Database schema with pgvector
├── mcp-servers/                              # Standalone JSON-RPC 2.0 MCP Servers
│   ├── azure-devops/                         # Azure DevOps MCP Server
│   ├── browser/                              # Playwright Browser MCP Server
│   ├── filesystem/                           # Local Filesystem MCP Server
│   ├── github/                               # GitHub MCP Server
│   ├── google-workspace/                     # Google Workspace MCP Server
│   ├── microsoft365/                         # M365 Outlook & Teams MCP Server
│   ├── n8n/                                  # n8n Automation MCP Server
│   ├── slack/                                # Slack MCP Server
│   └── windows/                              # Windows Automation MCP Server
├── scripts/
│   ├── start-jarvis.bat                      # One-click Windows CMD startup
│   └── start-jarvis.ps1                      # One-click Windows PowerShell startup
├── tests/
│   ├── unit/                                 # Unit tests for router, permissions, sanitizer
│   └── integration/                          # Integration tests for API routes & workflows
├── requirements.txt                          # Python dependencies
├── .gitignore                                # Git ignore file
└── README.md                                 # Project documentation
```

---

## 🔒 Security & Privacy Practices

- **Zero Unprompted Data Egress**: Sensitive data flagged as `RESTRICTED` is processed locally through Ollama; it is never forwarded to external cloud LLM providers.
- **Local Credential Storage**: All external API keys and tokens entered via the Connections page are stored in the local encrypted vault using AES-256.
- **Sandboxed Execution**: External content retrieved from the web or emails is parsed through the prompt injection sanitizer before entering LLM reasoning loops.
- **Human Authorization by Default**: J.A.R.V.I.S. operates at Autonomy Level 2 by default. No destructive action (sending messages, modifying code, or deleting resources) is taken without your approval.

---

## 🤝 Contributing & Repository Information

- **GitHub Repository**: [https://github.com/routeget/JarvisPA](https://github.com/routeget/JarvisPA)
- **Active Release Branch**: [`JarvisPA_v1.0.0`](https://github.com/routeget/JarvisPA/tree/JarvisPA_v1.0.0)
- **Pull Requests**: Pull requests should be targeted against the `JarvisPA_v1.0.0` or main branch. Ensure all pytest suites pass (`pytest tests/`) prior to submitting.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
