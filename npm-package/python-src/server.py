#!/usr/bin/env python3
"""
MCP Server for Personal Brain API
Provides tools and resources for Claude Desktop to interact with the personal knowledge base.
"""

import asyncio
import json
import logging
from typing import Any, Dict, List
from datetime import datetime
from mcp.server.fastmcp import FastMCP

# Import our services
import json
from .services import (
    search_documents_enhanced,
    search_archived_chats_enhanced,
    process_and_store_enhanced,
    get_all_documents,
    get_document_with_chunks,
    generate_enhanced_response,
    parse_pdf,
    parse_image,
    parse_audio,
    # Chat management functions
    parse_chat_export,
    save_chat_conversation,
    retrieve_chat_conversations,
    get_saved_chats_list,
    process_save_chat_command,
    process_retrieve_chat_command
)
from .models import DocumentMetadata, SearchResult, EnhancedChatResponse, SaveChatRequest, ChatMessage
import io

# Configure logging for MCP (avoid stdout)
import os
import tempfile

# Use a writable directory for log files
log_dir = os.path.expanduser('~/Documents') if os.path.exists(os.path.expanduser('~/Documents')) else tempfile.gettempdir()
log_file = os.path.join(log_dir, 'mcp_server.log')

logging.basicConfig(
    level=logging.INFO,
    handlers=[logging.FileHandler(log_file, mode='a')],
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize FastMCP server
mcp = FastMCP("personal-brain")

@mcp.tool()
async def search_documents(
    query: str,
    content_type: str = None,
    filename: str = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Search through uploaded documents with semantic search.
    
    Args:
        query: The search query
        content_type: Filter by content type (e.g., 'application/pdf')
        filename: Filter by filename pattern
        top_k: Number of results to return (1-20)
    
    Returns:
        List of search results with content, metadata, and references
    """
    try:
        results = await search_documents_enhanced(
            query=query,
            content_type=content_type,
            filename=filename,
            top_k=min(max(top_k, 1), 20),
            include_references=True
        )
        
        return [
            {
                "content": result.content,
                "metadata": result.metadata,
                "relevance_score": result.relevance_score,
                "document_id": result.document_id,
                "references": [
                    {
                        "document_id": ref.document_id,
                        "filename": ref.filename,
                        "chunk_index": ref.chunk_index,
                        "content_excerpt": ref.content_excerpt,
                        "relevance_score": ref.relevance_score
                    } for ref in result.references
                ]
            } for result in results
        ]
    except Exception as e:
        logging.error(f"Error in search_documents: {e}")
        return [{"error": f"Search failed: {str(e)}"}]

@mcp.tool()
async def search_chat_history(
    query: str,
    tool: str = None,
    tags: str = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Search through archived chat sessions.
    
    Args:
        query: The search query
        tool: Filter by AI tool (e.g., 'Claude', 'ChatGPT')
        tags: Comma-separated list of tags to filter by
        top_k: Number of results to return (1-20)
    
    Returns:
        List of chat search results with context and references
    """
    try:
        results = await search_archived_chats_enhanced(
            query=query,
            tool=tool,
            tags=tags,
            top_k=min(max(top_k, 1), 20),
            include_references=True
        )
        
        return [
            {
                "content": result.content,
                "metadata": result.metadata,
                "relevance_score": result.relevance_score,
                "document_id": result.document_id,
                "references": [
                    {
                        "document_id": ref.document_id,
                        "filename": ref.filename,
                        "content_excerpt": ref.content_excerpt,
                        "relevance_score": ref.relevance_score,
                        "timestamp": ref.timestamp.isoformat() if ref.timestamp else None
                    } for ref in result.references
                ]
            } for result in results
        ]
    except Exception as e:
        logging.error(f"Error in search_chat_history: {e}")
        return [{"error": f"Chat search failed: {str(e)}"}]

@mcp.tool()
async def get_document_details(document_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific document including all chunks.
    
    Args:
        document_id: The unique identifier of the document
    
    Returns:
        Document details with all chunks and metadata
    """
    try:
        document = await get_document_with_chunks(document_id)
        if not document:
            return {"error": "Document not found"}
        
        return document
    except Exception as e:
        logging.error(f"Error in get_document_details: {e}")
        return {"error": f"Failed to retrieve document: {str(e)}"}

@mcp.tool()
async def list_all_documents(skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
    """
    List all uploaded documents with their metadata.
    
    Args:
        skip: Number of documents to skip
        limit: Maximum number of documents to return (1-50)
    
    Returns:
        List of document metadata
    """
    try:
        documents = await get_all_documents(
            skip=max(skip, 0),
            limit=min(max(limit, 1), 50)
        )
        return documents
    except Exception as e:
        logging.error(f"Error in list_all_documents: {e}")
        return [{"error": f"Failed to list documents: {str(e)}"}]

@mcp.tool()
async def ask_with_citations(
    question: str,
    model_provider: str = "gemini"
) -> Dict[str, Any]:
    """
    Ask a question and get an answer with proper citations from your knowledge base.
    
    Args:
        question: The question to ask
        model_provider: AI model to use ('gemini' or 'claude')
    
    Returns:
        Response with citations and references
    """
    try:
        if model_provider not in ["gemini", "claude"]:
            model_provider = "gemini"
            
        response = await generate_enhanced_response(
            query=question,
            model_provider=model_provider,
            include_references=True
        )
        
        return {
            "response": response.response,
            "model_used": response.model_used,
            "confidence_score": response.confidence_score,
            "references": [
                {
                    "document_id": ref.document_id,
                    "filename": ref.filename,
                    "chunk_index": ref.chunk_index,
                    "content_excerpt": ref.content_excerpt,
                    "relevance_score": ref.relevance_score,
                    "timestamp": ref.timestamp.isoformat() if ref.timestamp else None
                } for ref in response.references
            ]
        }
    except Exception as e:
        logging.error(f"Error in ask_with_citations: {e}")
        return {"error": f"Failed to generate response: {str(e)}"}

# --- CHAT MANAGEMENT TOOLS ---

@mcp.tool()
async def save_chat(
    chat_id: str,
    messages: List[Dict[str, str]],
    title: str = None,
    tags: str = ""
) -> Dict[str, Any]:
    """
    Save a chat conversation to your personal knowledge base.
    
    Args:
        chat_id: Unique identifier for the chat
        messages: List of messages with 'role' and 'content' keys
        title: Optional title for the chat
        tags: Comma-separated tags for categorization
    
    Returns:
        Save confirmation with chat details
    """
    try:
        # Convert dict messages to ChatMessage objects
        chat_messages = [
            ChatMessage(role=msg.get("role", "user"), content=msg.get("content", ""))
            for msg in messages if msg.get("content")
        ]
        
        if not chat_messages:
            return {"error": "No valid messages provided"}
        
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        result = await save_chat_conversation(
            chat_id=chat_id,
            title=title,
            messages=chat_messages,
            tags=tag_list or ["mcp_saved"],
            metadata={"saved_via": "mcp_tool"}
        )
        
        return {
            "message": f"Chat saved successfully as '{result['title']}'",
            "chat_id": result["chat_id"],
            "title": result["title"],
            "message_count": result["message_count"]
        }
    except Exception as e:
        logging.error(f"Error in save_chat: {e}")
        return {"error": f"Failed to save chat: {str(e)}"}

@mcp.tool()
async def retrieve_saved_chats(
    chat_id: str = None,
    title_pattern: str = None,
    tags: str = "",
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Retrieve saved chat conversations from your knowledge base.
    
    Args:
        chat_id: Specific chat ID to retrieve
        title_pattern: Search by title pattern
        tags: Comma-separated tags to filter by
        limit: Maximum number of chats to return (1-20)
    
    Returns:
        List of matching chat conversations
    """
    try:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        chats = await retrieve_chat_conversations(
            chat_id=chat_id,
            title_pattern=title_pattern,
            tags=tag_list,
            limit=min(max(limit, 1), 20)
        )
        
        return chats
    except Exception as e:
        logging.error(f"Error in retrieve_saved_chats: {e}")
        return [{"error": f"Failed to retrieve chats: {str(e)}"}]

@mcp.tool()
async def list_saved_chats(
    skip: int = 0,
    limit: int = 10,
    tags: str = ""
) -> List[Dict[str, Any]]:
    """
    List all saved chat conversations with metadata.
    
    Args:
        skip: Number of chats to skip (pagination)
        limit: Maximum number of chats to return (1-50)
        tags: Comma-separated tags to filter by
    
    Returns:
        List of saved chats with metadata
    """
    try:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        chats = await get_saved_chats_list(
            skip=max(skip, 0),
            limit=min(max(limit, 1), 50),
            tags=tag_list
        )
        
        return [
            {
                "chat_id": chat.chat_id,
                "title": chat.title,
                "message_count": chat.message_count,
                "last_updated": chat.last_updated.isoformat(),
                "tags": chat.tags,
                "preview": chat.preview
            } for chat in chats
        ]
    except Exception as e:
        logging.error(f"Error in list_saved_chats: {e}")
        return [{"error": f"Failed to list chats: {str(e)}"}]

@mcp.tool()
async def import_chat_export(
    file_content: str,
    filename: str = "export.json",
    export_type: str = "auto",
    title: str = None,
    tags: str = ""
) -> Dict[str, Any]:
    """
    Import a chat export file from Claude or ChatGPT.
    
    Args:
        file_content: The content of the export file
        filename: Name of the export file
        export_type: Type of export ('claude', 'chatgpt', 'auto')
        title: Optional custom title
        tags: Comma-separated tags
    
    Returns:
        Import result with chat details
    """
    try:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        result = await parse_chat_export(
            file_content=file_content.encode('utf-8'),
            filename=filename,
            export_type=export_type,
            title=title,
            tags=tag_list or ["imported_via_mcp"]
        )
        
        return {
            "message": "Chat export imported successfully",
            "chat_id": result["chat_id"],
            "title": result["title"],
            "total_messages": result["message_count"],
            "detected_format": result["detected_format"]
        }
    except Exception as e:
        logging.error(f"Error in import_chat_export: {e}")
        return {"error": f"Failed to import chat export: {str(e)}"}

@mcp.tool()
async def process_chat_command(
    command: str,
    context: str = ""
) -> Dict[str, Any]:
    """
    Process save_chat or retrieve_chat commands from user input.
    
    Args:
        command: The chat command (e.g., "save_chat as 'My Chat'", "retrieve_chat with tags ai")
        context: Current conversation context for save_chat commands
    
    Returns:
        Command execution result
    """
    try:
        command_lower = command.lower().strip()
        
        if command_lower.startswith("save_chat"):
            result = await process_save_chat_command(command, context)
            return result
        elif command_lower.startswith("retrieve_chat"):
            result = await process_retrieve_chat_command(command)
            return result
        else:
            return {"error": "Unknown command. Use 'save_chat' or 'retrieve_chat'"}
    except Exception as e:
        logging.error(f"Error in process_chat_command: {e}")
        return {"error": f"Failed to process command: {str(e)}"}

# Resources for Claude Desktop to access

@mcp.resource("documents://list")
async def documents_list() -> str:
    """List all documents in the knowledge base."""
    try:
        documents = await get_all_documents(limit=100)
        return json.dumps(documents, indent=2, default=str)
    except Exception as e:
        logging.error(f"Error in documents_list resource: {e}")
        return json.dumps({"error": f"Failed to list documents: {str(e)}"})

@mcp.resource("documents://{document_id}")
async def document_details(document_id: str) -> str:
    """Get detailed information about a specific document."""
    try:
        document = await get_document_with_chunks(document_id)
        if not document:
            return json.dumps({"error": "Document not found"})
        return json.dumps(document, indent=2, default=str)
    except Exception as e:
        logging.error(f"Error in document_details resource: {e}")
        return json.dumps({"error": f"Failed to retrieve document: {str(e)}"})

@mcp.resource("search://documents/{query}")
async def search_documents_resource(query: str) -> str:
    """Search documents and return results as a resource."""
    try:
        results = await search_documents_enhanced(
            query=query,
            top_k=10,
            include_references=True
        )
        
        formatted_results = []
        for result in results:
            formatted_results.append({
                "content": result.content,
                "metadata": result.metadata,
                "relevance_score": result.relevance_score,
                "document_id": result.document_id,
                "references": [
                    {
                        "document_id": ref.document_id,
                        "filename": ref.filename,
                        "chunk_index": ref.chunk_index,
                        "content_excerpt": ref.content_excerpt
                    } for ref in result.references
                ]
            })
        
        return json.dumps(formatted_results, indent=2, default=str)
    except Exception as e:
        logging.error(f"Error in search_documents_resource: {e}")
        return json.dumps({"error": f"Search failed: {str(e)}"})

@mcp.resource("chats://saved")
async def saved_chats_resource() -> str:
    """Access to all saved chats."""
    try:
        chats = await get_saved_chats_list(limit=50)
        formatted_chats = [
            {
                "chat_id": chat.chat_id,
                "title": chat.title,
                "message_count": chat.message_count,
                "last_updated": chat.last_updated.isoformat(),
                "tags": chat.tags,
                "preview": chat.preview
            } for chat in chats
        ]
        return json.dumps(formatted_chats, indent=2, default=str)
    except Exception as e:
        logging.error(f"Error in saved_chats_resource: {e}")
        return json.dumps({"error": f"Failed to load saved chats: {str(e)}"})

@mcp.resource("chats://{chat_id}")
async def specific_chat_resource(chat_id: str) -> str:
    """Access to a specific saved chat."""
    try:
        chats = await retrieve_chat_conversations(chat_id=chat_id, limit=1)
        if not chats:
            return json.dumps({"error": "Chat not found"})
        
        return json.dumps(chats[0], indent=2, default=str)
    except Exception as e:
        logging.error(f"Error in specific_chat_resource: {e}")
        return json.dumps({"error": f"Failed to retrieve chat: {str(e)}"})

def main():
    """Run the MCP server."""
    mcp.run()

if __name__ == "__main__":
    main()