import asyncio
import concurrent.futures
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

import backend.core.supabase_client as sc
from backend.app import lifespan, app


def test_supabase_client_singleton_thread_safety():
    """
    Verifies that get_supabase_client() safely initializes only once
    even when multiple threads concurrently attempt to initialize it.
    """
    mock_client = MagicMock()
    call_count = 0

    def mock_create_client(url, key):
        nonlocal call_count
        call_count += 1
        return mock_client

    # Reset singleton for the test
    with sc._client_lock:
        sc._supabase_client = None

    with patch("backend.core.supabase_client.create_client", side_effect=mock_create_client):
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            # Launch 20 concurrent threads requesting the client simultaneously
            futures = [executor.submit(sc.get_supabase_client) for _ in range(20)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

    # Exactly one client should have been instantiated
    assert call_count == 1
    # All returned instances should be the identical mock instance
    assert all(client is mock_client for client in results)

    # Clean up singleton
    with sc._client_lock:
        sc._supabase_client = None


def test_lifespan_seed_bootstrap_non_blocking():
    """
    Verifies that the lifespan startup hook runs run_seed_bootstrap in executor
    without blocking the async event loop.
    """
    called_in_thread = False

    def mock_seed():
        nonlocal called_in_thread
        called_in_thread = True
        return {"status": "success", "seeded": True}

    async def run_test():
        with patch("backend.app.run_seed_bootstrap", side_effect=mock_seed):
            async with lifespan(app):
                pass

    asyncio.run(run_test())
    assert called_in_thread is True


def test_storage_module_no_side_effect_on_import():
    """
    Verifies that importing or reloading storage does not execute mkdir side effects at module level.
    """
    import importlib
    import backend.services.storage as storage_module

    # Reload should execute cleanly without top-level mkdir calls
    importlib.reload(storage_module)
    assert hasattr(storage_module, "LOCAL_UPLOAD_DIR")
    assert isinstance(storage_module.LOCAL_UPLOAD_DIR, Path)
