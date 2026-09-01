import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.app import app
from backend.core.security import get_password_hash, create_access_token

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "public_jobs" in data["endpoints"]

def test_login_success():
    mock_user = {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "admin@enter.in",
        "hashed_password": get_password_hash("adminpassword123"),
        "name": "System Admin",
        "role": "ADMIN"
    }

    mock_supabase = MagicMock()
    mock_execute = MagicMock()
    mock_execute.data = [mock_user]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_execute

    with patch("backend.routers.auth.get_supabase_client", return_value=mock_supabase):
        res = client.post("/api/auth/login", json={"email": "admin@enter.in", "password": "adminpassword123"})
        assert res.status_code == 200
        body = res.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert body["user"]["email"] == "admin@enter.in"

def test_login_invalid_password():
    mock_user = {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "admin@enter.in",
        "hashed_password": get_password_hash("adminpassword123"),
        "name": "System Admin",
        "role": "ADMIN"
    }

    mock_supabase = MagicMock()
    mock_execute = MagicMock()
    mock_execute.data = [mock_user]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_execute

    with patch("backend.routers.auth.get_supabase_client", return_value=mock_supabase):
        res = client.post("/api/auth/login", json={"email": "admin@enter.in", "password": "wrongpassword"})
        assert res.status_code == 401
        assert "Invalid email or password" in res.json()["detail"]

def test_get_current_user_profile():
    token = create_access_token({"sub": "admin@enter.in", "user_id": "test-uuid", "role": "ADMIN", "name": "System Admin"})
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@enter.in"
    assert data["role"] == "ADMIN"
