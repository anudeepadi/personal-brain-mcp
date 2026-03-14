<p align="center">
  <img src="https://img.shields.io/badge/Claude-MCP-blueviolet?style=for-the-badge" alt="Claude MCP"/>
  <img src="https://img.shields.io/pypi/v/personal-brain-mcp?style=for-the-badge&color=green" alt="PyPI"/>
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
</p>

# Mnemonic

> **AI memory infrastructure** — An MCP server + RAG pipeline that gives Claude Desktop persistent memory across sessions. Upload documents, archive conversations, and retrieve knowledge with semantic search and citations.

## Why This Exists

Claude Desktop forgets everything between sessions. Mnemonic fixes that by storing your documents and conversations in a vector database and making them searchable through natural language.

```
You: "What did we discuss about the database schema last month?"
Claude: *searches your knowledge base* "On March 5, you decided to use..."
```

## Quick Start

```bash
pip install personal-brain-mcp
```

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

Set up environment variables:
```bash
# server/.env
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=personal-brain
ANTHROPIC_API_KEY=optional_for_claude_model
```

Restart Claude Desktop.

## Architecture

```
Claude Desktop
    │ MCP (Model Context Protocol)
    ▼
┌──────────────────────────────────────────────────┐
│              MCP Server (FastMCP)                 │
│         10 Tools  ·  5 Resources                 │
├──────────────────────────────────────────────────┤
│              FastAPI REST API                     │
│         16 endpoints · OpenAPI docs              │
├──────────────────────────────────────────────────┤
│              Service Layer                        │
│   RAG Engine  ·  Chat Mgmt  ·  File Parsers     │
├──────────────────────────────────────────────────┤
│              External Services                    │
│   Pinecone (vectors)  ·  Gemini (LLM/embeddings)│
└──────────────────────────────────────────────────┘
```

## Repository Structure

```
mnemonic/
├── server/                  # Python backend (FastAPI + MCP)
│   ├── main.py              # REST API (16 endpoints)
│   ├── mcp_server.py        # MCP server for Claude Desktop
│   └── personal_brain_mcp/  # Core package
│       ├── server.py        # 10 MCP tools + 5 resources
│       ├── services.py      # RAG, file parsing, chat management
│       ├── models.py        # Pydantic schemas
│       └── config.py        # Environment settings
│
├── client/                  # Next.js 14 frontend
│   ├── app/                 # Pages: landing, brain, architecture, demo
│   └── components/          # 23 React components
│
├── mnemonic-autoimprove/    # Self-improving RAG optimizer
│   ├── src/                 # Evaluation engine, experiment catalog
│   ├── tests/               # 85 tests
│   └── golden_sets/         # Ground truth test cases
│
├── docs/                    # Business plans, technical docs
└── prototypes/              # Mnemonic UI prototypes (JSX)
```

## Features

### MCP Tools for Claude Desktop

| Category | Tools |
|----------|-------|
| **Documents** | `search_documents`, `get_document_details`, `list_all_documents`, `ask_with_citations` |
| **Chat** | `search_chat_history`, `save_chat`, `retrieve_saved_chats`, `list_saved_chats` |
| **Import** | `import_chat_export`, `process_chat_command` |

### Document Processing

| Format | Method |
|--------|--------|
| PDF | PyPDF2 text extraction |
| Images | Tesseract OCR |
| Audio | SpeechRecognition transcription |
| Text/Markdown | Direct chunking (1000 char, 100 overlap) |

### Chat Management

Import conversations from Claude, ChatGPT, or plain text. Archive sessions with tags for later retrieval. All stored as vectors for semantic search.

### RAG with Citations

Ask questions and get answers grounded in your uploaded documents, with `[1][2][3]` citation references back to source material.

### AutoImprove (Experimental)

Self-improving RAG optimization engine inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch). Autonomously experiments with retrieval parameters and keeps changes that measurably improve quality.

```bash
cd mnemonic-autoimprove
pip install -e ".[dev]"
python -m mnemonic_autoimprove run --golden-set golden_sets/example_golden_set.json
```

12 predefined experiments across retrieval k, temperature, prompt templates, and search strategy. Uses Gemini Flash as LLM judge (~$0.08/run).

## Development

### Backend

```bash
cd server
pip install -r requirements.txt
cp .env.example .env  # add your API keys
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd client
npm install
npm run dev
```

### AutoImprove

```bash
cd mnemonic-autoimprove
uv venv --python 3.12 .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest tests/ -v  # 85 tests
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upsert` | POST | Upload and process files (PDF, image, audio, text) |
| `/chat` | POST | Streaming RAG conversation |
| `/chat/enhanced` | POST | RAG with citation references |
| `/search` | GET | Semantic search across chats |
| `/search/documents` | GET | Semantic search across documents |
| `/documents` | GET | List uploaded documents |
| `/documents/{id}` | GET | Get document with chunks |
| `/archive/chat` | POST | Archive a chat session |
| `/import/chat` | POST | Import Claude/ChatGPT exports |
| `/chats/save` | POST | Save conversation |
| `/chats/retrieve` | POST | Retrieve by ID, title, or tags |
| `/chats` | GET | List all saved chats |
| `/chats/{id}` | DELETE | Delete saved chat |

## Tech Stack

- **Backend**: FastAPI, Python 3.8+
- **Vector DB**: Pinecone with Google Generative AI embeddings (`embedding-001`)
- **LLM**: Google Gemini 1.5 Flash (primary) + Anthropic Claude (optional)
- **Orchestration**: LangChain
- **MCP**: FastMCP for Claude Desktop integration
- **Frontend**: Next.js 14, React, TailwindCSS
- **File Processing**: PyPDF2, Tesseract OCR, SpeechRecognition

## Known Gaps

These are documented honestly so contributors know where to help:

- **No authentication** — CORS is open to all origins
- **No database** beyond Pinecone — no relational DB for user accounts or metadata
- **Frontend not wired** — Next.js app uses mock data, not connected to the API
- **No test suite for server** — test files exist but no framework configured
- **No CI/CD** — no GitHub Actions or deployment config
- **Hardcoded relevance scores** — `relevance_score=0.85` placeholder in 5 places

## Roadmap

- [ ] Wire frontend to backend API
- [ ] Add authentication + API gateway
- [ ] Server-side test suite with pytest
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Wire AutoImprove to production `services.py`
- [ ] Knowledge graph layer (entity extraction + relationship tracking)
- [ ] Local embeddings option (no API keys required)
- [ ] Multi-user support

## Contributing

```bash
git clone https://github.com/anudeepadi/personal-brain-mcp.git
cd personal-brain-mcp/server
pip install -r requirements.txt
```

## License

MIT License

---

<p align="center">
  <a href="https://github.com/anudeepadi/personal-brain-mcp">GitHub</a> ·
  <a href="https://pypi.org/project/personal-brain-mcp/">PyPI</a>
</p>
