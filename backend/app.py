import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.core.config import settings
from backend.services.seed_service import run_seed_bootstrap
from backend.routers import auth, public, admin

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("enterrecruit.app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: auto-bootstraps admin and 10 default jobs on startup if needed.
    """
    logger.info("Starting EnterRecruit API Server...")
    try:
        # Attempt bootstrap seed check
        bootstrap_result = run_seed_bootstrap()
        logger.info(f"Database bootstrap status: {bootstrap_result}")
    except Exception as e:
        logger.warning(f"Supabase connection/seed skipped or offline during startup: {str(e)}")
    
    yield
    logger.info("EnterRecruit API Server shutdown.")

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI Candidate Application & Recruitment Management System Backend.",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure local upload directories exist and mount static files
upload_dir = Path("uploads/resumes")
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API Routers
app.include_router(public.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["Health Check"])
async def root_health_check():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "endpoints": {
            "docs": "/docs",
            "public_jobs": f"{settings.API_V1_PREFIX}/jobs",
            "apply": f"{settings.API_V1_PREFIX}/applications",
            "admin_login": f"{settings.API_V1_PREFIX}/auth/login"
        }
    }
