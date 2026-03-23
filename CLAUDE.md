# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Mnemonic** — an AI memory infrastructure platform with dual-process architecture inspired by human sleep consolidation. Semantic search, archival capabilities, and RAG for documents and chat sessions, backed by Pinecone.

## Repository Structure

```
/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Landing page (design showcase)
│   ├── brain/page.tsx       # Memory dashboard
│   ├── architecture/        # Technical details
│   └── demo/                # Interactive demo
├── components/              # React components
│   ├── landing/             # Landing page sections + architecture diagram
│   ├── brain/               # Dashboard: chat, events, graph, compiled memory
│   ├── demo/                # Demo components
│   ├── architecture/        # Architecture page components
│   ├── ui/                  # Primitives (button, card, input, tabs, textarea)
│   └── navigation.tsx       # Global nav
├── lib/                     # Utilities, hooks, test helpers
├── design-system.ts         # Design system tokens and documentation
├── package.json             # Next.js dependencies
├── tailwind.config.ts       # Tailwind with design system colors
├── next.config.js
├── tsconfig.json
├── postcss.config.js
│
├── backend/                 # Python / FastAPI backend
│   ├── main.py              # FastAPI app entry point, REST endpoints
│   ├── mcp_server.py        # MCP server for Claude Desktop
│   ├── personal_brain_mcp/  # Python package
│   │   ├── server.py        # FastMCP server
│   │   ├── services.py      # Business logic: file parsing, vectors, LLM, RAG
│   │   ├── models.py        # Pydantic data models
│   │   └── config.py        # Environment config
│   ├── requirements.txt
│   └── pyproject.toml
│
├── html/                    # Static HTML previews
│   └── design-system-preview.html  # Design system showcase (standalone)
│
├── docs/                    # Documentation
│   ├── business-plans/
│   └── technical/
│
├── CLAUDE.md
└── README.md
```

## Architecture

### Backend (backend/)
- **FastAPI Server** (`main.py`): REST endpoints for upsert, chat, search, document management
- **MCP Server** (`mcp_server.py`): Model Context Protocol integration for Claude Desktop
- **Business Logic** (`personal_brain_mcp/services.py`): File parsing (PDF, OCR, audio), vector ops, LLM integration, RAG chain

### Frontend (root)
- Next.js 14 App Router with TailwindCSS
- Pages: Landing (design showcase), Brain (memory dashboard), Architecture, Demo
- Components organized by feature area

### External Services
- **Pinecone**: Vector database for semantic search
- **Google Gemini API**: Embeddings and chat
- **Anthropic Claude API**: Optional LLM provider
- **LangChain**: Abstraction layer for LLM orchestration

## Development Commands

```bash
# Frontend (from repo root)
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Required Environment Variables (backend/.env)
- `GOOGLE_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `ANTHROPIC_API_KEY` (optional)

## Design System

Always read `design-system.ts` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match the design system.

Key rules:
- **Monochrome + amber only.** No blue, green, or purple accents. Amber (#b45309) is the ONLY color.
- **Instrument Serif for display headings.** Geist for body. Geist Mono for data/code.
- **Links are black + underline, editorial-style.** Amber on hover. Never blue.
- **Primary buttons are black.** Amber buttons are reserved for memory-specific actions only.
- **Warm stone neutrals.** Not cold corporate grays. Tailwind stone scale.

## API Endpoints

### Core: `POST /upsert`, `POST /chat`, `POST /chat/enhanced`, `POST /archive/chat`
### Search: `GET /search`, `GET /search/documents`, `GET /documents`, `GET /documents/{id}`
### Chat Management: `POST /import/chat`, `POST /chats/save`, `POST /chats/retrieve`, `GET /chats`, `DELETE /chats/{id}`

## Development Notes

- The `personal_brain_mcp/` package uses relative imports
- Document chunks: 1000 char size, 100 char overlap
- MCP server logs to `mcp_server.log` to avoid stdout conflicts
- Chat export parsers support Claude JSON, ChatGPT JSON, and plain text formats
