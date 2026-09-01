import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.app import app
from backend.core.security import create_access_token

client = TestClient(app)
admin_token = create_access_token({"sub": "admin@enter.in", "user_id": "test-admin", "role": "ADMIN"})
auth_headers = {"Authorization": f"Bearer {admin_token}"}

MOCK_JOB = {
    "id": "22222222-2222-2222-2222-222222222222",
    "title": "Senior Full-Stack Engineer",
    "department": "Engineering",
    "is_active": True
}

MOCK_APP = {
    "id": "33333333-3333-3333-3333-333333333333",
    "job_id": "22222222-2222-2222-2222-222222222222",
    "candidate_name": "Jane Doe",
    "candidate_email": "jane@example.com",
    "candidate_phone": "+1234567890",
    "resume_url": "/uploads/resumes/resume_test.pdf",
    "resume_filename": "resume.pdf",
    "resume_file_size": 1024,
    "brief_note": "Excited to apply!",
    "stage": "APPLIED",
    "stage_updated_at": "2026-09-01T12:00:00Z",
    "created_at": "2026-09-01T12:00:00Z",
    "jobs": {"title": "Senior Full-Stack Engineer", "department": "Engineering"}
}

def test_submit_general_application():
    mock_supabase = MagicMock()
    
    # Mock job lookup
    mock_job_exec = MagicMock()
    mock_job_exec.data = [MOCK_JOB]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_job_exec

    # Mock insert application
    mock_insert_exec = MagicMock()
    mock_insert_exec.data = [MOCK_APP]
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_exec

    pdf_content = b"%PDF-1.4 Mock PDF Content for testing"
    files = {"resume": ("my_resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {
        "job_id": "22222222-2222-2222-2222-222222222222",
        "candidate_name": "Jane Doe",
        "candidate_email": "jane@example.com",
        "candidate_phone": "+1234567890",
        "brief_note": "Excited to apply!"
    }

    with patch("backend.routers.public.get_supabase_client", return_value=mock_supabase):
        res = client.post("/api/applications", data=data, files=files)
        assert res.status_code == 201
        res_data = res.json()
        assert res_data["candidate_name"] == "Jane Doe"
        assert res_data["stage"] == "APPLIED"

def test_submit_targeted_job_application():
    mock_supabase = MagicMock()
    mock_job_exec = MagicMock()
    mock_job_exec.data = [MOCK_JOB]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_job_exec

    mock_insert_exec = MagicMock()
    mock_insert_exec.data = [MOCK_APP]
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_exec

    pdf_content = b"%PDF-1.4 Mock PDF Content"
    files = {"resume": ("resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {
        "candidate_name": "Jane Doe",
        "candidate_email": "jane@example.com",
        "candidate_phone": "+1234567890",
        "brief_note": "Direct application"
    }

    with patch("backend.routers.public.get_supabase_client", return_value=mock_supabase):
        res = client.post("/api/jobs/22222222-2222-2222-2222-222222222222/apply", data=data, files=files)
        assert res.status_code == 201
        assert res.json()["candidate_name"] == "Jane Doe"

def test_submit_duplicate_application_returns_409():
    mock_supabase = MagicMock()
    
    # Mock job lookup
    mock_job_exec = MagicMock()
    mock_job_exec.data = [MOCK_JOB]
    
    # Mock existing application check returning an existing app
    mock_existing_exec = MagicMock()
    mock_existing_exec.data = [{"id": "existing-app-uuid"}]

    def table_router(table_name):
        mock_tbl = MagicMock()
        if table_name == "jobs":
            mock_tbl.select.return_value.eq.return_value.execute.return_value = mock_job_exec
        elif table_name == "applications":
            mock_tbl.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_existing_exec
        return mock_tbl

    mock_supabase.table.side_effect = table_router

    pdf_content = b"%PDF-1.4 Mock PDF Content"
    files = {"resume": ("resume.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {
        "job_id": "22222222-2222-2222-2222-222222222222",
        "candidate_name": "Jane Doe",
        "candidate_email": "jane@example.com",
        "candidate_phone": "+1234567890",
        "brief_note": "Applying again"
    }

    with patch("backend.routers.public.get_supabase_client", return_value=mock_supabase):
        res = client.post("/api/applications", data=data, files=files)
        assert res.status_code == 409
        assert "already submitted an application" in res.json()["detail"]


def test_admin_update_application_stage_valid():
    mock_supabase = MagicMock()
    
    # Mock current app fetch
    mock_fetch_exec = MagicMock()
    mock_fetch_exec.data = [MOCK_APP]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_fetch_exec

    # Mock update
    updated_app = dict(MOCK_APP, stage="R1")
    mock_update_exec = MagicMock()
    mock_update_exec.data = [updated_app]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_exec

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.patch(
            "/api/admin/applications/33333333-3333-3333-3333-333333333333/stage",
            json={"stage": "R1"},
            headers=auth_headers
        )
        assert res.status_code == 200
        assert res.json()["stage"] == "R1"

def test_admin_update_application_stage_with_audit_log_error():
    mock_supabase = MagicMock()
    mock_fetch_exec = MagicMock()
    mock_fetch_exec.data = [MOCK_APP]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_fetch_exec

    updated_app = dict(MOCK_APP, stage="R1")
    mock_update_exec = MagicMock()
    mock_update_exec.data = [updated_app]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_update_exec

    # Mock insert raising exception to test resilient logging
    mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception("DB constraint error")

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.patch(
            "/api/admin/applications/33333333-3333-3333-3333-333333333333/stage",
            json={"stage": "R1"},
            headers=auth_headers
        )
        assert res.status_code == 200
        assert res.json()["stage"] == "R1"


def test_unauthenticated_resume_access_is_rejected():
    res = client.get("/api/admin/applications/33333333-3333-3333-3333-333333333333/resume")
    assert res.status_code == 401
    assert "Authentication token required" in res.json()["detail"]

def test_authenticated_resume_access_with_bearer_token():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [{"resume_url": "https://supabase.example.com/resumes/resume.pdf", "resume_filename": "resume.pdf"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_exec

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.get(
            "/api/admin/applications/33333333-3333-3333-3333-333333333333/resume",
            headers=auth_headers
        )
        assert res.status_code == 200
        assert res.json()["resume_url"] == "https://supabase.example.com/resumes/resume.pdf"

def test_authenticated_resume_access_with_query_token():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [{"resume_url": "https://supabase.example.com/resumes/resume.pdf", "resume_filename": "resume.pdf"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_exec

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.get(
            f"/api/admin/applications/33333333-3333-3333-3333-333333333333/resume?token={admin_token}"
        )
        assert res.status_code == 200
        assert res.json()["resume_url"] == "https://supabase.example.com/resumes/resume.pdf"

