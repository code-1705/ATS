from datetime import timedelta
from backend.core.config import settings
from backend.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token
)

def test_settings_defaults():
    assert settings.PROJECT_NAME == "Careers Hub API"
    assert settings.ADMIN_DEFAULT_EMAIL == "admin@enter.in"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES >= 60
    assert len(settings.JWT_SECRET_KEY) >= 32
    assert "*" not in settings.CORS_ORIGINS
    assert len(settings.CORS_ORIGINS) > 0



def test_password_hashing_and_verification():
    raw_password = "adminpassword123"
    hashed = get_password_hash(raw_password)
    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "admin@enter.in", "role": "ADMIN", "user_id": "test-uuid-1234"}
    token = create_access_token(payload, expires_delta=timedelta(minutes=30))
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "admin@enter.in"
    assert decoded["role"] == "ADMIN"
    assert decoded["user_id"] == "test-uuid-1234"
    assert "exp" in decoded

def test_invalid_jwt_token_returns_none():
    assert decode_access_token("invalid.jwt.token") is None
