# Implementation Plan - Submodule 5: Automated Test Suite, Cloud Deployment & Hosted Links

## Overview
This submodule finalizes **EnterRecruit** with end-to-end automated testing verification, multi-stage production deployment configuration (unified single-service & decoupled options), one-click local startup scripts, and complete submission documentation with live hosted links and demo credentials.

---

## Technical Specifications & Deployment Architecture

### 1. Unified Single-Service Cloud Architecture (Zero-CORS, Single URL)

```mermaid
graph TD
    subgraph Client Browser
        U[User / Candidate / Admin]
    end

    subgraph Unified FastAPI Production Container
        U -->|HTTPS Request| NGINX[FastAPI App Engine]
        NGINX -->|/api/*| API[REST API Router]
        NGINX -->|/uploads/*| UP[Static File Streaming]
        NGINX -->|/* (SPA Fallback)| SPA[React Vite Static Build /frontend/dist]
    end

    subgraph Supabase Cloud
        API --> SUPA[(PostgreSQL via Supabase SDK)]
        API --> STG[Supabase Storage: /resumes]
    end
```

---

## 2. Deployment Configurations

### A. Production Multi-Stage `Dockerfile`
- **Stage 1 (Frontend Build)**: Node.js 20+ image builds Vite React TypeScript app into `/app/frontend/dist`.
- **Stage 2 (Backend Production Runner)**: Python 3.11-slim image installs requirements, copies static frontend assets, and launches Uvicorn server on `$PORT`.

### B. Render / Railway Deployment Blueprint (`render.yaml`)
- Service Type: Web Service
- Environment: Python 3.11
- Build Command: `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..`
- Start Command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
- Environment Variables: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET_KEY`.

### C. Vercel Frontend Configuration (`frontend/vercel.json`)
- For optional decoupled hosting on Vercel with automatic rewrite routing to SPA index.

---

## 3. SPA Fallback in `backend/app.py`
To support single-domain hosting:
- When running in production (or when `frontend/dist` exists), FastAPI mounts `frontend/dist/assets` and catches all non-API GET routes to serve `frontend/dist/index.html`.

---

## 4. Deliverables & Submission Checklist

| Deliverable | Description / Location |
| :--- | :--- |
| **Public Candidate Application Link** | `https://<deployed-app-url>/apply` (or `/`) |
| **Targeted Job Application Route** | `https://<deployed-app-url>/jobs/:job_id/apply` |
| **Admin Dashboard Link** | `https://<deployed-app-url>/admin` |
| **Admin Login Credentials** | **Email**: `admin@enter.in` <br> **Password**: `adminpassword123` |
| **Project Documentation** | Comprehensive `README.md` with system architecture, API endpoints list, and local run instructions |
| **Automated Verification** | All 21 backend unit & integration tests passing (`pytest backend/tests/ -v`) |
