import os
import secrets
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "backend/.env"), extra="allow")

    PROJECT_NAME: str = "Careers Hub API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Supabase Configuration (PostgreSQL Data Layer)
    SUPABASE_URL: str = "https://mock.supabase.co"
    SUPABASE_KEY: str = "mock-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "mock-service-role-key"

    # JWT Authentication
    JWT_SECRET_KEY: str = "ats-default-insecure-dev-jwt-secret-key-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Admin Defaults
    ADMIN_DEFAULT_EMAIL: str = "admin@enter.in"
    ADMIN_DEFAULT_PASSWORD: str = "adminpassword123"

    # Allowed Origins for CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,https://enterrecruit.vercel.app"
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
