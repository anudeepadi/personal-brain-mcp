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

- `POST /upsert`: Upload and process files (PDF, image, audio, text)
- `POST /archive/chat`: Archive complete chat sessions with metadata
- `GET /search`: Semantic search across archived chats with filtering
- `POST /chat`: RAG-based chat with uploaded documents (streaming response)

## Key Dependencies

- **FastAPI**: Web framework with automatic OpenAPI documentation
- **LangChain**: LLM orchestration with Google Genai and Anthropic integrations
- **Pinecone**: Vector database for semantic search
- **Multimodal Processing**: PyPDF2, Tesseract OCR, SpeechRecognition, Pillow, pydub

## Import Dependencies

The codebase has a specific import pattern to avoid circular dependencies:
- `main.py` defines Pydantic models and exports them via `__all__`
- `services.py` imports models from `main.py` after model declaration
- `config.py` is imported by `services.py` for settings

## Development Notes

- No test framework is currently configured
- The application requires external API keys for Google Generative AI, Pinecone, and optionally Anthropic
- Document chunks are created with 1000 character size and 100 character overlap
- CORS is enabled for all origins in development mode