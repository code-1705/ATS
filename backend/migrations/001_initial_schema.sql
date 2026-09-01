-- ====================================================================
-- EnterRecruit Production-Grade PostgreSQL Schema (Supabase)
-- ====================================================================

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

-- Allow public read of active jobs
DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
CREATE POLICY "Public can view active jobs" ON public.jobs
FOR SELECT USING (is_active = TRUE);

-- Allow public candidate application insertion
DROP POLICY IF EXISTS "Public can submit applications" ON public.applications;
CREATE POLICY "Public can submit applications" ON public.applications
FOR INSERT WITH CHECK (TRUE);

-- Service role bypasses RLS automatically for backend admin operations
