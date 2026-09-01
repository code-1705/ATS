from backend.services.seed_service import DEFAULT_JOBS
from backend.core.config import settings

def test_default_jobs_count_is_ten():
    assert len(DEFAULT_JOBS) == 10

def test_default_jobs_have_required_fields():
    required_fields = {"title", "department", "location", "job_type", "description", "is_active"}
    for job in DEFAULT_JOBS:
        assert required_fields.issubset(job.keys())
        assert len(job["title"]) > 3
        assert len(job["department"]) > 1
        assert job["is_active"] is True

def test_default_admin_email():
    assert settings.ADMIN_DEFAULT_EMAIL == "admin@enter.in"
