from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    department: str = Field(..., min_length=2, max_length=100)
    location: str = Field(default="Remote", max_length=100)
    job_type: str = Field(default="Full-Time", max_length=50)
    description: str = Field(..., min_length=10)
    is_active: bool = True

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    job_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, min_length=10)
    is_active: Optional[bool] = None

class JobResponse(JobBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    applications_count: Optional[int] = 0

class JobListResponse(BaseModel):
    total: int
    jobs: List[JobResponse]
