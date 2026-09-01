# Implementation Plan - Submodule 3: Public Candidate Application Portal

## Overview
This submodule builds the modern, ultra-fast, and user-friendly public job application page where candidates can seamlessly browse available jobs, fill in their application details, upload their resume, and receive instantaneous confirmation.

---

## Technical Specifications & UI/UX Architecture

### 1. Route & Component Architecture
- **Route**: `/` and `/apply` (publicly accessible).
- **Key Components**:
  - `Header`: Clean brand header with EnterRecruit logo and link to Admin Login.
  - `JobSelectorDropdown`: Searchable, categorized dropdown rendering active open jobs fetched from `GET /api/jobs` (pre-populated with the 10 seeded jobs).
  - `JobDetailsCard`: Collapsible summary showing selected job's department, location, type, and key requirements.
  - `ApplicationForm`:
    - **Full Name**: Text input with real-time validation.
    - **Phone Number**: International/national phone format with input masking.
    - **Email Address**: Standard email regex validation.
    - **Job Dropdown**: Dynamic selector. Supports URL parameter pre-selection (`/apply?job_id=...`).
    - **Resume Uploader**:
      - Drag-and-drop zone with animated upload state.
      - Supported formats indicator (`.pdf`, `.docx`, max 10MB).
      - Selected file preview with file name, file size in KB/MB, and remove/replace button.
    - **Brief Note**: Multi-line textarea for candidate note / cover statement.
  - `SubmissionFeedbackModal`:
    - Success modal displaying candidate name, applied job title, and unique Application Reference ID.
    - Option to download confirmation receipt or submit another application.

---

### 2. User Experience & Validation Rules

```
Candidate Arrives on /apply
   │
   ├──> 1. Selects Job from Dropdown (or preselected from URL)
   ├──> 2. Fills Name, Email, Phone
   ├──> 3. Uploads Resume (Drag & Drop or File Picker)
   ├──> 4. Types Brief Note
   └──> 5. Clicks "Submit Application"
         │
         ├──> [Client-Side Validation Checks]
         ├──> [Multipart POST to /api/applications]
         └──> [Instant Success Confirmation Modal]
```

- **Client-Side Validation**:
  - Checks for non-empty required fields.
  - Phone format validation.
  - Resume file extension and size validation before network dispatch.
- **Optimistic Loading & Error Handling**:
  - Visual spinner during upload.
  - User-friendly error banners if network fails or server responds with 422/400.

---

## Verification Plan
- Author frontend component tests using Vitest:
  1. Render job dropdown with seeded jobs.
  2. Validate required field errors when submitting empty form.
  3. Validate resume file selection and multipart submission payload.
  4. Verify successful submission modal state.
