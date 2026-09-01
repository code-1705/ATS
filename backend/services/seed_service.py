import logging
from typing import List, Dict, Any
from backend.core.config import settings
from backend.core.security import get_password_hash
from backend.core.supabase_client import get_supabase_client

logger = logging.getLogger("enterrecruit.seed")

DEFAULT_JOBS: List[Dict[str, Any]] = [
    {
        "title": "Senior Full-Stack Engineer (React + FastAPI)",
        "department": "Engineering",
        "location": "Remote / Hybrid (Bangalore)",
        "job_type": "Full-Time",
        "description": "Lead core architecture across React frontend and high-throughput FastAPI microservices. Build enterprise recruitment workflows and real-time dashboard analytics.",
        "is_active": True
    },
    {
        "title": "AI/ML Engineer (LLMs & Multi-Agent Systems)",
        "department": "AI & Intelligence",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Design LLM agent prompt topologies, resume semantic matchers, audio transcription pipelines, and adaptive technical interview rubrics.",
        "is_active": True
    },
    {
        "title": "Frontend Engineer (React / TypeScript / Tailwind)",
        "department": "Engineering",
        "location": "Bangalore, India",
        "job_type": "Full-Time",
        "description": "Craft responsive, accessible, high-performance web applications using React 18, TypeScript, TailwindCSS, and TanStack Query.",
        "is_active": True
    },
    {
        "title": "Backend Engineer (Python / Distributed Systems)",
        "department": "Engineering",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Build resilient REST APIs, asynchronous task workers, webhook ingestion engines, and database access layers on PostgreSQL.",
        "is_active": True
    },
    {
        "title": "Lead Product Designer (UI/UX)",
        "department": "Design",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Create intuitive candidate application experiences, ATS Kanban pipelines, design systems, and rich interactive hiring dashboards in Figma.",
        "is_active": True
    },
    {
        "title": "Product Manager (Enterprise SaaS)",
        "department": "Product",
        "location": "Remote / Hybrid",
        "job_type": "Full-Time",
        "description": "Define product roadmaps, user stories, hiring metrics, and customer feedback loops for modern talent intelligence platforms.",
        "is_active": True
    },
    {
        "title": "DevOps & Cloud Infrastructure Engineer",
        "department": "Infrastructure",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Automate CI/CD pipelines, Docker container orchestration, cloud security posture, and zero-downtime deployment pipelines.",
        "is_active": True
    },
    {
        "title": "Technical Recruiter & Talent Partner",
        "department": "Human Resources",
        "location": "Bangalore, India",
        "job_type": "Full-Time",
        "description": "Source top-tier engineering talent, conduct initial screening evaluations, coordinate multi-stage interview loops, and drive offer closures.",
        "is_active": True
    },
    {
        "title": "Customer Success & Onboarding Specialist",
        "department": "Operations",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Guide enterprise talent acquisition teams through seamless platform onboarding, training, and ongoing workflow optimization.",
        "is_active": True
    },
    {
        "title": "Quality Assurance & Automation Engineer",
        "department": "Engineering",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "Develop comprehensive automated test suites using pytest, Playwright, and Postman to ensure zero regression across web and API layers.",
        "is_active": True
    }
]

def seed_admin_user() -> Dict[str, Any]:
    """
    Ensures the default admin user exists in Supabase.
    Email: admin@enter.in
    """
    supabase = get_supabase_client()
    email = settings.ADMIN_DEFAULT_EMAIL
    
    # Check if admin already exists
    response = supabase.table("users").select("id, email, name, role").eq("email", email).execute()
    if response.data and len(response.data) > 0:
        logger.info(f"Admin user {email} already exists.")
        return response.data[0]
    
    # Hash password and insert
    hashed = get_password_hash(settings.ADMIN_DEFAULT_PASSWORD)
    user_payload = {
        "email": email,
        "hashed_password": hashed,
        "name": "System Administrator",
        "role": "ADMIN"
    }
    
    insert_res = supabase.table("users").insert(user_payload).execute()
    if not insert_res.data or len(insert_res.data) == 0:
        logger.error(f"Failed to insert admin user {email} into Supabase.")
        raise RuntimeError(f"Failed to create admin user {email} in database.")

    logger.info(f"Admin user {email} created successfully.")
    return insert_res.data[0]

def seed_default_jobs() -> List[Dict[str, Any]]:
    """
    Seeds the 10 initial jobs if the jobs table is empty.
    """
    supabase = get_supabase_client()
    response = supabase.table("jobs").select("id, title").execute()
    
    if response.data and len(response.data) >= 10:
        logger.info(f"Jobs table already contains {len(response.data)} jobs.")
        return response.data
    
    # If partial or empty, insert missing jobs
    existing_titles = {j["title"] for j in (response.data or [])}
    jobs_to_insert = [job for job in DEFAULT_JOBS if job["title"] not in existing_titles]
    
    if jobs_to_insert:
        insert_res = supabase.table("jobs").insert(jobs_to_insert).execute()
        if not insert_res.data or len(insert_res.data) == 0:
            logger.error("Failed to insert default jobs into Supabase.")
            raise RuntimeError("Failed to seed default jobs into database.")
        logger.info(f"Seeded {len(jobs_to_insert)} new default jobs into Supabase.")
        return (response.data or []) + insert_res.data
    
    return response.data or []


def run_seed_bootstrap():
    """
    Entrypoint for bootstrapping the database on startup.
    """
    try:
        admin = seed_admin_user()
        jobs = seed_default_jobs()
        return {"status": "success", "admin": admin.get("email"), "jobs_count": len(jobs)}
    except Exception as e:
        logger.error(f"Error during Supabase seed bootstrap: {str(e)}")
        raise e
