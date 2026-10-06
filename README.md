# J.A.R.V.I.S. Desktop AI Agent Platform (Level 2)

An extensible, local-first, multi-model, multi-platform personal AI agent platform built according to the **Level 2 Functional and Technical Specification**.

## 🌟 Key Features

- **Multi-Model AI Provider Routing**: Supports **Claude 3.5 Sonnet**, **OpenAI GPT-4o**, **Google Gemini 1.5 Pro/Flash**, **Groq LLaMA 3.3 70B**, **OpenRouter Gateway**, **Ollama Local Air-Gapped**, and **Microsoft Copilot Studio** with automated failover and cost tracking.
- **Model Context Protocol (MCP) Tool Integration**: Built-in connectors for **Microsoft 365** (Outlook Mail, Calendar, Teams), **Azure DevOps**, **GitHub**, **Slack**, **Google Workspace**, **Playwright Browser**, **Windows Automation**, and **n8n**.
- **Cross-System Reasoning & Correlation**: Correlates information across multiple disparate sources (e.g. Project Phoenix status correlation between email, Teams, Azure DevOps bug #12345, and GitHub PR #847).
- **Security & Data Classification**:
  - Gated data routing (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `SENSITIVE`, `RESTRICTED`).
  - Local credential vault encrypted via AES/Fernet with PBKDF2 derivation.
  - Prompt injection protection isolating external untrusted content.
  - Emergency safety controls (`STOP ALL`, `PAUSE AGENT`, `DISABLE OUTBOUND`).
- **Human-in-the-Loop Autonomy & Approvals**: Configurable Autonomy Levels 0 to 4. Actions classified as high-risk (`send_email`, `merge_pr`) require explicit human authorization before execution.
- **Persistent Semantic Memory**: Durable memory with vector embeddings, similarity search, entity relationships, and forget controls.
- **Voice Response Engine (STT + TTS)**: Real-time speech recognition, animated cybernetic waveform, and natural British-tuned voice synthesis with markdown filtering.
- **Desktop Command Center**: Global shortcut (`Ctrl + Space`) to summon the persistent command bar from anywhere in the OS.

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    J.A.R.V.I.S. DESKTOP                    │
│                  Electron + React + TypeScript              │
│  [Home] [Chat] [Tasks] [Activity] [Automations] [Settings] │
├─────────────────────────────────────────────────────────────┤
│                Desktop IPC / Local API Layer                │
├─────────────────────────────────────────────────────────────┤
│                    J.A.R.V.I.S. CORE                        │
│                                                             │
│  • Agent Orchestrator       • Task & Mission Engine         │
│  • AI Router                • Memory Manager (Vector)       │
│  • Permission Manager       • Approval Manager              │
│  • Security Vault (AES)     • Content Sanitizer             │
├─────────────────────────────────────────────────────────────┤
│                         MCP LAYER                           │
│  • Microsoft 365            • Azure DevOps                  │
│  • GitHub                   • Slack                         │
│  • Google Workspace         • Browser & Windows Automation  │
├─────────────────────────────────────────────────────────────┤
│                     AI PROVIDER LAYER                       │
│  Claude | OpenAI | Gemini | Groq | OpenRouter | Ollama      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.12+ (Python 3.14 supported)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Setup Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend.jarvis.api.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend & Desktop Setup
```bash
cd desktop
npm install

# Run in browser
npm run dev

# Or run Electron native desktop application
npm run electron:dev
```

### 4. Running Tests
```bash
python -m pytest tests/
```

---

## 📜 Documentation
- [Level 2 Functional and Technical Specification](FSD/JARVIS_DESKTOP_AI_AGENT_LEVEL_2.md)
- [Architecture Details](docs/ARCHITECTURE.md)
- [Quickstart Guide](docs/QUICKSTART.md)
