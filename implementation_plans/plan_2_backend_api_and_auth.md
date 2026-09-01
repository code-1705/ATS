# Implementation Plan - Submodule 2: FastAPI Backend Core, REST APIs & Admin Auth

## Overview
This submodule builds the high-performance FastAPI server providing public endpoints for candidate job applications, secure admin authentication, job management CRUD, candidate filtering, and resume download/preview streaming.

---

## Technical Specifications & Architecture

### 1. Project Directory Structure
```
backend/
├── app.py                     # FastAPI application entrypoint & middleware
├── core/
│   ├── config.py              # Pydantic Settings, JWT secrets, CORS
│   ├── database.py            # Async DB engine & session dependency
│   └── security.py            # Bcrypt hashing & PyJWT token generator/validator
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── job.py
│   └── application.py
├── schemas/
│   ├── auth.py                # LoginRequest, TokenResponse
│   ├── job.py                 # JobCreate, JobUpdate, JobResponse
│   └── application.py         # ApplicationCreate, ApplicationResponse, StageUpdate
├── routers/
│   ├── auth.py                # Admin login & current user verification
│   ├── public.py              # Public job listings & application submission
│   └── admin.py               # Protected Job CRUD & Candidate pipeline endpoints
├── services/
│   ├── storage.py             # Resume file upload, validation, and retrieval
│   └── seed_service.py        # Default data bootstrap
└── tests/
    ├── test_auth.py
    ├── test_jobs.py
    └── test_applications.py
```

---

### 2. REST API Endpoints Specification

#### A. Public Endpoints (No Auth Required)
- `GET /api/jobs`:
  - Returns list of active jobs (`is_active == True`) with `id`, `title`, `department`, `location`, `job_type`, and `description`.
  - Used by the candidate application dropdown and job board.
- `GET /api/jobs/{job_id}`:
  - Fetches specific job details for candidate view.
- `POST /api/applications`:
  - Handles `multipart/form-data`:
    - `job_id`: str (required)
    - `name`: str (required)
    - `phone`: str (required)
    - `email`: EmailStr (required)
    - `brief_note`: str (optional/required)
    - `resume`: UploadFile (required, PDF / DOC / DOCX, max 10MB)
  - Validates file type and size.
  - Generates safe UUID-based file path in `uploads/resumes/`.
  - Persists application record in initial `APPLIED` stage.
  - Returns `201 Created` with application ID and confirmation receipt.

#### B. Admin Authentication (`/api/auth`)
- `POST /api/auth/login`:
  - Input: `{"email": "admin@enter.in", "password": "..."}`
  - Verifies Bcrypt hash against `User` table.
  - Issues signed JWT token (`access_token`, `token_type: "bearer"`).
- `GET /api/auth/me`:
  - Validates JWT and returns active admin profile.

#### C. Protected Admin Endpoints (`/api/admin/*` - Bearer Token Required)
- `GET /api/admin/jobs`:
  - List all jobs (including draft/inactive) with candidate application counts per job.
- `POST /api/admin/jobs`:
  - Create new job posting (`title`, `department`, `location`, `job_type`, `description`, `is_active`).
- `PUT /api/admin/jobs/{job_id}`:
  - Update job details or toggle active status.
- `DELETE /api/admin/jobs/{job_id}`:
  - Delete job (with safety check: archive or block if applications exist).
- `GET /api/admin/applications`:
  - List candidate applications with dynamic query filters:
    - `job_id`: Optional filter by job.
    - `stage`: Optional filter by stage (`APPLIED`, `R1`, `R2`, `R3`, `APPROVED`, `REJECT`, etc.).
    - `search`: Keyword search matching candidate name, email, or phone.
    - `page` & `limit`: Pagination parameters.
- `GET /api/admin/applications/{application_id}`:
  - Detailed single application view.
- `PATCH /api/admin/applications/{application_id}/stage`:
  - Input: `{"stage": "R1"}`
  - Updates candidate hiring stage, records audit timestamp, and returns updated record.
- `GET /api/admin/applications/{application_id}/resume`:
  - Streams candidate resume file with appropriate `Content-Type` (e.g. `application/pdf`) and `inline` or `attachment` header for in-browser preview or download.

---

### 3. File Upload & Security Safeguards
- **MIME & Extension Whitelist**: Strictly restricts uploads to `.pdf`, `.doc`, `.docx`.
- **Filename Sanitization**: Uploaded files are renamed using secure UUIDs (`uploads/resumes/{app_id}_{uuid}.pdf`) to eliminate path traversal vulnerabilities.
- **File Size Ceiling**: Enforces 10MB limit via streaming chunk inspection.

---

## Verification Plan
- Unit tests with `httpx.AsyncClient` covering:
  - Public job listing and application submission with mock PDF upload.
  - Admin login success with `admin@enter.in` and rejection with bad credentials.
  - Admin CRUD job operations.
  - Candidate stage updates and invalid stage rejection.
