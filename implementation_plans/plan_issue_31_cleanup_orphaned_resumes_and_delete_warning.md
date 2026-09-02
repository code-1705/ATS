# Implementation Plan - Issue #31: Job Deletion Orphaned Resumes Cleanup & Cascade Deletion Warning

## 1. Objective & Context
- **Problem Statement**: 
  When a job is deleted via `DELETE /admin/jobs/{job_id}`, associated applications are cascade-deleted at the Postgres DB level, but:
  1. The resume files on local disk (`uploads/resumes/`) and in Supabase Storage (`resumes` bucket) are never deleted, causing orphaned files and disk leakage.
  2. The frontend confirmation modal (`ConfirmDeleteModal.tsx`) lacks a clear, prominent warning indicating that candidate applications, dossiers, and resume files will be permanently and irreversibly destroyed.
- **Scope Boundary**:
  - Add `delete_resume_file` in `backend/services/storage.py`.
  - Update `delete_job` in `backend/routers/admin.py` to query associated applications before deleting the job, invoke resume cleanup for each, and report metrics in response.
  - Enhance `ConfirmDeleteModal.tsx` to prominently warn admins with the candidate applications count and the permanent cascade deletion of applicant records and stored files.
  - Add comprehensive automated test coverage in `backend/tests/`.

## 2. Architecture & Component Impacts
- **Backend Storage Service** (`backend/services/storage.py`):
  - Add `delete_resume_file(resume_url: str, resume_filename: Optional[str] = None)` to clean both local file and remote Supabase Storage.
- **Backend Admin Router** (`backend/routers/admin.py`):
  - In `delete_job(job_id: str)`:
    1. Fetch job to confirm existence (404 if missing).
    2. Fetch all applications belonging to `job_id` (`resume_url`, `resume_filename`).
    3. Loop and call `delete_resume_file` for each application.
    4. Delete the job from Supabase `jobs` table (DB handles DB-level cascade).
    5. Return deleted count and resume cleanup stats in response.
- **Frontend Recruiter Portal** (`frontend/src/components/ConfirmDeleteModal.tsx`):
  - Add a styled warning callout box with `AlertTriangle` icon.
  - Dynamically display the count of candidate applications and explicitly state that candidate data, audit logs, and resumes will be permanently erased.
- **Automated Tests** (`backend/tests/test_jobs_api.py`):
  - Test `DELETE /admin/jobs/{job_id}` cleans up local resume files and Supabase storage entries.
  - Test `DELETE /admin/jobs/{job_id}` returns 404 for non-existent job.

## 3. Step-by-Step Implementation Sequence
1. Domain sub-agent `recruitment-integrations`:
   - Implement `delete_resume_file` in `backend/services/storage.py`.
   - Update `delete_job` in `backend/routers/admin.py`.
2. Domain sub-agent `frontend-recruiter-portal`:
   - Update `ConfirmDeleteModal.tsx` with cascade data loss warning and candidate application count.
3. Domain sub-agent `qa-security-verifier`:
   - Add unit and integration tests in `backend/tests/test_jobs_api.py` verifying file cleanup on job deletion.
   - Run full pytest test suite and frontend build.
4. Domain sub-agent `codebase-auditor`:
   - Inspect diff, verify error handling, zero unhandled exceptions, and no lint regressions.

## 4. Security & Multi-Tenancy Guardrails
- Ensure `delete_resume_file` sanitizes file paths and prevents path traversal (e.g., verifying file stays within `uploads/resumes` or matches expected naming).
- Unlink with `missing_ok=True` so missing files do not break job deletion.
- Wrap external Supabase Storage deletions in try/except blocks to guarantee resilient execution.

## 5. Verification Plan
- `python -m pytest backend/tests/test_jobs_api.py -v`
- `python -m pytest backend/tests/ -v`
- `npm --prefix frontend run build` (or `npx tsc --noEmit`)
