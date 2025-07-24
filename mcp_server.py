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
from mcp.server.models import TextContent
from mcp.types import Tool, Resource

# Import our services
from services import (
    search_documents_enhanced,
    search_archived_chats_enhanced,
    process_and_store_enhanced,
    get_all_documents,
    get_document_with_chunks,
    generate_enhanced_response,
    parse_pdf,
    parse_image,
    parse_audio
)
from main import DocumentMetadata, SearchResult, EnhancedChatResponse
import io

# Configure logging for MCP (avoid stdout)
logging.basicConfig(
    level=logging.INFO,
    handlers=[logging.FileHandler('mcp_server.log')],
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

def main():
    """Run the MCP server."""
    asyncio.run(mcp.run())

if __name__ == "__main__":
    main()