# Implementation Plan - Submodule 5: Automated Test Suite, Cloud Deployment & Hosted Links

## Overview
This submodule provides the comprehensive automated testing suite and end-to-end cloud deployment configurations to ensure the system is fully verified and hosted online with working public candidate and admin dashboard URLs.

---

## Technical Specifications & Architecture

### 1. Automated Test Suites

#### A. Backend Integration & API Tests (`backend/tests/`)
- `test_auth.py`: Admin login validation, invalid password handling, JWT token expiration, and auth middleware security.
- `test_public_applications.py`: Active job listing retrieval, multipart form application submissions, resume file size/format verification, and database state checks.
- `test_admin_jobs.py`: Full CRUD test cycle (Create Job -> Update Job -> Get Jobs -> Delete Job).
- `test_admin_candidates.py`: Candidate list query, stage filtering, job filtering, search queries, stage updates, and resume stream endpoints.

#### B. Frontend Component & E2E Tests (`frontend/src/__tests__/`)
- Public application form validation & submission handling.
- Admin authentication state & protected route redirects.
- Filter synchronization between Job selector and Stage selector.

---

### 2. Cloud Deployment & Production Hosting Strategy

The system is configured for seamless zero-downtime deployment:

#### Option 1: Unified Single-Container / Full-Stack Service (Render / Railway)
- Production Vite build (`npm run build`) generates static SPA assets into `backend/static/`.
- FastAPI mounts static assets with SPA fallback routing:
  - `/api/*` -> REST API router.
  - `/uploads/*` -> Secure file storage router.
  - `/*` -> Serves `index.html` with client-side React router.
- Single command deployment: `uvicorn app:app --host 0.0.0.0 --port $PORT`.

#### Option 2: Decoupled Cloud Deployment (Vercel Frontend + Render/Railway Backend)
- **Frontend**: Deployed on **Vercel** (`enterrecruit.vercel.app`).
- **Backend**: Deployed on **Render / Railway** with persistent disk for resume uploads or Supabase Storage integration.

---

### 3. Submission Links & Deliverables Checklist

Upon completion and deployment, provide:
1. **Public Candidate Application Link**: `https://<deployed-domain>/apply` (or `/`)
2. **Admin Dashboard Link**: `https://<deployed-domain>/admin`
3. **Admin Demo Credentials**:
   - Email: `admin@enter.in`
   - Password: `adminpassword123`
4. **Git Repository & Documentation**: Clean README with architecture overview, local run instructions, and API docs link (`/docs`).
