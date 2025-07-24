import io
import mimetypes
from typing import Literal

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4

# --- PYDANTIC MODELS ---
class ChatMessage(BaseModel):
    """Represents a single message in a chat session."""
    role: Literal["user", "assistant"]
    content: str

class DocumentReference(BaseModel):
    """Reference to a specific document chunk with citation info."""
    document_id: str
    filename: str
    chunk_index: int
    content_excerpt: str
    relevance_score: float
    page_number: int | None = None
    timestamp: datetime | None = None

class SearchResult(BaseModel):
    """Enhanced search result with references and metadata."""
    content: str
    metadata: dict
    relevance_score: float
    document_id: str
    references: list[DocumentReference] = Field(default_factory=list)

class EnhancedChatResponse(BaseModel):
    """Chat response with citations and references."""
    response: str
    references: list[DocumentReference]
    confidence_score: float
    model_used: str

class ArchiveRequest(BaseModel):
    """Request model for archiving a chat session."""
    tool: str = Field(..., description="The AI tool used, e.g., 'ChatGPT', 'Claude'.")
    session_id: str = Field(..., description="A unique identifier for the chat session.")
    tags: list[str] = Field(default_factory=list, description="Optional tags for categorization.")
    messages: list[ChatMessage]

class DocumentMetadata(BaseModel):
    """Metadata for uploaded documents."""
    filename: str
    content_type: str
    upload_timestamp: datetime
    file_size: int
    total_chunks: int
    document_id: str = Field(default_factory=lambda: str(uuid4()))
    tags: list[str] = Field(default_factory=list)
    summary: str | None = None

# Forward-declare the models for services.py to import
__all__ = ["ArchiveRequest", "ChatMessage", "DocumentReference", "SearchResult", "EnhancedChatResponse", "DocumentMetadata"]


# Local imports (must come after model declaration for __all__ to work)
from services import (
    parse_pdf, parse_image, parse_audio,
    process_and_store, generate_response_stream,
    archive_chat_session, search_archived_chats,
    # Enhanced functions
    process_and_store_enhanced, search_archived_chats_enhanced,
    search_documents_enhanced, get_all_documents,
    get_document_with_chunks, generate_enhanced_response
)

app = FastAPI(
    title="Multimodal RAG & Personal Brain API",
    description="An API for uploading files and archiving chat sessions to a vector store for semantic search and retrieval.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", summary="Check API status")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Welcome to your Personal Brain API!"}


@app.post("/archive/chat", summary="Archive a chat session")
async def archive_chat(request: ArchiveRequest):
    """
    Receives a full chat session, formats it, and stores it in the vector DB
    for long-term semantic memory.
    """
    try:
        await archive_chat_session(request)
        return {"message": f"Successfully archived chat from {request.tool} with session ID {request.session_id}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to archive chat: {e}")


@app.get("/search", summary="Search across archived chats", response_model=list[SearchResult])
async def search_memory(
    q: str = Query(..., description="The semantic search query."),
    tool: str | None = Query(None, description="Filter results by a specific tool (e.g., 'Claude')."),
    tags: str | None = Query(None, description="Filter by a comma-separated list of tags."),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return."),
    include_references: bool = Query(True, description="Include document references and citations.")
):
    """
    Searches your archived chats and returns the most relevant results with metadata and references.
    """
    try:
        results = await search_archived_chats_enhanced(query=q, tool=tool, tags=tags, top_k=top_k, include_references=include_references)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform search: {e}")


@app.get("/search/documents", summary="Search across uploaded documents", response_model=list[SearchResult])
async def search_documents(
    q: str = Query(..., description="The semantic search query."),
    content_type: str | None = Query(None, description="Filter by content type (e.g., 'application/pdf')."),
    filename: str | None = Query(None, description="Filter by filename pattern."),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return."),
    include_references: bool = Query(True, description="Include document references and citations.")
):
    """
    Searches across uploaded documents with enhanced referencing.
    """
    try:
        results = await search_documents_enhanced(query=q, content_type=content_type, filename=filename, top_k=top_k, include_references=include_references)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform document search: {e}")

@app.get("/documents", summary="List all uploaded documents")
async def list_documents(
    skip: int = Query(0, ge=0, description="Number of documents to skip."),
    limit: int = Query(10, ge=1, le=100, description="Number of documents to return.")
):
    """
    Returns a list of all uploaded documents with metadata.
    """
    try:
        documents = await get_all_documents(skip=skip, limit=limit)
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve documents: {e}")

@app.get("/documents/{document_id}", summary="Get document by ID")
async def get_document_by_id(document_id: str):
    """
    Retrieves a specific document and its chunks by document ID.
    """
    try:
        document = await get_document_with_chunks(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve document: {e}")

@app.post("/upsert", summary="Upload and process a file", response_model=DocumentMetadata)
async def upsert_file(file: UploadFile = File(...)):
    """
    Accepts a file (PDF, image, audio, text), parses its content,
    and stores it in the vector store.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name found.")

    content_type, _ = mimetypes.guess_type(file.filename)
    file_content = await file.read()
    
    text_content = ""
    try:
        if content_type == "application/pdf":
            text_content = parse_pdf(io.BytesIO(file_content))
        elif content_type and content_type.startswith("image/"):
            text_content = parse_image(io.BytesIO(file_content))
        elif content_type and content_type.startswith("audio/"):
            text_content = parse_audio(io.BytesIO(file_content))
        else:
            for encoding in ['utf-8', 'utf-16', 'latin-1']:
                try:
                    text_content = file_content.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing file {file.filename}: {e}")

    if not text_content or not text_content.strip():
        raise HTTPException(status_code=400, detail=f"Could not extract any text from the file: {file.filename}")

    try:
        await process_and_store(text_content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing document in vector store: {e}")

    document_metadata = await process_and_store_enhanced(text_content, file.filename, content_type, len(file_content))
    return document_metadata


@app.post("/chat", summary="Chat with the stored documents")
async def chat_with_docs(
    query: str = Form(...),
    model_provider: Literal["gemini", "claude"] = Form("gemini")
):
    """
    Accepts a user query and streams a response from the chosen LLM,
    based on the context retrieved from uploaded documents.
    """
    try:
        return StreamingResponse(
            generate_response_stream(query, model_provider),
            media_type="text/event-stream"
        )
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during chat: {e}")

@app.post("/chat/enhanced", summary="Enhanced chat with citations", response_model=EnhancedChatResponse)
async def chat_with_citations(
    query: str = Form(...),
    model_provider: Literal["gemini", "claude"] = Form("gemini"),
    include_references: bool = Form(True, description="Include citations and references in response.")
):
    """
    Chat with enhanced citation support, returning structured response with references.
    """
    try:
        response = await generate_enhanced_response(query, model_provider, include_references)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during enhanced chat: {e}")