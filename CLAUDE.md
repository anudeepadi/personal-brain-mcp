# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Mnemonic** — an AI memory infrastructure platform evolving from the Personal Brain MCP Server. The system provides semantic search, archival capabilities, and retrieval-augmented generation (RAG) for documents and chat sessions, backed by a Pinecone vector database.

## Repository Structure

```
/
├── client/                  # Frontend (Next.js 14 + React + TailwindCSS)
│   ├── app/                 # Pages: landing, brain, architecture, demo
│   ├── components/          # 23 reusable components (landing, brain, demo, architecture, ui)
│   ├── lib/                 # Utilities, hooks, test helpers
│   └── package.json
│
├── server/                  # Backend (Python / FastAPI)
│   ├── main.py              # FastAPI app entry point, REST endpoints
│   ├── mcp_server.py        # MCP server for Claude Desktop integration
│   ├── personal_brain_mcp/  # Python package (pip-installable)
│   │   ├── server.py        # FastMCP server implementation
│   │   ├── services.py      # Business logic: file parsing, vectors, LLM, RAG
│   │   ├── models.py        # Pydantic data models
│   │   └── config.py        # Environment config via Pydantic Settings
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── test_setup.py
│   ├── test_mcp_startup.py
│   └── start_mcp_server.sh
│
├── docs/
│   ├── business-plans/      # Strategy reports, competitive research
│   └── technical/           # Architecture diagrams, setup guides, config templates
│
├── prototypes/              # Mnemonic UI prototypes (JSX) and HTML mockups
│
├── archive/                 # Redundant/old files kept for review before deletion
│   ├── old-frontend/        # Abandoned vanilla HTML/CSS/JS frontend
│   ├── npm-packages/        # Duplicate NPM distribution folders
│   ├── duplicate-docs/      # Overlapping publishing/setup guides
│   ├── build-artifacts/     # dist/, egg-info, .next cache
│   └── duplicate-python-root/  # Root-level copies of package files
│
├── CLAUDE.md                # This file
└── README.md                # Project README
```

## Architecture

### Backend (server/)
- **FastAPI Server** (`main.py`): REST endpoints for upsert, chat, search, document management
- **MCP Server** (`mcp_server.py`): Model Context Protocol integration for Claude Desktop
- **Business Logic** (`personal_brain_mcp/services.py`): File parsing (PDF, OCR, audio), vector ops, LLM integration, RAG chain
- **Models** (`personal_brain_mcp/models.py`): Pydantic schemas for requests/responses
- **Config** (`personal_brain_mcp/config.py`): Environment variable management

### Frontend (client/)
- Next.js 14 App Router with TailwindCSS
- Pages: Landing (hero + value prop), Brain (memory dashboard + graph), Architecture (technical details + benchmarks), Demo (interactive problem solver)
- 23 components organized by feature area

### External Services
- **Pinecone**: Vector database for semantic search
- **Google Gemini API**: Embeddings and chat
- **Anthropic Claude API**: Optional LLM provider
- **LangChain**: Abstraction layer for LLM orchestration

## Development Commands

```bash
# Backend
cd server
pip install -r requirements.txt
uvicorn main:app --reload                    # Dev server
uvicorn main:app --host 0.0.0.0 --port 8000 # Production
python mcp_server.py                         # MCP server

# Frontend
cd client
npm install
npm run dev
```

### Required Environment Variables (server/.env)
- `GOOGLE_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `ANTHROPIC_API_KEY` (optional)

## API Endpoints

### Core: `POST /upsert`, `POST /chat`, `POST /chat/enhanced`, `POST /archive/chat`
### Search: `GET /search`, `GET /search/documents`, `GET /documents`, `GET /documents/{id}`
### Chat Management: `POST /import/chat`, `POST /chats/save`, `POST /chats/retrieve`, `GET /chats`, `DELETE /chats/{id}`
### Commands: `POST /command/save_chat`, `POST /command/retrieve_chat`

## Key Gaps to Address

1. **No middleware layer** — frontend calls backend directly; no auth, rate limiting, or API gateway
2. **No database** beyond Pinecone — no relational DB for user accounts, sessions, metadata
3. **No authentication** — CORS open to all origins, no user management
4. **No test suite** — test files exist but no framework configured
5. **Frontend not wired to backend** — Next.js app has mock data, not connected to API
6. **No CI/CD pipeline** — no GitHub Actions, Docker, or deployment config
7. **Mnemonic prototypes are standalone** — JSX files in /prototypes are not integrated into /client

## Development Notes

- The `personal_brain_mcp/` package uses relative imports; standalone root files (now archived) used absolute imports
- Document chunks: 1000 char size, 100 char overlap
- MCP server logs to `mcp_server.log` to avoid stdout conflicts
- Chat export parsers support Claude JSON, ChatGPT JSON, and plain text formats
