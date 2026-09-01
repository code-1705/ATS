# Implementation Plan - Submodule 4: Admin Dashboard, Job CRUD & Stage Progression Pipeline

## Overview
This submodule implements the administrative control center for **EnterRecruit** using **React 18, Vite, TypeScript, and Tailwind CSS**. It provides a secure admin authentication flow (`admin@enter.in`), complete Job CRUD management, a high-performance candidate application tracker with multi-dimensional filtering (by Job, by Hiring Stage, and by Search query), full candidate dossier inspection, one-click resume streaming, and stage progression state updates.

---

## Technical Specifications & UI/UX Architecture

### 1. Component Hierarchy & Navigation
```
frontend/src/
├── components/
│   ├── AdminNavbar.tsx            # Admin header with user badge, tab switchers & logout
│   ├── AdminAuthGuard.tsx         # Route wrapper redirecting unauthenticated users to /admin/login
│   ├── CandidateTable.tsx         # Responsive candidate applications data table
│   ├── CandidateDetailDrawer.tsx  # Full candidate dossier, brief note & embedded resume viewer
│   ├── StageBadge.tsx             # Color-coded badge with stage label and quick transition selector
│   ├── JobManagementTable.tsx     # Job CRUD table with applicant count counters
│   ├── JobFormModal.tsx           # Create / Edit job modal dialog
│   └── ConfirmDeleteModal.tsx     # Confirmation dialog for deleting/archiving jobs
├── pages/
│   ├── AdminLoginPage.tsx         # Clean login page with pre-fill demo button (admin@enter.in)
│   └── AdminDashboardPage.tsx     # Tabbed dashboard (Candidate Applications & Job Management)
└── services/
    └── adminApi.ts                # Admin Axios client with auto Bearer token header injection
```

---

## 2. Feature Specifications

### A. Admin Authentication & Protection (`/admin/login` & `/admin`)
- **Login Screen**:
  - Email & password inputs with real-time feedback.
  - "Use Demo Admin Credentials" one-click button (pre-fills `admin@enter.in` / `adminpassword123`).
  - Stores JWT token in `localStorage` under `enterrecruit_token`.
- **Auth Guard**:
  - Validates active token via `GET /api/auth/me`.
  - Seamless logout clearing session state.

### B. Candidate Pipeline & Application Management (Tab 1)
- **Multi-Dimensional Filters**:
  1. **Job Filter**: Dropdown with "All Jobs" + individual job titles.
  2. **Stage Filter**: Filter chips for all 9 stages:
     - `All Stages`
     - `Applied (Initial)`
     - `Reject`
     - `R1`
     - `R1 Reject`
     - `R2`
     - `R2 Reject`
     - `R3`
     - `R3 Reject`
     - `Approved`
  3. **Live Search**: Instant debounced search for candidate name, email, or phone.
- **Candidate Data Table**:
  - Candidate contact details (Name, Email, Phone).
  - Applied Job Title & Department.
  - Submission date & relative time.
  - Color-coded Stage Badge with instant inline stage selector.
  - One-click Resume Preview (opens PDF viewer) / Download button.
  - "Inspect Application" button opening Candidate Dossier Drawer.
- **Candidate Detail Drawer**:
  - Displays full brief note submitted by candidate.
  - Direct stage progression buttons (e.g., `Advance to R1`, `Reject at Initial`, `Advance to R2`, `Approve`).
  - Stage audit history timeline.

### C. Job Management (Tab 2)
- **Jobs Table**:
  - Lists all active and inactive positions.
  - Displays applicant count per job.
  - Action buttons: `Edit`, `Toggle Active/Inactive`, `Delete`.
- **Create / Edit Job Modal**:
  - Form inputs: `Title`, `Department`, `Location`, `Job Type` (Full-Time/Contract/Internship), `Description`, `Active Status`.
- **Delete Confirmation**:
  - Modal with safety checks preventing accidental deletion of jobs with active applicants.

---

## 3. Verification Plan
- Author automated tests verifying:
  1. Login with `admin@enter.in` successfully authenticates and redirects to `/admin`.
  2. Unauthenticated access to `/admin` redirects to `/admin/login`.
  3. Filtering candidates by job dropdown updates candidate table.
  4. Filtering candidates by stage chips updates candidate table.
  5. Stage transition updates state in UI and dispatches `PATCH /api/admin/applications/:id/stage`.
  6. Job creation, editing, and deletion operate smoothly with instant UI updates.
