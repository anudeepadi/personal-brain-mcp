# Personal Brain MCP Server

A multimodal RAG (Retrieval-Augmented Generation) & Personal Brain API with MCP (Model Context Protocol) integration for Claude Desktop. This package provides semantic search and archival capabilities for documents and chat sessions.

## Features

- **Document Processing**: Support for PDF, images (OCR), and audio files (transcription)
- **Vector Search**: Pinecone-powered semantic search with Google Generative AI embeddings
- **Chat Management**: Archive, search, and retrieve chat conversations
- **Multi-LLM Support**: Both Google Gemini and Anthropic Claude models
- **MCP Integration**: Direct integration with Claude Desktop via Model Context Protocol
- **RESTful API**: FastAPI-based web interface with automatic OpenAPI documentation

## Installation

### From PyPI (recommended)

```bash
pip install personal-brain-mcp
```

### From Source

```bash
git clone <repository-url>
cd personal-brain-mcp
pip install -e .
```

## Quick Start

### 1. Environment Setup

Create a `.env` file with your API keys:

```env
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key  
PINECONE_INDEX_NAME=your_index_name
ANTHROPIC_API_KEY=your_anthropic_key  # Optional, for Claude model
```

### 2. Run the MCP Server

```bash
personal-brain-mcp
```

The server will start and be ready to accept MCP connections from Claude Desktop.

### 3. Claude Desktop Integration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "personal-brain-mcp",
      "args": []
    }
  }
}
```

## Available Tools

### Document Management
- `search_documents`: Semantic search through uploaded documents
- `get_document_details`: Retrieve specific document information
- `list_all_documents`: Browse all documents with metadata
- `ask_with_citations`: Q&A with proper source citations

### Chat Management
- `search_chat_history`: Search archived chat sessions
- `save_chat`: Save conversations to knowledge base
- `retrieve_saved_chats`: Find and retrieve saved chats
- `list_saved_chats`: Browse all saved conversations
- `import_chat_export`: Import Claude/ChatGPT exports
- `process_chat_command`: Handle natural language commands

## API Endpoints

When running as a web server, the following endpoints are available:

- `POST /upsert`: Upload and process files
- `POST /archive/chat`: Archive chat sessions
- `POST /chat`: RAG-based chat with documents
- `GET /search`: Enhanced semantic search
- `GET /documents`: List all documents
- `POST /import/chat`: Import chat exports

## Development

### Install Development Dependencies

```bash
pip install -e ".[dev]"
```

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black personal_brain_mcp/
flake8 personal_brain_mcp/
```

## Requirements

- Python 3.8+
- Google Generative AI API key
- Pinecone API key and index
- Optional: Anthropic API key for Claude model
- System dependencies: Tesseract OCR for image processing

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request at https://github.com/anudeepadi/personal-brain-mcp