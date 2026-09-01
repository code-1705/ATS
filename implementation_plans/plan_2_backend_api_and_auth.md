# Implementation Plan - Submodule 2: FastAPI Backend Core, REST APIs & Admin Auth

## Overview
This submodule implements the high-performance FastAPI server providing public endpoints for candidate job applications, secure admin authentication (`admin@enter.in`), complete Job CRUD management, candidate query filtering by job and stage, stage state machine progression, and secure resume streaming directly via Supabase PostgreSQL and Supabase Storage (zero SQLAlchemy).

---

## Technical Specifications & Architecture

### 1. Project Directory Structure
```
backend/
├── app.py                     # FastAPI application entrypoint, CORS, lifespan & error handlers
├── core/
│   ├── config.py              # Pydantic Settings, JWT secrets, CORS
│   ├── security.py            # Bcrypt hashing & PyJWT token generator/validator
│   └── supabase_client.py     # Supabase client singleton & query provider
├── models/
│   ├── __init__.py
│   └── stages.py              # Recruitment FSM stages, labels, colors & transition validator
├── schemas/
│   ├── __init__.py
│   ├── auth.py                # LoginRequest, TokenResponse, UserResponse
│   ├── job.py                 # JobCreate, JobUpdate, JobResponse, JobListResponse
│   └── application.py         # ApplicationCreate, ApplicationResponse, StageUpdateRequest
├── routers/
│   ├── __init__.py
│   ├── auth.py                # Admin login & current user profile (/api/auth)
│   ├── public.py              # Public job listings & application submission (/api)
│   └── admin.py               # Protected Job CRUD & Candidate pipeline endpoints (/api/admin)
├── services/
│   ├── __init__.py
│   ├── storage.py             # Resume file upload, validation, and retrieval (Supabase Storage / local)
│   └── seed_service.py        # Default data bootstrap (admin & 10 jobs)
└── tests/
    ├── test_auth.py
    ├── test_jobs.py
    └── test_applications.py
```

---

## 2. REST API Endpoints Specification

### A. Public Candidate Endpoints (No Auth Required)
- `GET /api/jobs`:
  - Queries `supabase.table("jobs").select("*").eq("is_active", True)`.
  - Returns active jobs for candidate dropdown and job board.
- `GET /api/jobs/{job_id}`:
  - Fetches specific job description & specifications.
- `POST /api/applications`:
  - Accepts `multipart/form-data`:
    - `job_id`: UUID string (required)
    - `candidate_name`: str (required)
    - `candidate_phone`: str (required)
    - `candidate_email`: EmailStr (required)
    - `brief_note`: str (optional, default "")
    - `resume`: UploadFile (required, PDF / DOC / DOCX, max 10MB)
  - Validates file MIME type, extension, and file size.
  - Stores file in Supabase Storage (`resumes/`) or local static storage fallback.
  - Inserts application into `public.applications` table with stage `APPLIED`.
  - Returns `201 Created` with application ID and confirmation receipt.

### B. Admin Authentication (`/api/auth`)
- `POST /api/auth/login`:
  - Input: `{"email": "admin@enter.in", "password": "adminpassword123"}`
  - Queries `public.users` table via Supabase client.
  - Validates Bcrypt hash with `backend.core.security.verify_password`.
  - Returns signed JWT token: `{"access_token": "...", "token_type": "bearer", "user": {...}}`.
- `GET /api/auth/me`:
  - Validates Bearer JWT header and returns active admin profile.

### C. Protected Admin Endpoints (`/api/admin/*` - Bearer Auth Required)
- `GET /api/admin/jobs`:
  - Returns all jobs (active & inactive) with candidate application counts per job.
- `POST /api/admin/jobs`:
  - Creates a new job posting (`title`, `department`, `location`, `job_type`, `description`, `is_active`).
- `PUT /api/admin/jobs/{job_id}`:
  - Updates job title, department, description, or toggles active status.
- `DELETE /api/admin/jobs/{job_id}`:
  - Deletes job posting from Supabase (cascades or flags inactive).
- `GET /api/admin/applications`:
  - Queries candidates with dynamic multi-filtering:
    - `job_id` query param: Filter by specific job or "all".
    - `stage` query param: Filter by specific stage (`APPLIED`, `REJECT`, `R1`, `R1_REJECT`, `R2`, `R2_REJECT`, `R3`, `R3_REJECT`, `APPROVED`).
    - `search` query param: Search candidate name, email, or phone.
  - Returns candidate dossier list including brief notes, applied date, and resume link.
- `GET /api/admin/applications/{application_id}`:
  - Fetches complete single candidate application details.
- `PATCH /api/admin/applications/{application_id}/stage`:
  - Body: `{"stage": "R1"}`
  - Enforces `is_valid_stage_transition` from FSM.
  - Updates `public.applications` table and logs entry into `public.application_audit_logs`.
- `GET /api/admin/applications/{application_id}/resume`:
  - Streams candidate resume file or redirects to signed Supabase Storage URL.

---

## 3. Production Safeguards & Error Handling
- **Non-blocking Async I/O**: Direct async execution for API routes.
- **Strict Input Validation**: Pydantic v2 schemas for all payloads with descriptive HTTP 422 error messages.
- **Secure File Storage**: Enforces 10MB max size, sanitized filenames, and MIME verification.
- **CORS Configuration**: Restricts access to frontend dev (`localhost:5173`) and production domains.

---

## 4. Verification Plan
- Author test suites with `httpx.AsyncClient` covering:
  1. `test_auth.py`: Login with `admin@enter.in`, invalid password rejection, JWT expiration, and `/api/auth/me` verification.
  2. `test_jobs.py`: Public active jobs retrieval, Admin Job CRUD cycle.
  3. `test_applications.py`: Public application submission with file upload, candidate filtering by job & stage, stage FSM transitions, and resume streaming.
