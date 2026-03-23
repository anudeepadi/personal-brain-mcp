"""
Pydantic models for the Personal Brain API.
Separated to avoid circular imports.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal
from uuid import uuid4

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

class ChatExportRequest(BaseModel):
    """Request for importing chat export files."""
    export_type: Literal["claude", "chatgpt", "manual"]
    chat_title: str | None = None
    tags: list[str] = Field(default_factory=list)
    auto_detect_format: bool = True

class SaveChatRequest(BaseModel):
    """Request for saving current chat conversation."""
    chat_id: str = Field(..., description="Unique identifier for the chat session")
    title: str | None = Field(None, description="Optional title for the chat")
    messages: list[ChatMessage] = Field(..., description="Messages to save")
    tags: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)

class RetrieveChatRequest(BaseModel):
    """Request for retrieving saved chat conversations."""
    chat_id: str | None = Field(None, description="Specific chat ID to retrieve")
    title_pattern: str | None = Field(None, description="Search by title pattern")
    tags: list[str] = Field(default_factory=list)
    limit: int = Field(10, ge=1, le=50)

class SavedChatInfo(BaseModel):
    """Information about a saved chat."""
    chat_id: str
    title: str
    message_count: int
    last_updated: datetime
    tags: list[str]
    metadata: dict
    preview: str  # First few words of conversation