"""
Tests for Task 1: Bug fixes.

1a. generate_enhanced_response must call _initialize_services()
1b. /upsert must NOT double-store (only process_and_store_enhanced)
1c. Retriever filter in generate_enhanced_response must include memories
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.documents import Document


# ── 1a: generate_enhanced_response calls _initialize_services ─────────────


@pytest.mark.asyncio
async def test_generate_enhanced_response_initializes_services(patch_services):
    """generate_enhanced_response must call _initialize_services at the top."""
    import services

    with patch.object(services, "_initialize_services") as mock_init:
        # Set up a mock retriever that returns some docs
        mock_doc = Document(
            page_content="test content",
            metadata={
                "document_id": "doc-1",
                "source": "test.pdf",
                "chunk_index": 0,
                "upload_timestamp": datetime.datetime.now(
                    datetime.timezone.utc
                ).isoformat(),
            },
        )
        retriever = MagicMock()
        retriever.aget_relevant_documents = AsyncMock(return_value=[mock_doc])
        patch_services["vectorstore"].as_retriever.return_value = retriever

        # Mock RAG chain invocation
        with patch("services.RunnableParallel"), patch("services.ChatPromptTemplate"), patch(
            "services.StrOutputParser"
        ):
            # Mock the chain to return a string
            mock_chain = MagicMock()
            mock_chain.__or__ = MagicMock(return_value=mock_chain)
            mock_chain.ainvoke = AsyncMock(return_value="test response")

            # Patch the chain construction inline
            with patch("services.RunnableParallel") as MockParallel:
                mock_parallel_instance = MagicMock()
                mock_parallel_instance.__or__ = MagicMock(
                    return_value=mock_chain
                )
                MockParallel.return_value = mock_parallel_instance

                result = await services.generate_enhanced_response(
                    "test query", "gemini", True
                )

        mock_init.assert_called_once()


# ── 1b: /upsert must not call process_and_store ──────────────────────────


@pytest.mark.asyncio
async def test_upsert_does_not_call_process_and_store(client, patch_services):
    """POST /upsert must NOT call process_and_store (only process_and_store_enhanced)."""
    import main
    from models import DocumentMetadata

    # Mock process_and_store_enhanced to return valid metadata
    mock_metadata = DocumentMetadata(
        filename="test.txt",
        content_type="text/plain",
        upload_timestamp=datetime.datetime.now(datetime.timezone.utc),
        file_size=100,
        total_chunks=1,
        document_id="doc-123",
        summary="test content...",
    )

    # Patch in the `main` namespace since that's where the endpoint references the function
    with (
        patch.object(
            main, "process_and_store", new_callable=AsyncMock
        ) as mock_basic,
        patch.object(
            main,
            "process_and_store_enhanced",
            new_callable=AsyncMock,
            return_value=mock_metadata,
        ) as mock_enhanced,
    ):
        response = await client.post(
            "/upsert",
            files={"file": ("test.txt", b"Hello world content", "text/plain")},
        )

        assert response.status_code == 200
        # process_and_store must NOT be called
        mock_basic.assert_not_called()
        # process_and_store_enhanced MUST be called
        mock_enhanced.assert_called_once()


# ── 1c: Retriever filter must include memories ───────────────────────────


@pytest.mark.asyncio
async def test_enhanced_response_retriever_includes_memories(patch_services):
    """The retriever filter in generate_enhanced_response must include type 'memory'."""
    import services

    mock_doc = Document(
        page_content="memory content",
        metadata={
            "document_id": "mem-1",
            "source": "chat",
            "chunk_index": 0,
            "type": "memory",
        },
    )
    retriever = MagicMock()
    retriever.aget_relevant_documents = AsyncMock(return_value=[mock_doc])
    patch_services["vectorstore"].as_retriever.return_value = retriever

    # We need to inspect what filter was passed to as_retriever
    with patch("services.RunnableParallel") as MockParallel:
        mock_chain = MagicMock()
        mock_chain.__or__ = MagicMock(return_value=mock_chain)
        mock_chain.ainvoke = AsyncMock(return_value="response with memory")

        mock_parallel_instance = MagicMock()
        mock_parallel_instance.__or__ = MagicMock(return_value=mock_chain)
        MockParallel.return_value = mock_parallel_instance

        await services.generate_enhanced_response("test", "gemini", True)

    # Check the filter passed to as_retriever
    call_args = patch_services["vectorstore"].as_retriever.call_args
    retriever_filter = call_args.kwargs.get("search_kwargs", {}).get("filter", {})

    # Filter must allow both "document" and "memory" types
    assert "type" in retriever_filter
    type_filter = retriever_filter["type"]
    assert "$in" in type_filter
    assert "document" in type_filter["$in"]
    assert "memory" in type_filter["$in"]
