# Implementation Plan - Submodule 1: Supabase PostgreSQL Schema, Stage FSM & Seed Data

## Overview
This submodule establishes the production-grade PostgreSQL database architecture in **Supabase** (using `supabase-py` and direct Supabase SQL migrations without SQLAlchemy), the recruitment stage Finite State Machine (FSM), database-level integrity constraints, and automated bootstrap seed data for **EnterRecruit**.

---

## Technical Specifications & Architecture

### 1. Supabase Client Integration (`backend/core/supabase_client.py`)
- Direct integration with Supabase using the official Python client `supabase-py` (`Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`).
- **Strict elimination of SQLAlchemy ORM layer**. All database querying, inserting, updating, filtering, and joining occurs directly through Supabase PostgREST queries or RPC.
- Configuration loaded via `backend/core/config.py` from `.env` (`SUPABASE_URL`, `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`).

---

### 2. Production PostgreSQL Schema & Triggers (`backend/migrations/001_initial_schema.sql`)

```sql
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Trigger Function for Updated Timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_set_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage IS DISTINCT FROM OLD.stage THEN
        NEW.stage_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Users Table (Admin Account & Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'System Admin',
    role TEXT NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Jobs Table (Job Postings)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Remote',
    job_type TEXT NOT NULL DEFAULT 'Full-Time',
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_timestamp_jobs ON public.jobs;
CREATE TRIGGER set_timestamp_jobs
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Applications Table (Candidate Submissions)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_valid_stage CHECK (
        stage IN ('APPLIED', 'REJECT', 'R1', 'R1_REJECT', 'R2', 'R2_REJECT', 'R3', 'R3_REJECT', 'APPROVED')
    )
);

DROP TRIGGER IF EXISTS set_timestamp_applications ON public.applications;
CREATE TRIGGER set_timestamp_applications
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION trigger_set_stage_timestamp();

-- 6. Application Audit Logs (Stage History Tracking)
CREATE TABLE IF NOT EXISTS public.application_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'admin@enter.in',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_audit_from_stage CHECK (
        from_stage IN ('APPLIED', 'REJECT', 'R1', 'R1_REJECT', 'R2', 'R2_REJECT', 'R3', 'R3_REJECT', 'APPROVED')
    ),
    CONSTRAINT check_audit_to_stage CHECK (
        to_stage IN ('APPLIED', 'REJECT', 'R1', 'R1_REJECT', 'R2', 'R2_REJECT', 'R3', 'R3_REJECT', 'APPROVED')
    )
);

-- ====================================================================
-- Indexes for High-Performance Queries & Filtering
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_application_id ON public.application_audit_logs(application_id);

-- ====================================================================
-- Row Level Security (RLS) Configurations
-- ====================================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
CREATE POLICY "Public can view active jobs" ON public.jobs
FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can submit applications" ON public.applications;
CREATE POLICY "Public can submit applications" ON public.applications
FOR INSERT WITH CHECK (TRUE);
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

### 4. Automatic Database Seed Script (`backend/services/seed_service.py`)

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
- Author test suite in `backend/tests/` verifying:
  1. All 9 recruitment stages exist with valid FSM transitions and UI badge color mappings.
  2. Password hashing & JWT token issuance/verification with zero warnings.
  3. Seed service structure creates exactly 1 admin and 10 jobs without duplication.
