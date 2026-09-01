# Implementation Plan - Submodule 3: Public Candidate Application Portal

## Overview
This submodule builds the modern, fast, and user-friendly public candidate application portal using **React 18, Vite, TypeScript, and Tailwind CSS**. It provides two seamless application experiences: (1) an open jobs catalog with a dynamic dropdown selector, and (2) a dedicated single-job direct application route with role details and streamlined submission.

---

## Technical Specifications & UI/UX Architecture

### 1. Route & Component Architecture
- **Routes**:
  - `/` & `/apply`: General open job application portal with job selection dropdown and active role cards.
  - `/jobs/:job_id/apply`: Targeted direct application route for a specific position.

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                 # Brand navigation & Admin Login link
│   │   ├── JobSelectorDropdown.tsx    # Searchable dynamic dropdown populated from GET /api/jobs
│   │   ├── JobDetailsCard.tsx         # Role description, department & location badge
│   │   ├── ResumeDropzone.tsx         # Drag-and-drop file upload with size/format validation
│   │   └── SuccessModal.tsx           # Application confirmation receipt & Reference ID
│   ├── pages/
│   │   ├── ApplyPage.tsx              # General candidate application page
│   │   └── DirectJobApplyPage.tsx     # Single-job targeted application page
│   ├── services/
│   │   └── api.ts                     # Axios client connecting to FastAPI /api/jobs & /api/applications
│   └── types/
│       └── index.ts                   # TypeScript interfaces (Job, ApplicationForm, ApplicationResponse)
```

---

## 2. Component Design & Form Specifications

### A. Dynamic Job Selector & Catalog
- Fetches active jobs from `GET /api/jobs` on mount.
- Renders clean searchable dropdown with Department tags (e.g. *Senior Full-Stack Engineer [Engineering]*).
- Allows toggling between "Quick Dropdown Form" and "Browse All Open Roles".

### B. Candidate Application Form Fields
- **Full Name**: Text input with real-time trim and validation.
- **Phone Number**: Formatted input with length/character check.
- **Email Address**: Standard RFC email format verification.
- **Job Selection**: Locked if accessed via `/jobs/:job_id/apply`, or interactive dropdown if on `/apply`.
- **Resume Drag-and-Drop Uploader**:
  - Accepts `.pdf`, `.doc`, `.docx` up to 10MB.
  - Visual feedback for drag-over, upload progress, and file name/size badge.
  - One-click remove/replace button.
- **Brief Note**: Multi-line textarea for candidate cover note / pitch.

### C. Application Confirmation Receipt
- Shows candidate name, selected role, timestamp, and unique Application Reference ID.
- Option to apply for another position or view all open jobs.

---

## 3. State Management & API Integration (`src/services/api.ts`)
- **`fetchOpenJobs()`**: Calls `GET /api/jobs`.
- **`fetchJobDetails(jobId)`**: Calls `GET /api/jobs/{job_id}`.
- **`submitGeneralApplication(formData)`**: Dispatches `POST /api/applications` with `multipart/form-data`.
- **`submitTargetedApplication(jobId, formData)`**: Dispatches `POST /api/jobs/{job_id}/apply` with `multipart/form-data`.

---

## 4. Verification Plan
- Author automated component tests in `frontend/src/__tests__/`:
  1. Verify open jobs are fetched and rendered in dropdown selector.
  2. Verify client-side field validation prevents empty submissions.
  3. Verify resume file size and extension rejection for non-PDF/DOC files.
  4. Verify successful submission opens confirmation modal with receipt ID.
