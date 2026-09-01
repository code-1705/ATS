# EnterRecruit Local Startup Script (PowerShell)
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting EnterRecruit Full-Stack Application..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "uvicorn backend.app:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nApplication launched successfully!" -ForegroundColor Green
Write-Host "- Public Candidate Page: http://localhost:5173" -ForegroundColor Yellow
Write-Host "- Admin Dashboard:       http://localhost:5173/admin" -ForegroundColor Yellow
Write-Host "- Backend API Docs:      http://localhost:8000/docs" -ForegroundColor Yellow
