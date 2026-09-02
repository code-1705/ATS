@echo off
echo ===================================================
echo Starting Careers Hub Full-Stack Application...
echo ===================================================

start "Careers Hub Backend (FastAPI)" cmd /k "uvicorn backend.app:app --reload --port 8000"
start "Careers Hub Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Application launched!
echo - Public Application Page: http://localhost:5173
echo - Admin Dashboard:        http://localhost:5173/admin
echo - Backend API Docs:       http://localhost:8000/docs
echo.
