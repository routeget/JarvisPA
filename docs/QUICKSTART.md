# J.A.R.V.I.S. Platform Quickstart Guide

## Prerequisites
- Python 3.12+ (Python 3.14 supported)
- Node.js 18+ and npm
- (Optional) Docker for PostgreSQL + pgvector and Redis

## Quick Start (Zero-Configuration Local Mode)

### 1. Launch Backend API
```powershell
# From project root
.\.venv\Scripts\python.exe -m uvicorn backend.jarvis.api.main:app --host 127.0.0.1 --port 8000
```
The backend initializes the local database, seeds default providers, connections, missions, and permissions automatically.

### 2. Launch Desktop Interface
```powershell
cd desktop
npm run dev
```
Open `http://localhost:5173` or launch the Electron shell via:
```powershell
npm run electron:dev
```

### 3. Verify Success Criteria Scenario (Section 138)
In Chat or the Global Command Bar (Ctrl + Space), ask:
> "JARVIS, check my email, Teams, Slack and Azure DevOps for everything related to Project Phoenix, summarize the current status, identify anything urgent, and prepare the required responses."

J.A.R.V.I.S. will:
1. Search Outlook Mail, Teams channels, Azure DevOps bugs, GitHub PRs, and Slack.
2. Correlate that Azure DevOps bug #12345 has a fix PR #847 with green CI.
3. Prepare a response draft.
4. Place a high-risk `send_email` action in your Human Approval Center.
5. Provide a multi-source executive summary with citations and step traces.

### 4. Running Automated Tests
```powershell
.\.venv\Scripts\python.exe -m pytest tests/
```
All unit and integration tests run in <1 second with zero external dependencies.
