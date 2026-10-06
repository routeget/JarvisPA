# J.A.R.V.I.S. Desktop AI Agent Platform - Level 2 Architecture

## 1. Overview
J.A.R.V.I.S. is an enterprise-grade desktop AI agent platform running on Windows 10/11 (with cross-platform readiness). It delivers autonomous cross-system correlation, multi-model AI routing, Model Context Protocol (MCP) tool execution, granular human-in-the-loop approvals, persistent memory, and real-time voice interaction.

## 2. Component Topology

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

## 3. Key Subsystems
1. **Agent Orchestrator (`backend/jarvis/agent/`):**
   - Implements execution lifecycle: `RECEIVED -> UNDERSTAND -> PLAN -> AUTHORIZE -> EXECUTE -> OBSERVE -> EVALUATE -> REPLAN -> APPROVE -> COMPLETE`.
   - Cross-system reasoning correlating emails, Teams discussions, Azure DevOps bugs, and GitHub PRs.
2. **AI Provider & Model Router (`backend/jarvis/ai/`):**
   - Claude 3.5 Sonnet (Primary reasoning)
   - OpenAI GPT-4o (Secondary reasoning & structured output)
   - Google Gemini 1.5 Pro / Flash (Multimodal & Voice)
   - Groq LLaMA 3.3 70B (Low-latency inference)
   - OpenRouter (Failover gateway)
   - Ollama (Local air-gapped confidential/restricted models)
   - Automated provider fallback per Section 81.
3. **Security, Permissions & Human Control (`backend/jarvis/security/`, `backend/jarvis/permissions/`):**
   - Autonomy Levels 0 to 4.
   - High-risk operations (`send_email`, `merge_pr`, `deploy`) require explicit user authorization.
   - Prompt injection guard isolating untrusted external content.
   - Data classifications: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `SENSITIVE`, `RESTRICTED`.
   - Emergency safety controls (`STOP ALL`, `PAUSE AGENT`, `DISABLE OUTBOUND`).
4. **Desktop Shell (`desktop/`):**
   - Electron system tray and global hotkey (`Ctrl + Space`).
   - React + TypeScript + Vite + Tailwind CSS dark cybernetic theme.
   - Real-time voice interaction with animated audio waveform.
