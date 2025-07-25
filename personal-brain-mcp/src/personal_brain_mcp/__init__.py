"""
Personal Brain MCP Server

A Model Context Protocol (MCP) server that provides AI-powered tools for managing
and querying personal knowledge bases through Claude Desktop.

Features:
- Document search and retrieval with semantic matching
- Chat conversation management and archival
- Multi-format document processing (PDF, DOCX, images, audio)
- Integration with multiple AI providers (Claude, Gemini, ChatGPT)
- Real-time document processing and indexing
"""

__version__ = "1.0.0"
__author__ = "Personal Brain MCP"
__email__ = "contact@example.com"

from .server import create_server, main

__all__ = ["create_server", "main", "__version__"]