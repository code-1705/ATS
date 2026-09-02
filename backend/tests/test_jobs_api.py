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

def test_admin_update_job_with_is_active_false():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_updated_job = dict(MOCK_JOB, is_active=False)
    mock_exec.data = [mock_updated_job]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_exec

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.patch(
            f"/api/admin/jobs/{MOCK_JOB['id']}",
            json={"is_active": False},
            headers=auth_headers
        )
        assert res.status_code == 200
        assert res.json()["is_active"] is False


def test_public_get_active_job_details():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [MOCK_JOB]
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_exec

    with patch("backend.routers.public.get_supabase_client", return_value=mock_supabase):
        res = client.get(f"/api/jobs/{MOCK_JOB['id']}")
        assert res.status_code == 200
        assert res.json()["id"] == MOCK_JOB["id"]
        assert res.json()["is_active"] is True

def test_public_get_inactive_job_details_returns_404():
    mock_supabase = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = []  # No active job found
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_exec

    with patch("backend.routers.public.get_supabase_client", return_value=mock_supabase):
        res = client.get(f"/api/jobs/{MOCK_JOB['id']}")
        assert res.status_code == 404
        assert "no longer active" in res.json()["detail"]


def test_admin_delete_job_cleans_up_resumes():
    mock_supabase = MagicMock()

    # 1. Mock select job
    job_exec = MagicMock()
    job_exec.data = [MOCK_JOB]

    # 2. Mock select applications for this job
    apps_exec = MagicMock()
    apps_exec.data = [
        {"id": "app-1", "resume_url": "/uploads/resumes/resume_1.pdf", "resume_filename": "resume_1.pdf"},
        {"id": "app-2", "resume_url": "/uploads/resumes/resume_2.pdf", "resume_filename": "resume_2.pdf"},
    ]

    # 3. Mock delete job
    delete_exec = MagicMock()
    delete_exec.data = [MOCK_JOB]

    def mock_table(table_name):
        mock_t = MagicMock()
        if table_name == "jobs":
            # select().eq().execute() -> job_exec
            mock_t.select.return_value.eq.return_value.execute.return_value = job_exec
            # delete().eq().execute() -> delete_exec
            mock_t.delete.return_value.eq.return_value.execute.return_value = delete_exec
        elif table_name == "applications":
            mock_t.select.return_value.eq.return_value.execute.return_value = apps_exec
        return mock_t

    mock_supabase.table.side_effect = mock_table

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase), \
         patch("backend.routers.admin.delete_resume_file", return_value=True) as mock_delete_file:
        res = client.delete(f"/api/admin/jobs/{MOCK_JOB['id']}", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["job_id"] == MOCK_JOB["id"]
        assert data["deleted_applications_count"] == 2
        assert data["cleaned_resumes_count"] == 2
        assert mock_delete_file.call_count == 2


def test_admin_delete_job_not_found_returns_404():
    mock_supabase = MagicMock()
    empty_exec = MagicMock()
    empty_exec.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = empty_exec

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.delete(f"/api/admin/jobs/{MOCK_JOB['id']}", headers=auth_headers)
        assert res.status_code == 404
        assert "Job not found" in res.json()["detail"]


def test_storage_delete_resume_file_local_and_supabase(tmp_path):
    from backend.services.storage import delete_resume_file, LOCAL_UPLOAD_DIR
    mock_supabase = MagicMock()

    # Create dummy local file
    test_dir = tmp_path / "uploads" / "resumes"
    test_dir.mkdir(parents=True, exist_ok=True)
    test_file = test_dir / "resume_test123.pdf"
    test_file.write_bytes(b"dummy resume content")
    assert test_file.exists()

    with patch("backend.services.storage.LOCAL_UPLOAD_DIR", test_dir), \
         patch("backend.services.storage.get_supabase_client", return_value=mock_supabase):
        res = delete_resume_file(
            resume_url=f"uploads/resumes/{test_file.name}",
            resume_filename=test_file.name
        )
        assert res is True
        assert not test_file.exists()
        mock_supabase.storage.from_.return_value.remove.assert_called_once_with([test_file.name])


def test_storage_delete_resume_file_prioritizes_url_over_display_name(tmp_path):
    """
    Issue #51 Regression Test:
    Ensures that physical stored UUID filename from resume_url is prioritized over candidate's original display name.
    """
    from backend.services.storage import delete_resume_file
    mock_supabase = MagicMock()

    test_dir = tmp_path / "uploads" / "resumes"
    test_dir.mkdir(parents=True, exist_ok=True)
    uuid_file = test_dir / "resume_abc123uuid.pdf"
    uuid_file.write_bytes(b"actual stored content")
    assert uuid_file.exists()

    with patch("backend.services.storage.LOCAL_UPLOAD_DIR", test_dir), \
         patch("backend.services.storage.get_supabase_client", return_value=mock_supabase):
        res = delete_resume_file(
            resume_url=f"/uploads/resumes/{uuid_file.name}",
            resume_filename="candidate_original_name.pdf"
        )
        assert res is True
        # The actual UUID file must be unlinked
        assert not uuid_file.exists()
        mock_supabase.storage.from_.return_value.remove.assert_called_once_with([uuid_file.name])


def test_resume_preview_redirect_with_query_param():
    """
    Issue #51 Regression Test:
    Ensures that passing ?redirect=true redirects the browser directly to the signed URL.
    """
    mock_supabase = MagicMock()
    app_exec = MagicMock()
    app_exec.data = [{"resume_url": "/uploads/resumes/resume_abc.pdf", "resume_filename": "resume.pdf"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = app_exec
    mock_supabase.storage.from_.return_value.create_signed_url.return_value = {
        "signedURL": "https://storage.supabase.co/signed/resume_abc.pdf"
    }

    with patch("backend.routers.admin.get_supabase_client", return_value=mock_supabase):
        res = client.get(
            f"/api/admin/applications/33333333-3333-3333-3333-333333333333/resume?redirect=true",
            headers=auth_headers,
            follow_redirects=False
        )
        assert res.status_code == 307
        assert res.headers["location"] == "https://storage.supabase.co/signed/resume_abc.pdf"



