import os
import re
from backend.core.supabase_client import get_supabase_client

JOB_METADATA_DEFINITIONS = {
    "Senior Full-Stack Engineer (React + FastAPI)": {
        "company": "Ramp",
        "website": "https://ramp.com",
        "start_date": "2026-09-01",
        "end_date": "2026-10-31",
        "skills": "React 18, TypeScript, FastAPI, Python, PostgreSQL, Redis, Microservices",
        "salary": "$145,000 - $185,000 / year",
        "experience": "Senior (5+ years)",
        "workplace": "Hybrid",
        "description": "Lead core architecture across React frontend and high-throughput FastAPI microservices. Build enterprise recruitment workflows, state management pipelines, and real-time dashboard analytics with high availability."
    },
    "AI/ML Engineer (LLMs & Multi-Agent Systems)": {
        "company": "Anthropic",
        "website": "https://anthropic.com",
        "start_date": "2026-09-01",
        "end_date": "2026-11-15",
        "skills": "Python, PyTorch, LangChain, Multi-Agent Systems, Vector DBs, LLM Finetuning",
        "salary": "$160,000 - $210,000 / year",
        "experience": "Senior (5+ years)",
        "workplace": "Remote",
        "description": "Design LLM agent prompt topologies, resume semantic matchers, audio transcription pipelines, and adaptive technical interview rubrics with deterministic evaluation guardrails."
    },
    "Frontend Engineer (React / TypeScript / Tailwind)": {
        "company": "Vercel",
        "website": "https://vercel.com",
        "start_date": "2026-09-01",
        "end_date": "2026-10-15",
        "skills": "React 18, Next.js, TypeScript, TailwindCSS, TanStack Query, Web Performance",
        "salary": "$120,000 - $155,000 / year",
        "experience": "Mid-Level (3+ years)",
        "workplace": "Remote",
        "description": "Craft responsive, accessible, high-performance web applications using React 18, TypeScript, TailwindCSS, and TanStack Query. Collaborate with product design to build fluid user journeys."
    },
    "Backend Engineer (Python / Distributed Systems)": {
        "company": "Stripe",
        "website": "https://stripe.com",
        "start_date": "2026-09-01",
        "end_date": "2026-10-30",
        "skills": "Python, FastAPI, Kafka, Distributed Systems, PostgreSQL, Docker, AsyncIO",
        "salary": "$150,000 - $190,000 / year",
        "experience": "Senior (5+ years)",
        "workplace": "Remote",
        "description": "Build resilient REST APIs, asynchronous task workers, webhook ingestion engines, and database access layers on PostgreSQL with strict zero-downtime requirements."
    },
    "Lead Product Designer (UI/UX)": {
        "company": "Figma",
        "website": "https://figma.com",
        "start_date": "2026-09-01",
        "end_date": "2026-11-01",
        "skills": "Figma, Design Systems, UX Research, Interaction Design, Prototyping, Mobile Web",
        "salary": "$140,000 - $175,000 / year",
        "experience": "Lead (6+ years)",
        "workplace": "Remote",
        "description": "Create intuitive candidate application experiences, ATS Kanban pipelines, design systems, and rich interactive hiring dashboards in Figma with pixel-level precision."
    },
    "Product Manager (Enterprise SaaS)": {
        "company": "Notion",
        "website": "https://notion.so",
        "start_date": "2026-09-01",
        "end_date": "2026-10-31",
        "skills": "Product Strategy, User Research, SaaS Metrics, Agile Roadmapping, Enterprise Growth",
        "salary": "$135,000 - $170,000 / year",
        "experience": "Senior (4+ years)",
        "workplace": "Hybrid",
        "description": "Define product roadmaps, user stories, hiring metrics, and customer feedback loops for modern talent intelligence platforms. Partner directly with engineering leadership."
    },
    "DevOps & Cloud Infrastructure Engineer": {
        "company": "Datadog",
        "website": "https://datadoghq.com",
        "start_date": "2026-09-01",
        "end_date": "2026-11-30",
        "skills": "AWS, Kubernetes, Terraform, Docker, CI/CD, Prometheus, Zero-Downtime Deployments",
        "salary": "$130,000 - $165,000 / year",
        "experience": "Mid-Senior (4+ years)",
        "workplace": "Remote",
        "description": "Automate CI/CD pipelines, Docker container orchestration, cloud security posture, and zero-downtime deployment pipelines across AWS and Kubernetes environments."
    },
    "Technical Recruiter & Talent Partner": {
        "company": "Scale AI",
        "website": "https://scale.com",
        "start_date": "2026-09-01",
        "end_date": "2026-10-31",
        "skills": "Technical Sourcing, Candidate Pipeline, Offer Negotiation, ATS Systems, Engineering Hiring",
        "salary": "$95,000 - $125,000 / year",
        "experience": "Mid-Level (3+ years)",
        "workplace": "Hybrid",
        "description": "Source top-tier engineering talent, conduct initial screening evaluations, coordinate multi-stage interview loops, and drive offer closures with executive founders."
    },
    "Customer Success & Onboarding Specialist": {
        "company": "Linear",
        "website": "https://linear.app",
        "start_date": "2026-09-01",
        "end_date": "2026-10-15",
        "skills": "Client Onboarding, Account Management, Enterprise Support, SaaS Training, Customer Retention",
        "salary": "$85,000 - $115,000 / year",
        "experience": "Mid-Level (2+ years)",
        "workplace": "Remote",
        "description": "Guide enterprise talent acquisition teams through seamless platform onboarding, training, and ongoing workflow optimization to maximize retention and engagement."
    },
    "Quality Assurance & Automation Engineer": {
        "company": "Postman",
        "website": "https://postman.com",
        "start_date": "2026-09-01",
        "end_date": "2026-11-15",
        "skills": "Pytest, Playwright, API Testing, Postman, CI Automation, End-to-End Testing",
        "salary": "$110,000 - $140,000 / year",
        "experience": "Mid-Level (3+ years)",
        "workplace": "Remote",
        "description": "Develop comprehensive automated test suites using pytest, Playwright, and Postman to ensure zero regression across web and API layers for mission-critical recruitment."
    },
    "SDE": {
        "company": "Stripe",
        "website": "https://stripe.com",
        "start_date": "2026-09-02",
        "end_date": "2026-10-31",
        "skills": "React, TypeScript, Java, Spring Boot, REST APIs, Git",
        "salary": "$85,000 - $110,000 / year",
        "experience": "Entry / Junior Level (0-2 years)",
        "workplace": "Remote",
        "description": "Deliver foundational frontend and backend feature work for client platforms. Write clean, tested TypeScript and Java microservice code with guidance from senior staff."
    }
}

def build_full_description(meta: dict) -> str:
    parts = [
        f"Company: {meta['company']}",
        f"CompanyWebsite: {meta['website']}",
        f"StartDate: {meta['start_date']}",
        f"EndDate: {meta['end_date']}",
        f"Skills: {meta['skills']}",
        f"Salary: {meta['salary']}",
        f"Experience: {meta['experience']}",
        f"Workplace: {meta['workplace']}",
    ]
    meta_block = "\n".join(parts)
    return f"[METADATA]\n{meta_block}\n[END_METADATA]\n\n{meta['description'].strip()}"

def update_all_jobs():
    client = get_supabase_client()
    res = client.table("jobs").select("*").execute()
    jobs = res.data or []
    print(f"Loaded {len(jobs)} total jobs from database.")

    updated_count = 0
    for job in jobs:
        title = job.get("title", "").strip()
        meta = JOB_METADATA_DEFINITIONS.get(title)
        
        # If title matches directly
        if meta:
            new_desc = build_full_description(meta)
        else:
            # Fallback default rich metadata
            fallback_meta = {
                "company": "Acme Corp",
                "website": "https://acme.org",
                "start_date": "2026-09-01",
                "end_date": "2026-11-01",
                "skills": "Problem Solving, Collaboration, Technical Design, Agile",
                "salary": "$110,000 - $145,000 / year",
                "experience": "Mid-Level (3+ years)",
                "workplace": "Remote",
                "description": re.sub(r'\[METADATA\][\s\S]*?\[END_METADATA\]\n*', '', job.get("description", "")).strip() or "Exciting technical opportunity hosted across our partner company network."
            }
            new_desc = build_full_description(fallback_meta)

        # Update job in Supabase
        update_res = client.table("jobs").update({"description": new_desc}).eq("id", job["id"]).execute()
        if update_res.data:
            updated_count += 1
            print(f"[OK] Updated job '{title}' (ID: {job['id']})")
        else:
            print(f"[FAIL] Failed to update job '{title}'")

    print(f"\nSuccessfully updated {updated_count}/{len(jobs)} jobs in database.")

if __name__ == "__main__":
    update_all_jobs()
