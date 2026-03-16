# Mnemonic — AI Memory Infrastructure

**Live demo → [client-nu-brown-49.vercel.app](https://client-nu-brown-49.vercel.app)**

Mnemonic is an AI memory platform with a dual-process architecture inspired by human sleep consolidation. Fast, non-blocking writes at runtime. Intelligent graph consolidation offline. The result: an agent that actually remembers — without latency spikes, stale recalls, or silent failures.

---

## The Problem With Current Memory Systems

| Failure | What Happens |
|---|---|
| **Stale recall** | Vector DBs return outdated facts at equal scores — no temporal ordering |
| **Latency spike** | Synchronous entity extraction blocks the agent, adding +847ms per message |
| **Silent failure** | Agents never self-initiate memory saves — 0% effective recall rate in practice |

---

## How Mnemonic Works

```
User message
     │
     ▼ <10ms — no LLM call
┌─────────────────┐
│  Event Stream   │  ← Append-only log, immutable, timestamped
│  (Episodic)     │
└────────┬────────┘
         │  async, offline
         ▼
┌─────────────────┐
│  Sleep          │  ← Entity extraction, contradiction resolution,
│  Consolidator   │    temporal graph updates (valid_until edges)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Knowledge      │  ← Bitemporal graph — old facts preserved,
│  Graph          │    not overwritten
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Compiled       │  ← Markdown summary injected into system prompt
│  Memory         │    0ms retrieval, always current
└─────────────────┘
```

**Three-tier memory model:**

| Tier | Name | Write Latency | Read Path |
|------|------|---------------|-----------|
| 1 | Episodic | `<10ms` | Recent N events |
| 2 | Semantic | Async | Semantic search |
| 3 | Identity | Async | Direct lookup |

---

## What's Built

### Frontend — `client/`
Next.js 16 · TailwindCSS 4 · Framer Motion · Recharts · `react-resizable-panels`

- **Landing page** — problem framing, architecture walkthrough, competitive comparison
- **Dashboard** — resizable 2-panel layout: chat interface + memory widgets / live graph
- **Demo** — interactive "Moving Problem" simulation (3 competitors, 5 contradiction facts)
- **Architecture** — Three-tier memory model, five-layer stack, MCP protocol reference, roadmap

### Backend — `server/`
FastAPI · Python 3.12 · Pinecone · LangChain · Google Gemini · Anthropic Claude · FastMCP

- **15 REST endpoints** — upsert, chat, search, archive, document management
- **MCP server** — 10 tools + 5 resources for Claude Desktop via stdio transport
- **RAG pipeline** — document parsing (PDF, OCR, audio), semantic search, citation-aware generation

### mnemonic-autoimprove — `mnemonic-autoimprove/`
Standalone pip package. Autonomously optimizes RAG retrieval quality overnight.

Inspired by Karpathy's autoresearch — runs a modify → evaluate → keep/discard loop on RAG parameters (retrieval k, temperature, prompt templates, search strategy) using RAGAS metrics via Gemini Flash as judge.

- **~$0.08/experiment**, ~$0.30/night, ~$9/month
- 15 predefined experiments across retrieval, temperature, and prompt dimensions
- Immutable config versioning — safe rollback to any previous version
- OpenClaw / Claude heartbeat integration for automated overnight runs
- **85 unit tests, all passing**

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TailwindCSS 4, Framer Motion |
| Backend | FastAPI, Python 3.12, Pydantic V2 |
| AI / LLM | Google Gemini (embeddings + chat), Anthropic Claude |
| Vector DB | Pinecone (→ Qdrant for self-hosted) |
| Orchestration | LangChain |
| MCP | FastMCP (stdio transport for Claude Desktop) |
| Evaluation | RAGAS metrics, Gemini Flash judge |

---

## Running Locally

### Frontend
```bash
cd client
npm install
npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd server
pip install -r requirements.txt

# Create server/.env:
GOOGLE_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
ANTHROPIC_API_KEY=...  # optional

uvicorn main:app --reload
# → http://localhost:8000
```

### MCP Server (Claude Desktop)
```bash
pip install personal-brain-mcp
```

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "mnemonic": {
      "command": "personal-brain-mcp"
    }
  }
}
```

### RAG Optimizer
```bash
cd mnemonic-autoimprove
pip install -e .
python -m mnemonic_autoimprove status
python -m mnemonic_autoimprove run --golden-set golden_sets/example_golden_set.json
```

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  L5: Applications                                │
│      Web Dashboard · Claude Desktop MCP · SDK   │
├──────────────────────────────────────────────────┤
│  L4: API Gateway                                 │
│      FastAPI · Auth · Rate Limiting              │
├──────────────────────────────────────────────────┤
│  L3: Memory Engine                               │
│      Episodic · Semantic · Identity              │
├──────────────────────────────────────────────────┤
│  L2: Processing                                  │
│      Parser · Embeddings · Consolidator · Diff   │
├──────────────────────────────────────────────────┤
│  L1: Storage                                     │
│      Pinecone · PostgreSQL · Neo4j · Redis       │
└──────────────────────────────────────────────────┘
```

---

## Roadmap

- [x] Phase 0 — Foundation: frontend, MCP server, RAG pipeline, design system, autoimprove
- [ ] Phase 1 — Wire + Auth: PostgreSQL, JWT, connect frontend to backend
- [ ] Phase 2 — Memory Engine: three-tier model, async consolidation, Neo4j graph
- [ ] Phase 3 — Platform: multi-user, analytics, SDK, billing

---

## License

MIT
