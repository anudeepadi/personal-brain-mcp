# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Multimodal RAG & Personal Brain API** built with FastAPI that provides semantic search and archival capabilities for documents and chat sessions. The system processes various file types (PDF, images, audio, text) and stores them in a Pinecone vector database for retrieval-augmented generation (RAG).

## Architecture

The application follows a three-layer architecture:

### Core Files
- **`main.py`**: FastAPI application entry point with REST endpoints and Pydantic models
- **`services.py`**: Business logic layer containing file parsing, vector operations, and LLM interactions
- **`config.py`**: Configuration management using Pydantic Settings for environment variables

### Key Components
1. **File Processing Pipeline**: Handles PDF (PyPDF2), image OCR (Tesseract), and audio transcription (SpeechRecognition)
2. **Vector Store**: Pinecone integration with Google Generative AI embeddings for semantic search
3. **LLM Integration**: Supports both Gemini (Google) and Claude (Anthropic) models via LangChain
4. **RAG Chain**: Implements retrieval-augmented generation for document-based chat

## Development Commands

### Environment Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Required environment variables (.env file):
# GOOGLE_API_KEY=your_google_api_key
# PINECONE_API_KEY=your_pinecone_api_key  
# PINECONE_INDEX_NAME=your_index_name
# ANTHROPIC_API_KEY=your_anthropic_key (optional, for Claude model)
```

### Running the Application
```bash
# Start the FastAPI server
uvicorn main:app --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Core Endpoints
- `POST /upsert`: Upload and process files with enhanced metadata tracking
- `POST /archive/chat`: Archive complete chat sessions with metadata
- `POST /chat`: RAG-based chat with uploaded documents (streaming response)

### Enhanced Search Endpoints
- `GET /search`: Enhanced semantic search across archived chats with citations
- `GET /search/documents`: Search uploaded documents with advanced filtering
- `GET /documents`: List all uploaded documents with pagination
- `GET /documents/{document_id}`: Get specific document with all chunks

### Enhanced Chat Endpoint
- `POST /chat/enhanced`: Chat with citation support and structured responses

### Chat Management Endpoints
- `POST /import/chat`: Import Claude/ChatGPT export files (JSON, TXT, HTML)
- `POST /chats/save`: Save current chat conversation
- `POST /chats/retrieve`: Retrieve saved chats by criteria
- `GET /chats`: List all saved chats with pagination
- `DELETE /chats/{chat_id}`: Delete saved chat
- `POST /command/save_chat`: Process save_chat natural language commands
- `POST /command/retrieve_chat`: Process retrieve_chat natural language commands

## Key Dependencies

- **FastAPI**: Web framework with automatic OpenAPI documentation
- **LangChain**: LLM orchestration with Google Genai and Anthropic integrations
- **Pinecone**: Vector database for semantic search
- **MCP**: Model Context Protocol for Claude Desktop integration
- **JSON/Regex Parsing**: Chat export parsing for Claude and ChatGPT formats
- **Multimodal Processing**: PyPDF2, Tesseract OCR, SpeechRecognition, Pillow, pydub

## Import Dependencies

The codebase has a specific import pattern to avoid circular dependencies:
- `main.py` defines Pydantic models and exports them via `__all__`
- `services.py` imports models from `main.py` after model declaration
- `config.py` is imported by `services.py` for settings

## Enhanced Features

### Advanced Referencing System
- **Document References**: Each search result includes detailed citations with document ID, filename, chunk index, and relevance scores
- **Enhanced Metadata**: Documents now store upload timestamps, content types, file sizes, summaries, and unique document IDs
- **Citation Support**: Chat responses include proper citations with [1], [2] format referencing source documents

### MCP Server Integration
The project includes a Model Context Protocol (MCP) server for Claude Desktop integration:

- **File**: `mcp_server.py` - FastMCP server implementation
- **Document Tools**:
  - `search_documents`: Semantic search through documents
  - `get_document_details`: Retrieve specific document info
  - `list_all_documents`: List all documents with metadata
  - `ask_with_citations`: Q&A with proper citations
- **Chat Management Tools**:
  - `search_chat_history`: Search archived chats
  - `save_chat`: Save conversations to knowledge base
  - `retrieve_saved_chats`: Find and retrieve saved chats
  - `list_saved_chats`: Browse all saved conversations
  - `import_chat_export`: Import Claude/ChatGPT exports
  - `process_chat_command`: Handle natural language chat commands
- **Resources**: Access to documents, saved chats, and search results
- **Configuration**: `claude_desktop_config.json` template provided

### Chat Export/Import Support
The system can parse and import chat exports from:
- **Claude**: JSON format with meta and chats structure
- **ChatGPT**: conversations.json format with mapping structure  
- **Text**: Plain text with role indicators (User:, Assistant:, etc.)
- **Auto-detection**: Automatically identifies format based on content

### Natural Language Commands
- **save_chat**: Save current conversation with optional title and tags
  - `save_chat`
  - `save_chat as "My Important Chat"`
  - `save_chat as "AI Discussion" with tags ai, research`
- **retrieve_chat**: Find and retrieve saved conversations
  - `retrieve_chat`
  - `retrieve_chat with id abc123`
  - `retrieve_chat with title "Machine Learning"`
  - `retrieve_chat with tags ai, research limit 5`

## Development Commands

### FastAPI Server
```bash
# Start development server
uvicorn main:app --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

### MCP Server
```bash
# Test MCP server
python mcp_server.py

# Check logs
tail -f mcp_server.log
```

## Development Notes

- No test framework is currently configured
- The application requires external API keys for Google Generative AI, Pinecone, and optionally Anthropic
- Document chunks are created with 1000 character size and 100 character overlap
- CORS is enabled for all origins in development mode
- MCP server logs to `mcp_server.log` to avoid stdout conflicts
- Enhanced search functions provide relevance scoring and detailed references
- Chat export parsers support Claude JSON, ChatGPT JSON, and plain text formats
- Natural language command processing for intuitive chat management
- Conversation persistence with full text search and metadata filtering