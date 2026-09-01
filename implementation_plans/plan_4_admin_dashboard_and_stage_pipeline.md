# Implementation Plan - Submodule 4: Admin Dashboard, Job CRUD & Stage Progression Pipeline

## Overview
This submodule develops the administrative control center for EnterRecruit. It includes the secure admin login, full Job CRUD operations, a real-time candidate management pipeline with dynamic filtering by job and stage, candidate detail inspection, resume preview/download, and stage progression controls.

---

## Technical Specifications & UI/UX Architecture

### 1. Route & Navigation Architecture
- **Routes**:
  - `/admin/login`: Clean authentication screen with email & password inputs, plus a "Fill Demo Credentials" quick-button (`admin@enter.in`).
  - `/admin`: Main dashboard shell with active authentication guard (redirects unauthenticated users to `/admin/login`).
  - Tabs:
    - **Tab 1: Candidate Applications**: Comprehensive applicant tracker with filters, search, and stage controls.
    - **Tab 2: Job Management**: Job listing table with Add/Edit/Delete modals.

---

### 2. Tab 1: Candidate Pipeline & Application Management

#### A. Multi-Dimensional Filter Bar
- **Job Filter Dropdown**: "All Jobs" option + all active/archived jobs.
- **Stage Filter Multi-Selector / Chips**:
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
- **Search Bar**: Instant debounced search for candidate name, email, or phone.
- **Summary Metrics**: Quick counters showing total candidates, in-progress rounds, rejected, and approved.

#### B. Candidate Data Table / Cards
- Table columns:
  - **Candidate**: Name, Email, Phone.
  - **Applied Job**: Job Title & Department badge.
  - **Applied Date**: Relative / formatted date.
  - **Resume**: One-click preview button (opens PDF modal) / download button.
  - **Current Stage**: Color-coded status badge with instant stage change dropdown.
  - **Actions**: "View Details" button opening candidate inspection drawer.

#### C. Candidate Detail Drawer / Modal
- Complete view of all captured fields:
  - Full Name, Phone, Email.
  - Selected Job & Department.
  - Brief Note submitted by candidate.
  - Interactive Resume Viewer (embedded PDF preview).
  - Quick Stage Transition Action buttons:
    - `Advance to R1` / `Reject at Initial`
    - `Advance to R2` / `Reject R1`
    - `Advance to R3` / `Reject R2`
    - `Approve Candidate` / `Reject R3`

#### D. Color-Coded Stage Badges
- `Applied`: Slate / Indigo badge.
- `R1` / `R2` / `R3`: Blue & Violet badges.
- `Approved`: Emerald Green badge.
- `Reject` / `R1 Reject` / `R2 Reject` / `R3 Reject`: Rose / Amber Reject badges.

---

### 3. Tab 2: Job Management (CRUD)

- **Job Listing Table**:
  - Columns: Title, Department, Location, Type, Status (Active/Inactive), Total Applications, Actions.
- **Create Job Modal**:
  - Inputs: Title, Department, Location (Remote/Onsite), Type (Full-time/Contract), Description, Active toggle.
- **Edit Job Modal**:
  - Pre-filled form allowing immediate updates to role specifications.
- **Delete Job Dialog**:
  - Confirmation modal warning if candidates have already applied for this job, offering soft-archive or hard delete.

---

## Verification Plan
- Author end-to-end frontend tests verifying:
  1. Admin login with `admin@enter.in` storing JWT in local storage.
  2. Filtering candidate list by job dropdown.
  3. Filtering candidate list by stage dropdown.
  4. Modifying candidate stage from `APPLIED` to `R1` and verifying instantaneous UI update.
  5. Creating, updating, and deleting a job posting.
