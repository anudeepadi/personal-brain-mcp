"""
Shared fixtures for backend tests.
Mocks external services (Pinecone, Google AI, Anthropic) so tests
run without API keys or network access.
"""

import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

# Ensure the backend root is on sys.path so `import main` works
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

# Set dummy env vars BEFORE any module tries to load Settings
os.environ.setdefault("GOOGLE_API_KEY", "test-google-key")
os.environ.setdefault("PINECONE_API_KEY", "test-pinecone-key")
os.environ.setdefault("PINECONE_INDEX_NAME", "test-index")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000")


@pytest.fixture()
def mock_vectorstore():
    """A mock PineconeVectorStore that fakes retriever & upsert."""
    store = MagicMock()
    store.aadd_documents = AsyncMock(return_value=None)

    # Default: retriever returns empty list
    retriever = MagicMock()
    retriever.aget_relevant_documents = AsyncMock(return_value=[])
    store.as_retriever.return_value = retriever

    return store


@pytest.fixture()
def mock_embeddings():
    """A mock embeddings model."""
    emb = MagicMock()
    emb.embed_documents = MagicMock(return_value=[[0.1] * 768])
    emb.embed_query = MagicMock(return_value=[0.1] * 768)
    return emb


@pytest.fixture()
def mock_llm():
    """A mock LLM that returns a canned response."""
    llm = MagicMock()
    return llm


@pytest.fixture()
def mock_text_splitter():
    """A mock text splitter that returns one chunk per document."""
    from langchain_core.documents import Document

    splitter = MagicMock()

    def _split(docs):
        result = []
        for doc in docs:
            result.append(
                Document(
                    page_content=doc.page_content,
                    metadata={**doc.metadata, "chunk_index": 0},
                )
            )
        return result

    splitter.split_documents = MagicMock(side_effect=_split)
    return splitter


@pytest.fixture()
def patch_services(mock_vectorstore, mock_embeddings, mock_llm, mock_text_splitter):
    """Patch services module globals so no real API calls are made."""
    import services

    services.embeddings = mock_embeddings
    services.vectorstore = mock_vectorstore
    services.llm_gemini = mock_llm
    services.llm_claude = mock_llm
    services.text_splitter = mock_text_splitter

    yield {
        "vectorstore": mock_vectorstore,
        "embeddings": mock_embeddings,
        "llm": mock_llm,
        "text_splitter": mock_text_splitter,
    }

    # Reset globals
    services.embeddings = None
    services.vectorstore = None
    services.llm_gemini = None
    services.llm_claude = None
    services.text_splitter = None


@pytest.fixture()
def client(patch_services):
    """httpx AsyncClient wired to the FastAPI app, with services mocked."""
    import httpx

    from main import app

    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://testserver",
    )
