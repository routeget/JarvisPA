Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  J.A.R.V.I.S. Desktop AI Agent Platform - Level 2" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "Starting J.A.R.V.I.S. Backend Runtime on port 8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "& .\.venv\Scripts\python.exe -m uvicorn backend.jarvis.api.main:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting Desktop UI (Vite + Electron)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd desktop; npm run dev"

Write-Host "J.A.R.V.I.S. runtime launched successfully." -ForegroundColor Yellow
