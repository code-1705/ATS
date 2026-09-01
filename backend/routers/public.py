from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from typing import List, Optional
from backend.core.supabase_client import get_supabase_client
from backend.services.storage import save_resume_file
from backend.schemas.job import JobResponse
from backend.schemas.application import ApplicationResponse
from backend.models.stages import ApplicationStage, STAGE_LABELS, get_valid_next_stages


router = APIRouter(tags=["Public Candidate Application"])

@router.get("/jobs", response_model=List[JobResponse])
async def list_open_jobs():
    """
    Returns all active open jobs for the public application dropdown and open-roles board.
    """
    supabase = get_supabase_client()
    res = supabase.table("jobs").select("*").eq("is_active", True).order("created_at", desc=True).execute()
    jobs_data = res.data or []
    return [
        JobResponse(
            id=str(job["id"]),
            title=job["title"],
            department=job["department"],
            location=job.get("location", "Remote"),
            job_type=job.get("job_type", "Full-Time"),
            description=job["description"],
            is_active=job.get("is_active", True),
            created_at=str(job.get("created_at", "")),
            updated_at=str(job.get("updated_at", ""))
        )
        for job in jobs_data
    ]

@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_details(job_id: str):
    """
    Fetches specifications for a specific job posting.
    """
    supabase = get_supabase_client()
    res = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    job = res.data[0]
    return JobResponse(
        id=str(job["id"]),
        title=job["title"],
        department=job["department"],
        location=job.get("location", "Remote"),
        job_type=job.get("job_type", "Full-Time"),
        description=job["description"],
        is_active=job.get("is_active", True),
        created_at=str(job.get("created_at", "")),
        updated_at=str(job.get("updated_at", ""))
    )

@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_general_application(
    job_id: str = Form(...),
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    candidate_phone: str = Form(...),
    brief_note: Optional[str] = Form(""),
    resume: UploadFile = File(...)
):
    """
    General candidate application submission (job selected from dropdown).
    """
    supabase = get_supabase_client()

    # Validate that selected job exists and is active
    job_res = supabase.table("jobs").select("id, title, department, is_active").eq("id", job_id).execute()
    if not job_res.data or len(job_res.data) == 0:
        raise HTTPException(status_code=400, detail="The selected job does not exist.")
    
    job = job_res.data[0]
    if not job.get("is_active", True):
        raise HTTPException(status_code=400, detail="This job is no longer accepting new applications.")

    # Check for existing duplicate application for this job and email
    normalized_email = candidate_email.strip().lower()
    existing_app_res = supabase.table("applications").select("id").eq("job_id", job_id).eq("candidate_email", normalized_email).execute()
    if existing_app_res.data and len(existing_app_res.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted an application for this position."
        )

    # Validate and save resume file
    saved_file = await save_resume_file(resume)

    # Insert into Supabase applications table
    app_payload = {
        "job_id": job_id,
        "candidate_name": candidate_name.strip(),
        "candidate_email": normalized_email,
        "candidate_phone": candidate_phone.strip(),

        "resume_url": saved_file["resume_url"],
        "resume_filename": saved_file["original_filename"],
        "resume_file_size": saved_file["file_size"],
        "brief_note": brief_note or "",
        "stage": ApplicationStage.APPLIED.value
    }

    insert_res = supabase.table("applications").insert(app_payload).execute()
    if not insert_res.data or len(insert_res.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to save application record.")
    
    created_app = insert_res.data[0]

    return ApplicationResponse(
        id=str(created_app["id"]),
        job_id=str(created_app["job_id"]),
        job_title=job["title"],
        job_department=job["department"],
        candidate_name=created_app["candidate_name"],
        candidate_email=created_app["candidate_email"],
        candidate_phone=created_app["candidate_phone"],
        resume_url=created_app["resume_url"],
        resume_filename=created_app["resume_filename"],
        resume_file_size=created_app["resume_file_size"],
        brief_note=created_app.get("brief_note", ""),
        stage=created_app["stage"],
        stage_label=STAGE_LABELS.get(ApplicationStage(created_app["stage"]), "Applied (Initial)"),
        stage_updated_at=str(created_app.get("stage_updated_at", "")),
        created_at=str(created_app.get("created_at", "")),
        valid_next_stages=get_valid_next_stages(created_app["stage"])
    )


@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_targeted_job_application(
    job_id: str,
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    candidate_phone: str = Form(...),
    brief_note: Optional[str] = Form(""),
    resume: UploadFile = File(...)
):
    """
    Targeted application submission for a specific job URL path.
    """
    return await submit_general_application(
        job_id=job_id,
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        candidate_phone=candidate_phone,
        brief_note=brief_note,
        resume=resume
    )
