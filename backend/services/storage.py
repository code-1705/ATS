import os
import uuid
import logging
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from backend.core.supabase_client import get_supabase_client
from backend.core.config import settings

logger = logging.getLogger("enterrecruit.storage")
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
LOCAL_UPLOAD_DIR = Path("uploads/resumes")

async def save_resume_file(file: UploadFile) -> dict:
    """
    Validates and saves a candidate's resume file.
    Returns metadata dictionary with filename, url, size, and local_path.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Resume file is required.")

    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format '{ext}'. Allowed formats: PDF, DOC, DOCX."
        )

    # Read and validate size
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum allowed limit of 10MB."
        )
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Generate sanitized unique filename
    unique_id = str(uuid.uuid4())[:12]
    safe_filename = f"resume_{unique_id}{ext}"
    local_path = LOCAL_UPLOAD_DIR / safe_filename

    # Save to local filesystem as dependable storage
    LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    async with aiofiles.open(local_path, "wb") as f:
        await f.write(content)

    resume_url = f"/uploads/resumes/{safe_filename}"

    # Optionally sync with Supabase Storage if available
    try:
        supabase = get_supabase_client()
        # Attempt upload to Supabase bucket 'resumes'
        supabase.storage.from_("resumes").upload(
            path=safe_filename,
            file=content,
            file_options={"content-type": file.content_type or "application/octet-stream"}
        )
        # Store internal URL reference instead of public URL
    except Exception as e:
        logger.warning(
            f"Supabase storage upload failed for '{safe_filename}', falling back to local storage URL: {str(e)}"
        )

    return {

        "original_filename": file.filename,
        "saved_filename": safe_filename,
        "file_size": file_size,
        "resume_url": resume_url,
        "local_path": str(local_path)
    }
