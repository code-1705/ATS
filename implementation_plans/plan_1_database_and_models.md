# Implementation Plan - Submodule 1: Supabase PostgreSQL Schema, Stage FSM & Seed Data

## Overview
This submodule establishes the foundational PostgreSQL database architecture in **Supabase** (using `supabase-py` and direct Supabase SQL migrations without SQLAlchemy), the recruitment stage Finite State Machine (FSM), and automated bootstrap seed data for **EnterRecruit**.

---

## Technical Specifications & Architecture

### 1. Supabase Client Integration (`backend/core/supabase_client.py`)
- Direct integration with Supabase using the official Python client `supabase-py` (`Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`).
- Strict elimination of SQLAlchemy ORM layer. All database querying, inserting, updating, filtering, and joining occurs directly through Supabase PostgREST queries or RPC.
- Configuration loaded via `backend/core/config.py` from `.env` (`SUPABASE_URL`, `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`).

---

### 2. Supabase PostgreSQL Schema (`backend/migrations/001_initial_schema.sql`)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Admin Account)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'System Admin',
    role TEXT NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Remote',
    job_type TEXT NOT NULL DEFAULT 'Full-Time',
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    resume_filename TEXT NOT NULL,
    resume_file_size INT NOT NULL DEFAULT 0,
    brief_note TEXT DEFAULT '',
    stage TEXT NOT NULL DEFAULT 'APPLIED',
    stage_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Application Audit Log
CREATE TABLE IF NOT EXISTS public.application_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'admin@enter.in',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ultra-fast filtering & searching
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
```

---

### 3. Hiring Stage State Machine (FSM)

The application enforces the exact recruitment lifecycle stages defined in the specification:

```
[Applied (Initial)]
      ├──> [Reject]
      ├──> [R1] ───> [R1 Reject]
            └──> [R2] ───> [R2 Reject]
                  └──> [R3] ───> [R3 Reject]
                        └──> [Approved]
```

#### Valid Stage Constants:
- `APPLIED` ("Applied (Initial)")
- `REJECT` ("Reject")
- `R1` ("R1")
- `R1_REJECT` ("R1 Reject")
- `R2` ("R2")
- `R2_REJECT` ("R2 Reject")
- `R3` ("R3")
- `R3_REJECT` ("R3 Reject")
- `APPROVED` ("Approved")

---

### 4. Supabase Storage Bucket Provisioning
- Bucket: `resumes`
- Policy: Public read via signed URLs or authenticated download for admin.

---

### 5. Automatic Database Seed Script (`backend/services/seed_service.py`)

On initialization, the service checks Supabase and auto-provisions if records don't exist:

1. **Admin Account**:
   - Email: `admin@enter.in`
   - Password: `adminpassword123` (Bcrypt hashed)
2. **10 Seeded Jobs**:
   - `Senior Full-Stack Engineer (React + FastAPI)` (Engineering)
   - `AI/ML Engineer (LLMs & Multi-Agent Systems)` (AI/Data)
   - `Frontend Engineer (React / TypeScript / Tailwind)` (Engineering)
   - `Backend Engineer (Python / Distributed Systems)` (Engineering)
   - `Lead Product Designer (UI/UX)` (Design)
   - `Product Manager (Enterprise SaaS)` (Product)
   - `DevOps & Cloud Infrastructure Engineer` (Infrastructure)
   - `Technical Recruiter & Talent Partner` (Human Resources)
   - `Customer Success Manager` (Operations)
   - `Quality Assurance & Automation Engineer` (QA)

---

## Verification Plan
- Author test script `backend/tests/test_supabase_connection.py` to verify:
  1. Successful connection to Supabase PostgreSQL using `supabase-py`.
  2. Verification that `users`, `jobs`, and `applications` tables exist and queries execute cleanly.
  3. Verification that `seed_service` provisions exactly 1 admin and 10 active jobs.
