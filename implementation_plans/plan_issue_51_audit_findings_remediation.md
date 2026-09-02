# Implementation Plan - Issue #51: Repository Audit Findings Remediation

## 1. Objective & Context
Remediate the 5 specific architectural, flow, and quality findings identified during the full repository audit:
1. **Resume Cleanup Target Filename**: Fix `delete_resume_file()` in `backend/services/storage.py` to target the actual stored UUID filename from `resume_url` rather than candidate original display name.
2. **Resume Preview Flow**: Support browser redirect in `backend/routers/admin.py` for Supabase signed URLs via `redirect=true` query param, and update `frontend/src/services/adminApi.ts`.
3. **Module-Level mkdir Side Effect**: Move `upload_dir.mkdir(...)` in `backend/app.py` into the async `lifespan()` startup context manager.
4. **Deterministic Dev JWT Secret**: In `backend/core/config.py`, use a consistent dev fallback secret `default-insecure-dev-jwt-secret-key-32-chars` if not in `.env`, preventing token invalidation on restarts in local dev.
5. **Frontend React Lexical Hoisting & Fast Refresh**: Refactor `AdminAuthGuard.tsx`, `CandidateDetailDrawer.tsx`, `DirectJobApplyPage.tsx`, `ApplyPage.tsx`, `AdminDashboardPage.tsx`, and `StageBadge.tsx` to eliminate all 13 oxlint warnings.

## 2. Architecture & Component Impacts
- `backend/services/storage.py` (`recruitment-integrations`):
  - In `delete_resume_file(resume_url, resume_filename)`:
    Target filename logic: `target_filename = Path(resume_url).name if resume_url else resume_filename`.
- `backend/routers/admin.py` (`recruitment-integrations`):
  - In `preview_or_download_resume()`: Add `redirect: bool = Query(False)`. When `redirect=True` and `signed_res` has `signedURL`, return `RedirectResponse(url=signed_res["signedURL"])`.
- `backend/app.py` (`recruitment-integrations`):
  - Move `Path("uploads/resumes").mkdir(parents=True, exist_ok=True)` into `lifespan()`.
- `backend/core/config.py` (`recruitment-integrations`):
  - Set `JWT_SECRET_KEY: str = "default-insecure-dev-jwt-secret-key-32-chars"` with pydantic env override.
- `frontend/src/services/adminApi.ts` (`frontend-recruiter-portal`):
  - Update `getResumeDownloadUrl()` to pass `redirect=true`.
- `frontend/src/components/StageBadge.tsx` (`frontend-recruiter-portal`):
  - Remove `export` from `STAGE_CONFIGS`.
- `frontend/src/components/AdminAuthGuard.tsx`, `CandidateDetailDrawer.tsx`, `DirectJobApplyPage.tsx`, `ApplyPage.tsx`, `AdminDashboardPage.tsx` (`frontend-recruiter-portal`):
  - Move functions before `useEffect` hooks to resolve lexical scope / TDZ warnings.

## 3. Step-by-Step Implementation Sequence
1. Domain sub-agent `recruitment-integrations`:
   - Edit `backend/services/storage.py`
   - Edit `backend/routers/admin.py`
   - Edit `backend/app.py`
   - Edit `backend/core/config.py`
2. Domain sub-agent `frontend-recruiter-portal`:
   - Edit `frontend/src/services/adminApi.ts`
   - Edit `frontend/src/components/StageBadge.tsx`
   - Edit `frontend/src/components/AdminAuthGuard.tsx`
   - Edit `frontend/src/components/CandidateDetailDrawer.tsx`
   - Edit `frontend/src/pages/DirectJobApplyPage.tsx`
   - Edit `frontend/src/pages/ApplyPage.tsx`
   - Edit `frontend/src/pages/AdminDashboardPage.tsx`
3. Domain sub-agent `qa-security-verifier`:
   - Add test in `backend/tests/test_jobs_api.py` verifying `delete_resume_file` with display name vs uuid url.
   - Run `pytest backend/tests/ -v`.
   - Run `npm run lint` and `npm run build` in `frontend/`.
4. Domain sub-agent `codebase-auditor`:
   - Verify zero regressions and clean git diff.

## 4. Verification Plan
- Automated Backend Tests: `python -m pytest backend/tests/ -v`
- Automated Frontend Checks: `npm run lint` (0 warnings, 0 errors), `npm run build` (builds successfully).
