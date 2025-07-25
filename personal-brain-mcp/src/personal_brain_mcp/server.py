#!/usr/bin/env python3
"""
Personal Brain MCP Server

A Model Context Protocol server that provides tools and resources for Claude Desktop
to interact with a personal knowledge base powered by vector search and AI.
"""

import asyncio
import json
import logging
import os
import sys
import tempfile
import argparse
from typing import Any, Dict, List
from datetime import datetime
from pathlib import Path

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Error: fastmcp is not installed. Install with: pip install fastmcp", file=sys.stderr)
    sys.exit(1)

# Configure logging for MCP (avoid stdout to prevent interference with MCP protocol)
def setup_logging(log_level: str = "INFO") -> None:
    """Set up logging to a file to avoid interfering with MCP protocol."""
    log_dir = os.path.expanduser('~/Documents') if os.path.exists(os.path.expanduser('~/Documents')) else tempfile.gettempdir()
    log_file = os.path.join(log_dir, 'personal_brain_mcp.log')
    
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        handlers=[logging.FileHandler(log_file, mode='a')],
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    logger.info(f"Personal Brain MCP Server starting - logs at {log_file}")

def find_project_files():
    """Find the main project files (services.py, models.py, etc.)"""
    current_dir = Path(__file__).parent
    
    # Check if we're in the packaged version or development version
    project_files = ['services.py', 'models.py', 'main.py']
    
    # Try to find files in various locations
    search_paths = [
        current_dir,
        current_dir.parent,
        current_dir.parent.parent,
        Path.cwd(),
        Path(os.path.dirname(os.path.abspath(__file__))).parent.parent,
    ]
    
    for search_path in search_paths:
        if all((search_path / file).exists() for file in project_files):
            return search_path
    
    return None

def create_server(api_url: str = "http://localhost:8000", log_level: str = "INFO") -> FastMCP:
    """
    Create and configure the Personal Brain MCP server.
    
    Args:
        api_url: URL of the Personal Brain API
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
    
    Returns:
        Configured FastMCP server instance
    """
    setup_logging(log_level)
    logger = logging.getLogger(__name__)
    
    # Find project files
    project_root = find_project_files()
    if project_root:
        sys.path.insert(0, str(project_root))
        logger.info(f"Found project files at: {project_root}")
    else:
        logger.warning("Could not locate project files, some functionality may not work")
    
    try:
        # Import our services (now that path is set)
        from services import (
            search_documents_enhanced,
            search_archived_chats_enhanced, 
            process_and_store_enhanced,
            get_all_documents,
            get_document_with_chunks,
            generate_enhanced_response,
            parse_pdf,
            parse_image,
            parse_audio,
            parse_chat_export,
            save_chat_conversation,
            retrieve_chat_conversations,
            get_saved_chats_list,
            process_save_chat_command,
            process_retrieve_chat_command
        )
        from models import DocumentMetadata, SearchResult, EnhancedChatResponse, SaveChatRequest, ChatMessage
        logger.info("Successfully imported all required modules")
    except ImportError as e:
        logger.error(f"Failed to import required modules: {e}")
        raise
    
    # Initialize MCP server
    mcp = FastMCP("personal-brain")
    
    # Configure server metadata
    @mcp.list_resources()
    async def list_resources() -> List[Dict[str, Any]]:
        """List available resources"""
        return [
            {
                "uri": "memory://documents",
                "name": "Personal Documents",
                "description": "Access to your indexed documents and files",
                "mimeType": "application/json"
            },
            {
                "uri": "memory://chats", 
                "name": "Archived Conversations",
                "description": "Your saved AI conversations and chat history",
                "mimeType": "application/json"
            },
            {
                "uri": "memory://search",
                "name": "Semantic Search",
                "description": "Search across all your documents and conversations",
                "mimeType": "application/json"
            },
            {
                "uri": "memory://status",
                "name": "System Status",
                "description": "Personal Brain API connection and system status", 
                "mimeType": "application/json"
            }
        ]

    @mcp.read_resource()
    async def read_resource(uri: str) -> str:
        """Read a specific resource"""
        logger.info(f"Reading resource: {uri}")
        
        try:
            if uri == "memory://documents":
                docs = await get_all_documents()
                return json.dumps({
                    "resource": "documents",
                    "count": len(docs),
                    "documents": docs
                }, indent=2)
            
            elif uri == "memory://chats":
                chats = await get_saved_chats_list()
                return json.dumps({
                    "resource": "chats", 
                    "count": len(chats),
                    "chats": chats
                }, indent=2)
            
            elif uri == "memory://search":
                return json.dumps({
                    "resource": "search",
                    "description": "Use the search_memory tool to search across documents and chats",
                    "available_tools": ["search_memory", "search_documents", "search_chats"]
                }, indent=2)
            
            elif uri == "memory://status":
                return json.dumps({
                    "resource": "status",
                    "api_url": api_url,
                    "server_status": "running",
                    "timestamp": datetime.now().isoformat()
                }, indent=2)
            
            else:
                return json.dumps({"error": f"Unknown resource: {uri}"})
                
        except Exception as e:
            logger.error(f"Error reading resource {uri}: {e}")
            return json.dumps({"error": str(e)})

    # Define MCP tools
    @mcp.tool()
    async def search_memory(
        query: str, 
        tool: str = "enhanced", 
        top_k: int = 5,
        include_references: bool = True
    ) -> Dict[str, Any]:
        """
        Search across all your documents and conversations using semantic search.
        
        Args:
            query: Natural language search query
            tool: Search type ('enhanced', 'documents', 'chats')
            top_k: Number of results to return (1-20)
            include_references: Whether to include detailed references
        """
        logger.info(f"Searching memory: {query} (tool: {tool}, top_k: {top_k})")
        
        try:
            if tool == "documents":
                results = await search_documents_enhanced(query, top_k=top_k)
            elif tool == "chats":
                results = await search_archived_chats_enhanced(query, top_k=top_k)
            else:
                # Enhanced search across both
                doc_results = await search_documents_enhanced(query, top_k=top_k//2)
                chat_results = await search_archived_chats_enhanced(query, top_k=top_k//2)
                results = doc_results + chat_results
                results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
                results = results[:top_k]
            
            return {
                "query": query,
                "results_count": len(results),
                "results": results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return {"error": str(e), "query": query}

    @mcp.tool()
    async def upload_document(
        content: str,
        filename: str = "document.txt",
        content_type: str = "text/plain",
        tags: str = ""
    ) -> Dict[str, Any]:
        """
        Upload and process a document for semantic search.
        
        Args:
            content: The document content as text
            filename: Name of the file
            content_type: MIME type of the content
            tags: Comma-separated tags for the document
        """
        logger.info(f"Uploading document: {filename}")
        
        try:
            import io
            file_like = io.BytesIO(content.encode('utf-8'))
            
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            result = await process_and_store_enhanced(
                file_like, filename, content_type, tags=tag_list
            )
            
            return {
                "message": "Document uploaded successfully",
                "filename": filename,
                "document_id": result.get("document_id", "unknown"),
                "chunks_created": result.get("total_chunks", 0),
                "tags": tag_list
            }
            
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return {"error": str(e), "filename": filename}

    @mcp.tool()
    async def save_chat(
        chat_id: str,
        messages: List[Dict[str, str]],
        title: str = None,
        tags: str = ""
    ) -> Dict[str, Any]:
        """
        Save a chat conversation to your personal archive.
        
        Args:
            chat_id: Unique identifier for the chat
            messages: List of message objects with 'role' and 'content'
            title: Optional title for the chat
            tags: Comma-separated tags
        """
        logger.info(f"Saving chat: {chat_id}")
        
        try:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            chat_messages = [ChatMessage(role=msg['role'], content=msg['content']) for msg in messages]
            
            result = await save_chat_conversation(
                chat_id=chat_id,
                title=title,
                messages=chat_messages,
                tags=tag_list
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Save chat error: {e}")
            return {"error": str(e), "chat_id": chat_id}

    @mcp.tool()
    async def retrieve_saved_chats(
        chat_id: str = None,
        title_pattern: str = None,
        tags: str = "",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Retrieve saved chat conversations.
        
        Args:
            chat_id: Specific chat ID to retrieve
            title_pattern: Pattern to match in chat titles
            tags: Comma-separated tags to filter by
            limit: Maximum number of chats to return
        """
        logger.info(f"Retrieving chats (chat_id: {chat_id}, limit: {limit})")
        
        try:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            
            result = await retrieve_chat_conversations(
                chat_id=chat_id,
                title_pattern=title_pattern,
                tags=tag_list,
                limit=limit
            )
            
            return result.get("chats", [])
            
        except Exception as e:
            logger.error(f"Retrieve chats error: {e}")
            return {"error": str(e)}

    @mcp.tool()
    async def generate_response(
        query: str,
        model_provider: str = "gemini",
        include_references: bool = True,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Generate an AI response using your personal knowledge base.
        
        Args:
            query: Question or prompt for the AI
            model_provider: AI model to use ('gemini', 'claude', 'openai')
            include_references: Whether to include source references
            max_tokens: Maximum tokens in response
        """
        logger.info(f"Generating AI response: {query[:50]}... (model: {model_provider})")
        
        try:
            response = await generate_enhanced_response(
                query=query,
                model_provider=model_provider,
                include_references=include_references
            )
            
            return {
                "query": query,
                "response": response.response,
                "model_used": response.model_used,
                "confidence_score": response.confidence_score,
                "references": response.references if include_references else [],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Generate response error: {e}")
            return {"error": str(e), "query": query}

    @mcp.tool()
    async def import_chat_file(
        file_content: str,
        filename: str,
        export_type: str = "auto",
        title: str = None,
        tags: str = ""
    ) -> Dict[str, Any]:
        """
        Import a chat export file (Claude, ChatGPT, etc.) into your archive.
        
        Args:
            file_content: Content of the chat export file
            filename: Name of the file being imported
            export_type: Type of export ('claude', 'chatgpt', 'auto')
            title: Custom title for the imported chat
            tags: Comma-separated tags
        """
        logger.info(f"Importing chat file: {filename}")
        
        try:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            
            result = await parse_chat_export(
                file_content=file_content.encode('utf-8'),
                filename=filename,
                export_type=export_type,
                title=title,
                tags=tag_list
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Import chat file error: {e}")
            return {"error": str(e), "filename": filename}

    @mcp.tool()
    async def process_natural_command(command_text: str, context: str = "") -> Dict[str, Any]:
        """
        Process natural language commands like 'save_chat' or 'retrieve_chat'.
        
        Args:
            command_text: The natural language command
            context: Additional context for the command
        """
        logger.info(f"Processing command: {command_text}")
        
        try:
            if "save_chat" in command_text.lower():
                result = await process_save_chat_command(command_text, context)
            elif "retrieve_chat" in command_text.lower():
                result = await process_retrieve_chat_command(command_text)
            else:
                result = {"error": "Unknown command. Supported: save_chat, retrieve_chat"}
            
            return result
            
        except Exception as e:
            logger.error(f"Command processing error: {e}")
            return {"error": str(e), "command": command_text}

    logger.info("Personal Brain MCP Server configured successfully")
    return mcp

async def run_server(api_url: str = "http://localhost:8000", log_level: str = "INFO"):
    """Run the MCP server"""
    server = create_server(api_url, log_level)
    
    # Import MCP stdio interface
    from mcp.server.stdio import stdio_server
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)

def main():
    """Main entry point for the CLI command"""
    parser = argparse.ArgumentParser(
        description="Personal Brain MCP Server - AI-powered knowledge management for Claude Desktop"
    )
    parser.add_argument(
        "--api-url",
        default=os.getenv("PERSONAL_BRAIN_API_URL", "http://localhost:8000"),
        help="URL of the Personal Brain API (default: http://localhost:8000)"
    )
    parser.add_argument(
        "--log-level", 
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="Logging level (default: INFO)"
    )
    parser.add_argument(
        "--version",
        action="version",
        version="Personal Brain MCP Server 1.0.0"
    )
    
    args = parser.parse_args()
    
    try:
        asyncio.run(run_server(args.api_url, args.log_level))
    except KeyboardInterrupt:
        print("\nShutting down Personal Brain MCP Server...")
    except Exception as e:
        print(f"Error starting server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()