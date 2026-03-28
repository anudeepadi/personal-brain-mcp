"""
Tests for Task 5: Input validation.

- MemoryCreateRequest validates content length
- Pydantic models enforce required fields
- Rate limit placeholder comment exists
"""

import pytest
from pydantic import ValidationError


def test_memory_content_exactly_10_chars():
    """Content with exactly 10 chars should be accepted."""
    from models import MemoryCreateRequest

    req = MemoryCreateRequest(
        content="1234567890",
        source="chat",
        session_id="sess-1",
    )
    assert len(req.content) == 10


def test_memory_content_exactly_5000_chars():
    """Content with exactly 5000 chars should be accepted."""
    from models import MemoryCreateRequest

    req = MemoryCreateRequest(
        content="a" * 5000,
        source="chat",
        session_id="sess-1",
    )
    assert len(req.content) == 5000


def test_memory_content_9_chars_rejected():
    """Content with 9 chars should be rejected."""
    from models import MemoryCreateRequest

    with pytest.raises(ValidationError):
        MemoryCreateRequest(
            content="123456789",
            source="chat",
            session_id="sess-1",
        )


def test_memory_content_5001_chars_rejected():
    """Content with 5001 chars should be rejected."""
    from models import MemoryCreateRequest

    with pytest.raises(ValidationError):
        MemoryCreateRequest(
            content="a" * 5001,
            source="chat",
            session_id="sess-1",
        )


def test_memory_source_literal_enforcement():
    """Source must be one of the allowed literals."""
    from models import MemoryCreateRequest

    # Valid sources
    for source in ("chat", "import", "mcp"):
        req = MemoryCreateRequest(
            content="Valid content here",
            source=source,
            session_id="sess-1",
        )
        assert req.source == source

    # Invalid source
    with pytest.raises(ValidationError):
        MemoryCreateRequest(
            content="Valid content here",
            source="webhook",
            session_id="sess-1",
        )


def test_chat_enhanced_request_query_required():
    """ChatEnhancedRequest must require query field."""
    from models import ChatEnhancedRequest

    with pytest.raises(ValidationError):
        ChatEnhancedRequest()


def test_rate_limit_placeholder_in_main():
    """main.py should contain a rate limit placeholder comment for Phase 1B."""
    import inspect

    import main

    source = inspect.getsource(main)
    assert "rate limit" in source.lower() or "slowapi" in source.lower()
