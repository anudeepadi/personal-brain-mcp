import io
import mimetypes
from typing import Literal

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
# Import models from separate module to avoid circular imports
from models import (
    ChatMessage, DocumentReference, SearchResult, EnhancedChatResponse,
    ArchiveRequest, DocumentMetadata, ChatExportRequest, SaveChatRequest,
    RetrieveChatRequest, SavedChatInfo
)


# Local imports
from services import (
    parse_pdf, parse_image, parse_audio,
    process_and_store, generate_response_stream,
    archive_chat_session, search_archived_chats,
    # Enhanced functions
    process_and_store_enhanced, search_archived_chats_enhanced,
    search_documents_enhanced, get_all_documents,
    get_document_with_chunks, generate_enhanced_response,
    # Chat management functions
    parse_chat_export, save_chat_conversation,
    retrieve_chat_conversations, get_saved_chats_list,
    delete_saved_chat, process_save_chat_command,
    process_retrieve_chat_command
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

# Mount static files
frontend_path = Path(__file__).parent / "frontend"
if frontend_path.exists():
    app.mount("/frontend", StaticFiles(directory=str(frontend_path)), name="frontend")


@app.get("/", summary="Serve frontend UI")
def root():
    """Serve the frontend HTML page."""
    index_path = Path(__file__).parent / "frontend" / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"status": "ok", "message": "Welcome to your Personal Brain API!"}

@app.get("/api/health", summary="Check API status")
def health():
    """Health check endpoint."""
    return {"status": "ok", "message": "Personal Brain API is running!"}


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

# --- CHAT MANAGEMENT ENDPOINTS ---

@app.post("/import/chat", summary="Import chat export file")
async def import_chat_export(
    file: UploadFile = File(...),
    export_type: Literal["claude", "chatgpt", "auto"] = Form("auto"),
    title: str = Form(None),
    tags: str = Form("")
):
    """
    Import chat conversation from Claude or ChatGPT export files.
    Supports JSON, TXT, and HTML formats.
    """
    try:
        file_content = await file.read()
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        result = await parse_chat_export(
            file_content=file_content,
            filename=file.filename,
            export_type=export_type,
            title=title,
            tags=tag_list
        )
        
        return {
            "message": "Chat export imported successfully",
            "chat_id": result["chat_id"],
            "total_messages": result["message_count"],
            "detected_format": result["detected_format"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import chat: {e}")

@app.post("/chats/save", summary="Save current chat conversation")
async def save_current_chat(request: SaveChatRequest):
    """
    Save a chat conversation with messages and metadata.
    """
    try:
        result = await save_chat_conversation(
            chat_id=request.chat_id,
            title=request.title,
            messages=request.messages,
            tags=request.tags,
            metadata=request.metadata
        )
        
        return {
            "message": "Chat saved successfully",
            "chat_id": result["chat_id"],
            "title": result["title"],
            "message_count": result["message_count"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save chat: {e}")

@app.post("/chats/retrieve", summary="Retrieve saved chats")
async def retrieve_saved_chats(request: RetrieveChatRequest):
    """
    Retrieve saved chat conversations based on criteria.
    """
    try:
        chats = await retrieve_chat_conversations(
            chat_id=request.chat_id,
            title_pattern=request.title_pattern,
            tags=request.tags,
            limit=request.limit
        )
        
        return {
            "chats": chats,
            "total_found": len(chats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chats: {e}")

@app.get("/chats", summary="List all saved chats")
async def list_saved_chats(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tags: str = Query(None, description="Filter by comma-separated tags")
):
    """
    List all saved chat conversations with metadata.
    """
    try:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        chats = await get_saved_chats_list(
            skip=skip,
            limit=limit,
            tags=tag_list
        )
        
        return {
            "chats": chats,
            "returned": len(chats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list chats: {e}")

@app.delete("/chats/{chat_id}", summary="Delete saved chat")
async def delete_chat(chat_id: str):
    """
    Delete a saved chat conversation.
    """
    try:
        success = await delete_saved_chat(chat_id)
        if not success:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete chat: {e}")

@app.post("/command/save_chat", summary="Process save_chat command")
async def handle_save_chat_command(
    command_text: str = Form(..., description="The full command text"),
    context: str = Form("", description="Current conversation context")
):
    """
    Process 'save_chat' command from user input.
    """
    try:
        result = await process_save_chat_command(command_text, context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process save_chat command: {e}")

@app.post("/command/retrieve_chat", summary="Process retrieve_chat command")
async def handle_retrieve_chat_command(
    command_text: str = Form(..., description="The full command text")
):
    """
    Process 'retrieve_chat' command from user input.
    """
    try:
        result = await process_retrieve_chat_command(command_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process retrieve_chat command: {e}")