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

