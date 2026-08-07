"""
Tests for Task 3: POST /memories endpoint.

- MemoryCreateRequest model validation
- Endpoint stores content in Pinecone with type="memory"
- Returns memory_id, chunks_stored, status
- Input validation (min_length, max_length, source literals)
"""

from unittest.mock import AsyncMock, patch

import pytest
from pydantic import ValidationError


# ── Model validation ──────────────────────────────────────────────────────


def test_memory_create_request_exists():
    """MemoryCreateRequest must be defined in models.py."""
    from models import MemoryCreateRequest

    req = MemoryCreateRequest(
        content="This is a memory about AI concepts discussed today.",
        source="chat",
        session_id="sess-123",
    )
    assert req.content == "This is a memory about AI concepts discussed today."
    assert req.source == "chat"
    assert req.session_id == "sess-123"
    assert req.tags == []


def test_memory_create_request_with_tags():
    """MemoryCreateRequest should accept tags."""
    from models import MemoryCreateRequest

    req = MemoryCreateRequest(
        content="Memory about machine learning",
        source="import",
        session_id="sess-456",
        tags=["ml", "ai"],
    )
    assert req.tags == ["ml", "ai"]


def test_memory_create_request_min_length():
    """Content must be at least 10 characters."""
    from models import MemoryCreateRequest

    with pytest.raises(ValidationError):
        MemoryCreateRequest(
            content="short",
            source="chat",
            session_id="sess-1",
        )


def test_memory_create_request_max_length():
    """Content must be at most 5000 characters."""
    from models import MemoryCreateRequest

    with pytest.raises(ValidationError):
        MemoryCreateRequest(
            content="x" * 5001,
            source="chat",
            session_id="sess-1",
        )


def test_memory_create_request_invalid_source():
    """Source must be one of 'chat', 'import', 'mcp'."""
    from models import MemoryCreateRequest

    with pytest.raises(ValidationError):
        MemoryCreateRequest(
            content="Valid content here",
            source="unknown",
            session_id="sess-1",
        )


# ── Response model ────────────────────────────────────────────────────────


def test_memory_create_response_exists():
    """MemoryCreateResponse must be defined in models.py."""
    from models import MemoryCreateResponse

    resp = MemoryCreateResponse(
        memory_id="mem-123",
        chunks_stored=2,
        status="stored",
    )
    assert resp.memory_id == "mem-123"
    assert resp.chunks_stored == 2
    assert resp.status == "stored"


# ── Endpoint tests ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_post_memories_success(client, patch_services):
    """POST /memories should store a memory and return metadata."""
    response = await client.post(
        "/memories",
        json={
            "content": "The user prefers Python for backend development and uses FastAPI.",
            "source": "chat",
            "session_id": "sess-abc-123",
            "tags": ["preference", "python"],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "memory_id" in data
    assert data["chunks_stored"] >= 1
    assert data["status"] == "stored"

    # Verify vectorstore was called to store documents
    patch_services["vectorstore"].aadd_documents.assert_called_once()
    # Check the documents stored have type="memory"
    stored_docs = patch_services["vectorstore"].aadd_documents.call_args[0][0]
    assert all(doc.metadata["type"] == "memory" for doc in stored_docs)


@pytest.mark.asyncio
async def test_post_memories_includes_metadata(client, patch_services):
    """Stored memory chunks must include source, session_id, tags, timestamp."""
    response = await client.post(
        "/memories",
        json={
            "content": "Important context about the project architecture and design.",
            "source": "mcp",
            "session_id": "sess-xyz",
            "tags": ["architecture"],
        },
    )

    assert response.status_code == 200
    stored_docs = patch_services["vectorstore"].aadd_documents.call_args[0][0]
    meta = stored_docs[0].metadata
    assert meta["source"] == "mcp"
    assert meta["session_id"] == "sess-xyz"
    assert "architecture" in meta["tags"]
    assert "timestamp" in meta
    assert meta["type"] == "memory"


@pytest.mark.asyncio
async def test_post_memories_content_too_short(client, patch_services):
    """POST /memories with content < 10 chars should return 422."""
    response = await client.post(
        "/memories",
        json={
            "content": "short",
            "source": "chat",
            "session_id": "sess-1",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_memories_missing_required_fields(client, patch_services):
    """POST /memories without required fields should return 422."""
    response = await client.post(
        "/memories",
        json={"content": "Valid content here for testing"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_memories_invalid_source(client, patch_services):
    """POST /memories with invalid source should return 422."""
    response = await client.post(
        "/memories",
        json={
            "content": "Valid content for memory storage",
            "source": "invalid",
            "session_id": "sess-1",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_memories_store_error(client, patch_services):
    """POST /memories should return 500 if storage fails."""
    import main

    with patch.object(
        main, "store_memory", new_callable=AsyncMock, side_effect=RuntimeError("Pinecone down")
    ):
        response = await client.post(
            "/memories",
            json={
                "content": "Valid content for memory storage testing",
                "source": "chat",
                "session_id": "sess-1",
            },
        )

    assert response.status_code == 500
    assert "Failed to store memory" in response.json()["detail"]
