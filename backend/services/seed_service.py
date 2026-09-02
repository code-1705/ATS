import logging
from typing import List, Dict, Any
from backend.core.config import settings
from backend.core.security import get_password_hash
from backend.core.supabase_client import get_supabase_client

logger = logging.getLogger("ats.seed")

DEFAULT_JOBS: List[Dict[str, Any]] = [
    {
        "title": "Senior Full-Stack Engineer (React + FastAPI)",
        "department": "Engineering",
        "location": "Remote / Hybrid (Bangalore)",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Ramp\nCompanyWebsite: https://ramp.com\nStartDate: 2026-09-01\nEndDate: 2026-10-31\nSkills: React 18, TypeScript, FastAPI, Python, PostgreSQL, Redis, Microservices\nSalary: $145,000 - $185,000 / year\nExperience: Senior (5+ years)\nWorkplace: Hybrid\n[END_METADATA]\n\nLead core architecture across React frontend and high-throughput FastAPI microservices. Build enterprise recruitment workflows, state management pipelines, and real-time dashboard analytics with high availability.",
        "is_active": True
    },
    {
        "title": "AI/ML Engineer (LLMs & Multi-Agent Systems)",
        "department": "AI & Intelligence",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Anthropic\nCompanyWebsite: https://anthropic.com\nStartDate: 2026-09-01\nEndDate: 2026-11-15\nSkills: Python, PyTorch, LangChain, Multi-Agent Systems, Vector DBs, LLM Finetuning\nSalary: $160,000 - $210,000 / year\nExperience: Senior (5+ years)\nWorkplace: Remote\n[END_METADATA]\n\nDesign LLM agent prompt topologies, resume semantic matchers, audio transcription pipelines, and adaptive technical interview rubrics with deterministic evaluation guardrails.",
        "is_active": True
    },
    {
        "title": "Frontend Engineer (React / TypeScript / Tailwind)",
        "department": "Engineering",
        "location": "Bangalore, India",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Vercel\nCompanyWebsite: https://vercel.com\nStartDate: 2026-09-01\nEndDate: 2026-10-15\nSkills: React 18, Next.js, TypeScript, TailwindCSS, TanStack Query, Web Performance\nSalary: $120,000 - $155,000 / year\nExperience: Mid-Level (3+ years)\nWorkplace: Remote\n[END_METADATA]\n\nCraft responsive, accessible, high-performance web applications using React 18, TypeScript, TailwindCSS, and TanStack Query. Collaborate with product design to build fluid user journeys.",
        "is_active": True
    },
    {
        "title": "Backend Engineer (Python / Distributed Systems)",
        "department": "Engineering",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Stripe\nCompanyWebsite: https://stripe.com\nStartDate: 2026-09-01\nEndDate: 2026-10-30\nSkills: Python, FastAPI, Kafka, Distributed Systems, PostgreSQL, Docker, AsyncIO\nSalary: $150,000 - $190,000 / year\nExperience: Senior (5+ years)\nWorkplace: Remote\n[END_METADATA]\n\nBuild resilient REST APIs, asynchronous task workers, webhook ingestion engines, and database access layers on PostgreSQL with strict zero-downtime requirements.",
        "is_active": True
    },
    {
        "title": "Lead Product Designer (UI/UX)",
        "department": "Design",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Figma\nCompanyWebsite: https://figma.com\nStartDate: 2026-09-01\nEndDate: 2026-11-01\nSkills: Figma, Design Systems, UX Research, Interaction Design, Prototyping, Mobile Web\nSalary: $140,000 - $175,000 / year\nExperience: Lead (6+ years)\nWorkplace: Remote\n[END_METADATA]\n\nCreate intuitive candidate application experiences, ATS Kanban pipelines, design systems, and rich interactive hiring dashboards in Figma with pixel-level precision.",
        "is_active": True
    },
    {
        "title": "Product Manager (Enterprise SaaS)",
        "department": "Product",
        "location": "Remote / Hybrid",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Notion\nCompanyWebsite: https://notion.so\nStartDate: 2026-09-01\nEndDate: 2026-10-31\nSkills: Product Strategy, User Research, SaaS Metrics, Agile Roadmapping, Enterprise Growth\nSalary: $135,000 - $170,000 / year\nExperience: Senior (4+ years)\nWorkplace: Hybrid\n[END_METADATA]\n\nDefine product roadmaps, user stories, hiring metrics, and customer feedback loops for modern talent intelligence platforms. Partner directly with engineering leadership.",
        "is_active": True
    },
    {
        "title": "DevOps & Cloud Infrastructure Engineer",
        "department": "Infrastructure",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Datadog\nCompanyWebsite: https://datadoghq.com\nStartDate: 2026-09-01\nEndDate: 2026-11-30\nSkills: AWS, Kubernetes, Terraform, Docker, CI/CD, Prometheus, Zero-Downtime Deployments\nSalary: $130,000 - $165,000 / year\nExperience: Mid-Senior (4+ years)\nWorkplace: Remote\n[END_METADATA]\n\nAutomate CI/CD pipelines, Docker container orchestration, cloud security posture, and zero-downtime deployment pipelines across AWS and Kubernetes environments.",
        "is_active": True
    },
    {
        "title": "Technical Recruiter & Talent Partner",
        "department": "Human Resources",
        "location": "Bangalore, India",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Scale AI\nCompanyWebsite: https://scale.com\nStartDate: 2026-09-01\nEndDate: 2026-10-31\nSkills: Technical Sourcing, Candidate Pipeline, Offer Negotiation, ATS Systems, Engineering Hiring\nSalary: $95,000 - $125,000 / year\nExperience: Mid-Level (3+ years)\nWorkplace: Hybrid\n[END_METADATA]\n\nSource top-tier engineering talent, conduct initial screening evaluations, coordinate multi-stage interview loops, and drive offer closures with executive founders.",
        "is_active": True
    },
    {
        "title": "Customer Success & Onboarding Specialist",
        "department": "Operations",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Linear\nCompanyWebsite: https://linear.app\nStartDate: 2026-09-01\nEndDate: 2026-10-15\nSkills: Client Onboarding, Account Management, Enterprise Support, SaaS Training, Customer Retention\nSalary: $85,000 - $115,000 / year\nExperience: Mid-Level (2+ years)\nWorkplace: Remote\n[END_METADATA]\n\nGuide enterprise talent acquisition teams through seamless platform onboarding, training, and ongoing workflow optimization to maximize retention and engagement.",
        "is_active": True
    },
    {
        "title": "Quality Assurance & Automation Engineer",
        "department": "Engineering",
        "location": "Remote",
        "job_type": "Full-Time",
        "description": "[METADATA]\nCompany: Postman\nCompanyWebsite: https://postman.com\nStartDate: 2026-09-01\nEndDate: 2026-11-15\nSkills: Pytest, Playwright, API Testing, Postman, CI Automation, End-to-End Testing\nSalary: $110,000 - $140,000 / year\nExperience: Mid-Level (3+ years)\nWorkplace: Remote\n[END_METADATA]\n\nDevelop comprehensive automated test suites using pytest, Playwright, and Postman to ensure zero regression across web and API layers for mission-critical recruitment.",
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

def seed_default_jobs(force: bool = False) -> List[Dict[str, Any]]:
    """
    Seeds the 10 initial jobs only if the jobs table is completely empty,
    or if force=True.
    Prevents deleted seed jobs from re-appearing when the total job count drops below 10.
    """
    supabase = get_supabase_client()
    response = supabase.table("jobs").select("id, title").execute()
    
    if response.data and len(response.data) > 0 and not force:
        logger.info(f"Jobs table already contains {len(response.data)} jobs. Skipping default job seeding.")
        return response.data
    
    # If empty or forced, determine jobs to insert
    existing_titles = {j["title"] for j in (response.data or [])}
    jobs_to_insert = [job for job in DEFAULT_JOBS if job["title"] not in existing_titles]
    
    if not jobs_to_insert:
        logger.info("All default jobs already exist in database.")
        return response.data or []
    
    insert_res = supabase.table("jobs").insert(jobs_to_insert).execute()
    if not insert_res.data or len(insert_res.data) == 0:
        logger.error("Failed to insert default jobs into Supabase.")
        raise RuntimeError("Failed to seed default jobs into database.")
    logger.info(f"Seeded {len(jobs_to_insert)} new default jobs into Supabase.")
    return (response.data or []) + insert_res.data


def ensure_storage_bucket_exists():
    """
    Guarantees that the 'resumes' storage bucket exists in Supabase for candidate uploads.
    """
    try:
        supabase = get_supabase_client()
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in (buckets or [])]
        if "resumes" not in bucket_names:
            supabase.storage.create_bucket("resumes", options={"public": False})
            logger.info("Auto-provisioned missing 'resumes' bucket in Supabase Storage.")
        else:
            logger.info("Supabase storage bucket 'resumes' verified.")
    except Exception as e:
        logger.warning(f"Could not verify/create Supabase storage bucket 'resumes': {e}")


def run_seed_bootstrap(force: bool = False):
    """
    Entrypoint for bootstrapping the database and storage on startup or via CLI.
    """
    try:
        ensure_storage_bucket_exists()
        admin = seed_admin_user()
        jobs = seed_default_jobs(force=force)
        return {"status": "success", "admin": admin.get("email"), "jobs_count": len(jobs)}
    except Exception as e:
        logger.error(f"Error during Supabase seed bootstrap: {str(e)}")
        raise e


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed initial database users and jobs for Talent ATS.")
    parser.add_argument("--force", action="store_true", help="Force insert missing default jobs even if jobs exist.")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)
    logger.info(f"Starting Talent ATS database seed (force={args.force})...")
    res = run_seed_bootstrap(force=args.force)
    logger.info(f"Database seed finished successfully: {res}")
