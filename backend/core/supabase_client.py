import logging
from typing import Optional
from supabase import create_client, Client
from backend.core.config import settings

logger = logging.getLogger("enterrecruit.supabase")

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """
    Returns an initialized Supabase Client singleton.
    """
    global _supabase_client
    if _supabase_client is None:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        if not settings.SUPABASE_URL or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY must be configured.")
        _supabase_client = create_client(settings.SUPABASE_URL, key)
        logger.info("Supabase client initialized successfully.")
    return _supabase_client
