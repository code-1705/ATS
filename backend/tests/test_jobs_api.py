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
    "location": "Remote",
    "job_type": "Full-Time",
    "description": "Build high performance applications.",
    "is_active": True,
    "created_at": "2026-09-01T12:00:00Z",
    "updated_at": "2026-09-01T12:00:00Z"
}

def test_public_list_jobs():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [MOCK_JOB]
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_exec

    with patch("backend.routers.public.get_supabase_client", return_value=mock_supabase):
        res = client.get("/api/jobs")
        assert res.status_code == 200
        jobs = res.json()
        assert len(jobs) == 1
        assert jobs[0]["title"] == "Senior Full-Stack Engineer"

def test_admin_create_job():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [MOCK_JOB]
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_exec

    payload = {
        "title": "Senior Full-Stack Engineer",
        "department": "Engineering",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Build high performance applications.",
        "is_active": True
    }

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.post("/api/admin/jobs", json=payload, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "Senior Full-Stack Engineer"

def test_admin_list_jobs_with_app_count():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_job_with_apps = dict(MOCK_JOB, applications=[{"count": 5}])
    mock_exec.data = [mock_job_with_apps]
    mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value = mock_exec

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.get("/api/admin/jobs", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == 1
        assert data["jobs"][0]["applications_count"] == 5

