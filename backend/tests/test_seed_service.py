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

def test_seed_admin_user_raises_on_insert_failure():
    from unittest.mock import patch, MagicMock
    from backend.services.seed_service import seed_admin_user
    import pytest

    mock_supabase = MagicMock()
    # Mock user not existing
    mock_select_exec = MagicMock()
    mock_select_exec.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_select_exec

    # Mock insert returning empty data (failure)
    mock_insert_exec = MagicMock()
    mock_insert_exec.data = []
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_exec

    with patch("backend.services.seed_service.get_supabase_client", return_value=mock_supabase):
        with pytest.raises(RuntimeError, match="Failed to create admin user"):
            seed_admin_user()

def test_seed_default_jobs_raises_on_insert_failure():
    from unittest.mock import patch, MagicMock
    from backend.services.seed_service import seed_default_jobs
    import pytest

    mock_supabase = MagicMock()
    # Mock jobs table empty
    mock_select_exec = MagicMock()
    mock_select_exec.data = []
    mock_supabase.table.return_value.select.return_value.execute.return_value = mock_select_exec

    # Mock insert returning empty data (failure)
    mock_insert_exec = MagicMock()
    mock_insert_exec.data = []
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_exec

    with patch("backend.services.seed_service.get_supabase_client", return_value=mock_supabase):
        with pytest.raises(RuntimeError, match="Failed to seed default jobs"):
            seed_default_jobs()


def test_seed_default_jobs_skips_when_jobs_exist_under_ten():
    """
    Issue #30 Regression Test:
    When jobs table has < 10 jobs (e.g. admin deleted some seed jobs),
    seed_default_jobs must NOT resurrect deleted jobs or invoke insert.
    """
    from unittest.mock import patch, MagicMock
    from backend.services.seed_service import seed_default_jobs

    mock_supabase = MagicMock()
    # Mock jobs table having 3 jobs (e.g., 7 jobs were deleted by admin)
    existing_jobs = [
        {"id": "job-1", "title": "Senior Full-Stack Engineer (React + FastAPI)"},
        {"id": "job-2", "title": "AI/ML Engineer (LLMs & Multi-Agent Systems)"},
        {"id": "job-3", "title": "Custom Recruiter Role"}
    ]
    mock_select_exec = MagicMock()
    mock_select_exec.data = existing_jobs
    mock_supabase.table.return_value.select.return_value.execute.return_value = mock_select_exec

    with patch("backend.services.seed_service.get_supabase_client", return_value=mock_supabase):
        result = seed_default_jobs(force=False)
        # Should return existing jobs without attempting insert
        assert result == existing_jobs
        mock_supabase.table.return_value.insert.assert_not_called()


def test_seed_default_jobs_seeds_when_table_empty():
    """
    Verifies that seed_default_jobs inserts all 10 DEFAULT_JOBS when the jobs table is empty.
    """
    from unittest.mock import patch, MagicMock
    from backend.services.seed_service import seed_default_jobs

    mock_supabase = MagicMock()
    mock_select_exec = MagicMock()
    mock_select_exec.data = []
    mock_supabase.table.return_value.select.return_value.execute.return_value = mock_select_exec

    inserted_jobs = [{"id": f"job-{i}", "title": DEFAULT_JOBS[i]["title"]} for i in range(10)]
    mock_insert_exec = MagicMock()
    mock_insert_exec.data = inserted_jobs
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_exec

    with patch("backend.services.seed_service.get_supabase_client", return_value=mock_supabase):
        result = seed_default_jobs()
        assert len(result) == 10
        mock_supabase.table.return_value.insert.assert_called_once()
        inserted_payload = mock_supabase.table.return_value.insert.call_args[0][0]
        assert len(inserted_payload) == 10


def test_seed_default_jobs_force_inserts_missing_jobs():
    """
    Verifies that when force=True is passed, missing default jobs are inserted.
    """
    from unittest.mock import patch, MagicMock
    from backend.services.seed_service import seed_default_jobs

    mock_supabase = MagicMock()
    # Table has 1 default job
    existing_jobs = [
        {"id": "job-1", "title": DEFAULT_JOBS[0]["title"]}
    ]
    mock_select_exec = MagicMock()
    mock_select_exec.data = existing_jobs
    mock_supabase.table.return_value.select.return_value.execute.return_value = mock_select_exec

    mock_insert_exec = MagicMock()
    mock_insert_exec.data = [{"id": f"job-{i}", "title": DEFAULT_JOBS[i]["title"]} for i in range(1, 10)]
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_exec

    with patch("backend.services.seed_service.get_supabase_client", return_value=mock_supabase):
        result = seed_default_jobs(force=True)
        assert len(result) == 10
        mock_supabase.table.return_value.insert.assert_called_once()
        inserted_payload = mock_supabase.table.return_value.insert.call_args[0][0]
        assert len(inserted_payload) == 9

