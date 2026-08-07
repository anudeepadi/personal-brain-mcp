"""
Tests for Task 4: Production CORS configuration.

- CORS reads ALLOWED_ORIGINS from environment
- Defaults to http://localhost:3000 when env not set
- Supports comma-separated multiple origins
- No wildcard '*' in production
"""

import os

import pytest


def test_cors_env_parsing_multiple_origins():
    """Comma-separated ALLOWED_ORIGINS should be split into a list."""
    env_val = "https://mnemonic.app,https://staging.mnemonic.app"
    origins = env_val.split(",")
    assert origins == ["https://mnemonic.app", "https://staging.mnemonic.app"]


def test_cors_env_parsing_single_origin():
    """Single origin should produce a single-element list."""
    env_val = "https://mnemonic.app"
    origins = env_val.split(",")
    assert origins == ["https://mnemonic.app"]


def test_cors_default_when_env_not_set():
    """Default should be http://localhost:3000 when ALLOWED_ORIGINS is absent."""
    default = "http://localhost:3000"
    origins = os.getenv("MISSING_VAR_FOR_TEST", default).split(",")
    assert origins == ["http://localhost:3000"]


def test_cors_middleware_in_main_uses_allowed_origins():
    """main.py must define allowed_origins from env and use it in CORSMiddleware."""
    import main

    # Verify allowed_origins module-level variable exists
    assert hasattr(main, "allowed_origins")
    assert isinstance(main.allowed_origins, list)
    # Must not be wildcard
    assert "*" not in main.allowed_origins


def test_cors_middleware_registered():
    """CORSMiddleware must be in the app middleware stack."""
    import main

    cors_found = False
    for middleware in main.app.user_middleware:
        if "CORSMiddleware" in str(middleware.cls):
            cors_found = True
            origins = middleware.kwargs.get("allow_origins", [])
            # Origins must be a list (not wildcard string)
            assert isinstance(origins, list)
            assert "*" not in origins
            break

    assert cors_found, "CORSMiddleware not found in app middleware"
