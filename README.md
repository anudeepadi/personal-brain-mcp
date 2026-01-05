<p align="center">
  <img src="https://img.shields.io/badge/Claude-MCP-blueviolet?style=for-the-badge" alt="Claude MCP"/>
  <img src="https://img.shields.io/pypi/v/personal-brain-mcp?style=for-the-badge&color=green" alt="PyPI"/>
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
</p>

# Personal Brain MCP Server

> **Your AI's Long-Term Memory** — A production-ready MCP server that gives Claude Desktop persistent memory across sessions through semantic search, knowledge graphs, and multimodal document processing.

## Why This Exists

Claude Desktop forgets everything when you close it. **Personal Brain fixes that.**

Upload documents, save conversations, and build a knowledge graph that Claude can search semantically. Your AI assistant finally remembers what you told it last week.

```
You: "What did we discuss about the React architecture last month?"
Claude: *searches your personal brain* "On Dec 15, you decided on..."
```

## Quick Start

```bash
# Install in 30 seconds
pip install personal-brain-mcp
```

Add to Claude Desktop config:
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

Restart Claude Desktop. Done. Your AI now has a brain.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLAUDE DESKTOP                               │
│                         │                                        │
│              Model Context Protocol (MCP)                        │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSONAL BRAIN MCP SERVER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  14 Tools   │  │ 5 Resources │  │     FastAPI Server      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SERVICE LAYER                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │   │
│  │  │ RAG Engine │ │ Chat Mgmt  │ │ Hybrid Search      │    │   │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  DATA LAYER                               │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │   │
│  │  │  Pinecone  │ │  NetworkX  │ │ File Parsers       │    │   │
│  │  │  Vectors   │ │   Graph    │ │ PDF/OCR/Audio      │    │   │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### Multimodal Document Processing
| Format | Processing |
|--------|-----------|
| PDF | PyPDF2 text extraction |
| Images | Tesseract OCR |
| Audio | SpeechRecognition transcription |
| Text | Direct chunking |

### Semantic Search with Knowledge Graph
Not just vector search — we build **entity relationships** across your documents.

```python
# Example: Find connections between concepts
claude> "How does our auth system relate to the API rate limiting?"
# Hybrid search: vector similarity + graph traversal
# Returns: connected documents with relationship context
```

### 14 MCP Tools for Claude

| Category | Tools |
|----------|-------|
| **Documents** | `search_documents`, `get_document_details`, `list_all_documents`, `ask_with_citations` |
| **Chat** | `search_chat_history`, `save_chat`, `retrieve_saved_chats`, `list_saved_chats` |
| **Import** | `import_chat_export`, `process_chat_command` |
| **Graph** | `search_documents_hybrid`, `explore_entity_relationships`, `get_graph_statistics` |

## Real-World Use Cases

### 1. Never Lose Context
```
# Save important conversations
Claude: "Should I save this architecture discussion?"
You: "Yes, tag it as 'backend-design'"
# Retrieve months later
You: "What did we decide about the database schema?"
```

### 2. Research Assistant
```
# Upload papers, notes, transcripts
# Ask questions with citations
You: "What does the literature say about transformer attention?"
Claude: "Based on your uploaded papers... [1][2][3]"
```

### 3. Import Existing Chats
```bash
# Migrate from ChatGPT or other Claude sessions
POST /import/chat
# Supports: JSON exports, TXT, HTML
```

## Installation

### Prerequisites
- Python 3.8+
- Tesseract OCR (for image processing): `brew install tesseract`
- API Keys: Google AI, Pinecone (free tiers available)

### From PyPI
```bash
pip install personal-brain-mcp
```

### From Source
```bash
git clone https://github.com/anudeepadi/personal-brain-mcp.git
cd personal-brain-mcp
pip install -e .
```

### Environment Setup
```bash
# .env file
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=personal-brain
ANTHROPIC_API_KEY=optional_for_claude_model
```

## API Endpoints

The server also exposes a REST API for programmatic access:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upsert` | POST | Upload and process files |
| `/search` | GET | Semantic search |
| `/chat` | POST | RAG-based conversation |
| `/archive/chat` | POST | Save chat sessions |
| `/import/chat` | POST | Import external chats |
| `/graph/*` | GET/POST | Knowledge graph operations |

Full OpenAPI docs at `http://localhost:8000/docs`

## Tech Stack

- **Backend**: FastAPI, Python 3.8+
- **Vector DB**: Pinecone with Google Generative AI embeddings
- **LLM**: Google Gemini + Anthropic Claude (via LangChain)
- **Graph**: NetworkX for entity relationships
- **MCP**: FastMCP for Claude Desktop integration
- **Processing**: PyPDF2, Tesseract, SpeechRecognition

## Comparison with Alternatives

| Feature | Personal Brain | Obsidian + Plugin | Notion AI | Mem.ai |
|---------|---------------|-------------------|-----------|--------|
| MCP Integration | ✅ Native | ❌ | ❌ | ❌ |
| Self-Hosted | ✅ | ✅ | ❌ | ❌ |
| Knowledge Graph | ✅ | Partial | ❌ | ❌ |
| Multimodal | ✅ PDF/OCR/Audio | ❌ | Partial | Partial |
| Open Source | ✅ MIT | Varies | ❌ | ❌ |
| Cost | Free (self-host) | Free | $10+/mo | $10+/mo |

## Roadmap

- [ ] Web UI for document management
- [ ] Scheduled document sync (Google Drive, Notion)
- [ ] Multi-user support with auth
- [ ] Local embeddings option (no API required)
- [ ] Plugin system for custom processors

## Contributing

Contributions welcome!

```bash
# Development setup
pip install -e ".[dev]"
pytest tests/
ruff check app/
```

## License

MIT License - see [LICENSE](LICENSE)

---

<p align="center">
  <b>Built for the Claude MCP ecosystem</b><br/>
  <a href="https://github.com/anudeepadi/personal-brain-mcp">GitHub</a> •
  <a href="https://pypi.org/project/personal-brain-mcp/">PyPI</a> •
  <a href="https://twitter.com/anudeepadi">Twitter</a>
</p>
