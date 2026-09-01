import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

@app.get("/api/health", tags=["Health Check"])
async def api_health_check():
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

# ====================================================================
# SPA Static Assets & Fallback Routing (Unified Single-Container Hosting)
# ====================================================================
frontend_dist = Path("frontend/dist")
if not frontend_dist.exists():
    frontend_dist = Path("dist")

if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_fallback(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/", tags=["Health Check"])
    async def root_fallback():
        return {
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "healthy",
            "message": "Frontend build not detected locally. Run 'npm run build' in frontend/ or access API at /api/jobs and /docs."
        }
