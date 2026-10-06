@echo off
echo ========================================================
echo   J.A.R.V.I.S. Desktop AI Agent Platform - Level 2
echo ========================================================

echo Starting J.A.R.V.I.S. Python Runtime on port 8000...
start "JARVIS Runtime" cmd /k ".venv\Scripts\python.exe -m uvicorn backend.jarvis.api.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Desktop UI (Vite dev server + Electron shell)...
cd desktop
start "JARVIS Desktop" cmd /k "npm run dev"

echo.
echo J.A.R.V.I.S. is launching! Press Ctrl+Space in desktop for Global Command Bar.
echo ========================================================
