from fastapi import APIRouter, HTTPException, Depends, Query, status
from fastapi.responses import FileResponse
from typing import List, Optional
from pathlib import Path
from backend.core.supabase_client import get_supabase_client
from backend.routers.auth import get_current_admin
from backend.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse
from backend.schemas.application import (
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationDetailResponse,
    StageUpdateRequest,
    AuditLogResponse
)
from backend.models.stages import (
    ApplicationStage,
    STAGE_LABELS,
    is_valid_stage_transition
)

router = APIRouter(prefix="/admin", tags=["Admin Dashboard & Management"], dependencies=[Depends(get_current_admin)])

# ====================================================================
# Job Management Endpoints (CRUD)
# ====================================================================

@router.get("/jobs", response_model=JobListResponse)
async def list_all_jobs_for_admin():
    """
    Returns all jobs with application counts per job.
    """
    supabase = get_supabase_client()
    jobs_res = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
    jobs_data = jobs_res.data or []

    # Get application counts per job
    apps_res = supabase.table("applications").select("job_id").execute()
    apps_data = apps_res.data or []
    counts_map = {}
    for app in apps_data:
        jid = str(app["job_id"])
        counts_map[jid] = counts_map.get(jid, 0) + 1

    formatted_jobs = [
        JobResponse(
            id=str(job["id"]),
            title=job["title"],
            department=job["department"],
            location=job.get("location", "Remote"),
            job_type=job.get("job_type", "Full-Time"),
            description=job["description"],
            is_active=job.get("is_active", True),
            created_at=str(job.get("created_at", "")),
            updated_at=str(job.get("updated_at", "")),
            applications_count=counts_map.get(str(job["id"]), 0)
        )
        for job in jobs_data
    ]

    return JobListResponse(total=len(formatted_jobs), jobs=formatted_jobs)

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_new_job(payload: JobCreate):
    """
    Creates a new job posting.
    """
    supabase = get_supabase_client()
    job_dict = payload.model_dump()
    res = supabase.table("jobs").insert(job_dict).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to create job posting.")
    
    created = res.data[0]
    return JobResponse(
        id=str(created["id"]),
        title=created["title"],
        department=created["department"],
        location=created.get("location", "Remote"),
        job_type=created.get("job_type", "Full-Time"),
        description=created["description"],
        is_active=created.get("is_active", True),
        created_at=str(created.get("created_at", "")),
        updated_at=str(created.get("updated_at", "")),
        applications_count=0
    )

@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(job_id: str, payload: JobUpdate):
    """
    Updates an existing job posting.
    """
    supabase = get_supabase_client()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    res = supabase.table("jobs").update(update_data).eq("id", job_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Job not found.")

    updated = res.data[0]
    return JobResponse(
        id=str(updated["id"]),
        title=updated["title"],
        department=updated["department"],
        location=updated.get("location", "Remote"),
        job_type=updated.get("job_type", "Full-Time"),
        description=updated["description"],
        is_active=updated.get("is_active", True),
        created_at=str(updated.get("created_at", "")),
        updated_at=str(updated.get("updated_at", ""))
    )

@router.delete("/jobs/{job_id}", status_code=status.HTTP_200_OK)
async def delete_job(job_id: str):
    """
    Deletes a job posting and its associated applications.
    """
    supabase = get_supabase_client()
    res = supabase.table("jobs").delete().eq("id", job_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"message": "Job deleted successfully.", "job_id": job_id}

# ====================================================================
# Candidate Applications & Stage Pipeline Endpoints
# ====================================================================

@router.get("/applications", response_model=ApplicationListResponse)
async def list_candidate_applications(
    job_id: Optional[str] = Query(None, description="Filter by Job ID"),
    stage: Optional[str] = Query(None, description="Filter by Hiring Stage"),
    search: Optional[str] = Query(None, description="Search candidate name, email, or phone")
):
    """
    Lists candidate applications with multi-filter support (Job, Stage, Search).
    """
    supabase = get_supabase_client()
    
    # Query applications with joined job details
    query = supabase.table("applications").select("*, jobs(title, department)").order("created_at", desc=True)

    if job_id and job_id.lower() != "all":
        query = query.eq("job_id", job_id)
    if stage and stage.upper() != "ALL":
        query = query.eq("stage", stage.upper())

    res = query.execute()
    apps = res.data or []

    # Apply search filter if present
    if search and search.strip():
        term = search.strip().lower()
        apps = [
            a for a in apps
            if term in a.get("candidate_name", "").lower()
            or term in a.get("candidate_email", "").lower()
            or term in a.get("candidate_phone", "").lower()
        ]

    formatted_apps = []
    for app in apps:
        job_info = app.get("jobs") or {}
        stg = app.get("stage", "APPLIED")
        try:
            stg_enum = ApplicationStage(stg)
            label = STAGE_LABELS.get(stg_enum, stg)
        except ValueError:
            label = stg

        formatted_apps.append(
            ApplicationResponse(
                id=str(app["id"]),
                job_id=str(app["job_id"]),
                job_title=job_info.get("title", "Unknown Job"),
                job_department=job_info.get("department", "General"),
                candidate_name=app["candidate_name"],
                candidate_email=app["candidate_email"],
                candidate_phone=app["candidate_phone"],
                resume_url=app["resume_url"],
                resume_filename=app.get("resume_filename", "resume.pdf"),
                resume_file_size=app.get("resume_file_size", 0),
                brief_note=app.get("brief_note", ""),
                stage=stg,
                stage_label=label,
                stage_updated_at=str(app.get("stage_updated_at", "")),
                created_at=str(app.get("created_at", ""))
            )
        )

    return ApplicationListResponse(total=len(formatted_apps), applications=formatted_apps)

@router.get("/applications/{application_id}", response_model=ApplicationDetailResponse)
async def get_single_candidate_details(application_id: str):
    """
    Returns full details for a single candidate application including audit history.
    """
    supabase = get_supabase_client()
    res = supabase.table("applications").select("*, jobs(title, department)").eq("id", application_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Application not found.")
    
    app = res.data[0]
    job_info = app.get("jobs") or {}
    stg = app.get("stage", "APPLIED")
    label = STAGE_LABELS.get(ApplicationStage(stg), stg) if stg in ApplicationStage._value2member_map_ else stg

    # Fetch audit logs
    audit_res = supabase.table("application_audit_logs").select("*").eq("application_id", application_id).order("created_at", desc=True).execute()
    audit_logs = [
        AuditLogResponse(
            id=log["id"],
            application_id=str(log["application_id"]),
            from_stage=log["from_stage"],
            to_stage=log["to_stage"],
            changed_by=log.get("changed_by", "admin@enter.in"),
            created_at=str(log.get("created_at", ""))
        )
        for log in (audit_res.data or [])
    ]

    return ApplicationDetailResponse(
        id=str(app["id"]),
        job_id=str(app["job_id"]),
        job_title=job_info.get("title", "Unknown Job"),
        job_department=job_info.get("department", "General"),
        candidate_name=app["candidate_name"],
        candidate_email=app["candidate_email"],
        candidate_phone=app["candidate_phone"],
        resume_url=app["resume_url"],
        resume_filename=app.get("resume_filename", "resume.pdf"),
        resume_file_size=app.get("resume_file_size", 0),
        brief_note=app.get("brief_note", ""),
        stage=stg,
        stage_label=label,
        stage_updated_at=str(app.get("stage_updated_at", "")),
        created_at=str(app.get("created_at", "")),
        audit_logs=audit_logs
    )

@router.patch("/applications/{application_id}/stage", response_model=ApplicationResponse)
async def update_candidate_stage(
    application_id: str,
    payload: StageUpdateRequest,
    admin: dict = Depends(get_current_admin)
):
    """
    Transitions a candidate application to a new hiring stage with FSM validation.
    """
    supabase = get_supabase_client()
    res = supabase.table("applications").select("*, jobs(title, department)").eq("id", application_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Application not found.")

    current_app = res.data[0]
    current_stage = current_app.get("stage", "APPLIED")
    target_stage = payload.stage.value

    # Validate transition
    if not is_valid_stage_transition(current_stage, target_stage):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage transition from '{current_stage}' to '{target_stage}'."
        )

    # Update stage in applications table
    update_res = supabase.table("applications").update({"stage": target_stage}).eq("id", application_id).execute()
    if not update_res.data or len(update_res.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to update stage.")

    # Record in audit log
    audit_entry = {
        "application_id": application_id,
        "from_stage": current_stage,
        "to_stage": target_stage,
        "changed_by": admin.get("sub", "admin@enter.in")
    }
    supabase.table("application_audit_logs").insert(audit_entry).execute()

    updated = update_res.data[0]
    job_info = current_app.get("jobs") or {}

    return ApplicationResponse(
        id=str(updated["id"]),
        job_id=str(updated["job_id"]),
        job_title=job_info.get("title", "Unknown Job"),
        job_department=job_info.get("department", "General"),
        candidate_name=updated["candidate_name"],
        candidate_email=updated["candidate_email"],
        candidate_phone=updated["candidate_phone"],
        resume_url=updated["resume_url"],
        resume_filename=updated.get("resume_filename", "resume.pdf"),
        resume_file_size=updated.get("resume_file_size", 0),
        brief_note=updated.get("brief_note", ""),
        stage=target_stage,
        stage_label=STAGE_LABELS.get(payload.stage, target_stage),
        stage_updated_at=str(updated.get("stage_updated_at", "")),
        created_at=str(updated.get("created_at", ""))
    )

@router.get("/applications/{application_id}/resume")
async def preview_or_download_resume(application_id: str):
    """
    Streams the candidate's resume for in-browser preview or download.
    """
    supabase = get_supabase_client()
    res = supabase.table("applications").select("resume_url, resume_filename").eq("id", application_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Application not found.")

    app = res.data[0]
    resume_url = app.get("resume_url", "")
    filename = app.get("resume_filename", "resume.pdf")

    # If it's a local path
    if resume_url.startswith("/uploads/resumes/"):
        file_path = Path(resume_url.lstrip("/"))
        if not file_path.exists():
            # Check relative to backend or root
            file_path = Path("uploads/resumes") / Path(resume_url).name
        
        if file_path.exists():
            media_type = "application/pdf" if file_path.suffix.lower() == ".pdf" else "application/octet-stream"
            return FileResponse(
                path=str(file_path),
                filename=filename,
                media_type=media_type,
                headers={"Content-Disposition": f"inline; filename=\"{filename}\""}
            )

    return {"resume_url": resume_url, "filename": filename}
