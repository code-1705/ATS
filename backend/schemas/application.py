from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from backend.models.stages import ApplicationStage

class ApplicationBase(BaseModel):
    candidate_name: str = Field(..., min_length=2, max_length=150)
    candidate_email: EmailStr
    candidate_phone: str = Field(..., min_length=5, max_length=30)
    brief_note: Optional[str] = Field(default="", max_length=2000)

class ApplicationCreate(ApplicationBase):
    job_id: str

class StageUpdateRequest(BaseModel):
    stage: ApplicationStage
    comment: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: Optional[str] = None
    job_department: Optional[str] = None
    candidate_name: str
    candidate_email: str
    candidate_phone: str
    resume_url: str
    resume_filename: str
    resume_file_size: int
    brief_note: Optional[str] = ""
    stage: str
    stage_label: Optional[str] = None
    stage_updated_at: Optional[str] = None
    created_at: Optional[str] = None
    valid_next_stages: List[str] = Field(default_factory=list)


class ApplicationListResponse(BaseModel):
    total: int
    applications: List[ApplicationResponse]

class AuditLogResponse(BaseModel):
    id: int
    application_id: str
    from_stage: str
    to_stage: str
    changed_by: str
    created_at: str

class ApplicationDetailResponse(ApplicationResponse):
    audit_logs: List[AuditLogResponse] = []
