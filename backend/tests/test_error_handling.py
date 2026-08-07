"""
Tests for Phase 1B error handling.

Verifies that backend endpoints return the correct HTTP status codes
for various failure modes (rate limiting, empty responses, Pinecone
failures, embedding failures, Google API errors) and that errors are
logged with sufficient context.
"""

import logging
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ── Gemini rate-limit → 429 ──────────────────────────────────────────


@pytest.mark.asyncio
async def test_chat_enhanced_gemini_rate_limit_returns_429(client, patch_services):
    """ResourceExhausted from Google should surface as 429 with Retry-After."""
    from google.api_core.exceptions import ResourceExhausted

    import main

    exc = ResourceExhausted("Quota exceeded")
    with patch.object(
        main,
        "generate_enhanced_response",
        new_callable=AsyncMock,
        side_effect=exc,
    ):
        response = await client.post(
            "/chat/enhanced",
            json={
                "query": "What is AI?",
                "model_provider": "gemini",
                "include_references": True,
            },
        )

    assert response.status_code == 429
    assert "retry" in response.json()["detail"].lower()


# ── Empty LLM response → 502 ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_chat_enhanced_empty_response_returns_502(client, patch_services):
    """ValueError with 'empty' in the message should surface as 502."""
    import main

    with patch.object(
        main,
        "generate_enhanced_response",
        new_callable=AsyncMock,
        side_effect=ValueError("AI returned empty response"),
    ):
        response = await client.post(
            "/chat/enhanced",
            json={
                "query": "Summarize the docs",
                "model_provider": "gemini",
                "include_references": True,
            },
        )

    assert response.status_code == 502
    assert "empty" in response.json()["detail"].lower()


# ── Pinecone failure on /memories → 503 ──────────────────────────────


@pytest.mark.asyncio
async def test_memories_pinecone_failure_returns_503(client, patch_services):
    """A Pinecone error during memory storage should surface as 503."""

    # Create an exception whose module path contains "pinecone"
    class FakePineconeError(Exception):
        pass

    FakePineconeError.__module__ = "pinecone.exceptions"

    import main

    with patch.object(
        main,
        "store_memory",
        new_callable=AsyncMock,
        side_effect=FakePineconeError("Connection refused"),
    ):
        response = await client.post(
            "/memories",
            json={
                "content": "Remember this important detail about the project",
                "source": "chat",
                "session_id": "sess-test",
            },
        )

    assert response.status_code == 503
    assert "memory storage" in response.json()["detail"].lower()


# ── Missing API key → 503 ────────────────────────────────────────────


@pytest.mark.asyncio
async def test_chat_enhanced_missing_api_key_returns_503(client, patch_services):
    """ValueError about a missing API key (not 'empty') should surface as 503."""
    import main

    with patch.object(
        main,
        "generate_enhanced_response",
        new_callable=AsyncMock,
        side_effect=ValueError("Anthropic API key not configured."),
    ):
        response = await client.post(
            "/chat/enhanced",
            json={
                "query": "Hello",
                "model_provider": "claude",
                "include_references": True,
            },
        )

    assert response.status_code == 503


# ── GoogleAPIError → 503 ─────────────────────────────────────────────


@pytest.mark.asyncio
async def test_chat_enhanced_google_api_error_returns_503(client, patch_services):
    """GoogleAPIError should surface as 503."""
    from google.api_core.exceptions import GoogleAPIError

    import main

    with patch.object(
        main,
        "generate_enhanced_response",
        new_callable=AsyncMock,
        side_effect=GoogleAPIError("Internal server error"),
    ):
        response = await client.post(
            "/chat/enhanced",
            json={
                "query": "Tell me about the documents",
                "model_provider": "gemini",
                "include_references": True,
            },
        )

    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"].lower()


# ── Error logging includes context ───────────────────────────────────


@pytest.mark.asyncio
async def test_error_logging_includes_query_context(client, patch_services, caplog):
    """Error logs should include the truncated query for debugging."""
    import main

    with patch.object(
        main,
        "generate_enhanced_response",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Something unexpected"),
    ):
        with caplog.at_level(logging.ERROR, logger="main"):
            response = await client.post(
                "/chat/enhanced",
                json={
                    "query": "What is the meaning of life?",
                    "model_provider": "gemini",
                    "include_references": True,
                },
            )

    assert response.status_code == 500
    # The error log should contain the query (or truncated form)
    assert any("What is the meaning of life?" in record.message for record in caplog.records)


@pytest.mark.asyncio
async def test_memory_error_logging_includes_session_context(
    client, patch_services, caplog
):
    """Memory storage error logs should include session_id."""

    class FakePineconeError(Exception):
        pass

    FakePineconeError.__module__ = "pinecone.exceptions"

    import main

    with patch.object(
        main,
        "store_memory",
        new_callable=AsyncMock,
        side_effect=FakePineconeError("Timeout"),
    ):
        with caplog.at_level(logging.ERROR, logger="main"):
            response = await client.post(
                "/memories",
                json={
                    "content": "Important memory about project architecture",
                    "source": "chat",
                    "session_id": "sess-log-test",
                },
            )

    assert response.status_code == 503
    assert any("sess-log-test" in record.message for record in caplog.records)


# ── Embedding failure → 503 ──────────────────────────────────────────


@pytest.mark.asyncio
async def test_memories_embedding_failure_returns_503(client, patch_services):
    """An embedding error during memory storage should surface as 503."""
    import main

    with patch.object(
        main,
        "store_memory",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Failed to generate embedding vector"),
    ):
        response = await client.post(
            "/memories",
            json={
                "content": "Store this important memory about embeddings",
                "source": "chat",
                "session_id": "sess-embed-fail",
            },
        )

    assert response.status_code == 503
    assert "embedding" in response.json()["detail"].lower()


# ── POST /chat streaming error paths ─────────────────────────────────


@pytest.mark.asyncio
async def test_chat_stream_empty_response_returns_502(client, patch_services):
    """ValueError with 'empty' from the streaming endpoint should be 502."""
    import main

    with patch.object(
        main,
        "generate_response_stream",
        side_effect=ValueError("AI returned empty response"),
    ):
        response = await client.post(
            "/chat",
            data={"query": "Hello stream", "model_provider": "gemini"},
        )

    assert response.status_code == 502


@pytest.mark.asyncio
async def test_chat_stream_rate_limit_returns_429(client, patch_services):
    """ResourceExhausted from the streaming endpoint should be 429."""
    from google.api_core.exceptions import ResourceExhausted

    import main

    with patch.object(
        main,
        "generate_response_stream",
        side_effect=ResourceExhausted("Rate limited"),
    ):
        response = await client.post(
            "/chat",
            data={"query": "Hello stream", "model_provider": "gemini"},
        )

    assert response.status_code == 429
