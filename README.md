<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/hero-light.svg">
    <img src="docs/assets/hero-light.svg" alt="ContextOS — your context, within reach. Save the conversation. Find the source." width="100%">
  </picture>
</p>

<p align="center"><strong>Document retrieval and conversation memory for your AI workflows.</strong><br>MCP for assistants. REST for applications. Your saved knowledge, ready to retrieve.</p>

<p align="center">
  <a href="#try-the-local-walkthrough">Offline walkthrough</a> ·
  <a href="#quickstart">Provider quickstart</a> ·
  <a href="docs/SETUP.md">Setup guide</a> ·
  <a href="docs/TOOLS.md">MCP tools</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-16234c?style=flat-square" alt="MIT license"></a>
  <a href="pyproject.toml"><img src="https://img.shields.io/badge/python-3.11%2B-16234c?style=flat-square" alt="Python 3.11 or later"></a>
  <a href="docs/TOOLS.md"><img src="https://img.shields.io/badge/interface-MCP_%2B_REST-4859f5?style=flat-square" alt="MCP and REST interfaces"></a>
  <a href="ROADMAP.md"><img src="https://img.shields.io/badge/status-preview-4859f5?style=flat-square" alt="Preview project"></a>
</p>

---

Important context is spread across documents and conversations. **ContextOS gives that material a retrieval layer.** Upload a file, save a discussion, or import a chat export. Search the stored passages and ask questions with document references through an MCP client or the REST API.

**ContextOS is the project identity.** The GitHub repository, Python distribution, and executable retain the name `personal-brain-mcp` for compatibility. It is an MCP server plus a FastAPI application; it is not an operating system or an automatic recorder of every conversation.

## Choose your entry point

| You want to… | Start here |
|---|---|
| Try retrieval and chat recall without provider accounts | [Offline walkthrough](#try-the-local-walkthrough) |
| Give an MCP-compatible assistant access to saved knowledge | [MCP setup](docs/SETUP.md#mcp-client-configuration) |
| Upload documents and query them over HTTP | [REST quickstart](#run-the-api-and-connected-ui) |
| Understand the storage and provider boundaries | [Architecture](docs/ARCHITECTURE.md) |
| Work on the project | [Contributor guide](CONTRIBUTING.md) |

<p align="center"><img src="docs/assets/architecture.svg" alt="MCP clients and the REST API access parsing, embedding, Pinecone storage, and search." width="100%"></p>

## Try the local walkthrough

The verified local example uses **Python 3.12** and the repository lockfile. It needs no provider accounts or private documents. The project's declared Python range is 3.11 or later; the audio compatibility dependency for Python 3.13+ comes from the current package metadata.

```bash
git clone https://github.com/anudeepadi/personal-brain-mcp.git
cd personal-brain-mcp
uv sync --locked --python 3.12
uv run --locked python examples/offline_walkthrough.py
```

The walkthrough exercises the **actual service functions** for chunking, metadata, source references, chat serialization, and recall. A temporary in-memory adapter ranks word overlap in invented notes; embeddings and Pinecone are replaced, no LLM is called, and outbound sockets are blocked. This is an integration fixture, not offline semantic search or a measured provider benchmark.

![Captured terminal transcript of the offline synthetic walkthrough](examples/offline-transcript.svg)

See the [complete captured run](examples/offline-output.txt) and [runnable source](examples/offline_walkthrough.py). The image renders that terminal output; it is not a screenshot of a deployed UI. To exercise the separate HTTP service implementation with the same assertions, run `uv run --locked python examples/offline_walkthrough.py --entry http`.

The [dependency snapshot](docs/tested-constraints.txt) records the Python 3.12 environment used on 22 September 2026. The maintained installation resolves from `uv.lock`; the snapshot does not override it. These checks verify installation and local service behavior, not current provider models or production readiness.

## Quickstart

Requires **Python 3.11+**, [uv](https://docs.astral.sh/uv/getting-started/installation/), a Google API key, and a Pinecone index and key. Anthropic is optional. The application runs on your machine; embeddings, storage, and model inference use external providers.

```bash
git clone https://github.com/anudeepadi/personal-brain-mcp.git
cd personal-brain-mcp
uv sync
cp .env.example .env
```

Set the three required values in `.env`:

```dotenv
GOOGLE_API_KEY=your-google-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=your-index-name
```

The index must match the embedding model's dimensions. Model identifiers are configured in the service code and need live provider validation before an end-to-end run; see [setup and current limits](docs/SETUP.md).

### Run the MCP server

```bash
uv run personal-brain-mcp
```

This starts a **stdio MCP server**, intended to be launched by an MCP client. It is not an interactive chat shell. Use the [portable client configuration example](examples/claude_desktop_config.json), replacing its absolute paths with your own checkout and `uv` locations.

### Run the API and connected UI

From the repository root:

```bash
uv run uvicorn main:app --host 127.0.0.1 --port 8000
```

Open **http://127.0.0.1:8000** for the connected static UI, or **http://127.0.0.1:8000/docs** for the API schema. The separate `frontend-next/` directory is a UI prototype; its controls are not wired to this API.

```bash
curl -F 'file=@examples/notes.txt' http://127.0.0.1:8000/upsert
curl --get --data-urlencode 'q=architecture decisions' \
  http://127.0.0.1:8000/search/documents
```

The API currently has no authentication and allows broad CORS. Bind it to localhost; add access controls before hosting it for others. See [security and data handling](SECURITY.md).

## What ContextOS does

<p align="center"><img src="docs/assets/workflow.svg" alt="Capture documents and chats, embed their text, retrieve passages, then use the results through MCP or REST." width="100%"></p>

| Capability | Implementation |
|---|---|
| **Document retrieval** | Chunked text, Google embeddings, and Pinecone similarity search with metadata filters. |
| **Conversation memory** | Explicitly save, list, retrieve, and search chats with tags. The current save path does not persist the supplied title. |
| **Chat import** | Parsers for supported Claude and ChatGPT JSON shapes and role-labeled text. Export formats can change. |
| **Source references** | Search results and enhanced answers include document identifiers, excerpts, and chunk references. |
| **File processing** | Text and PDF extraction; image OCR with Tesseract; audio transcription with additional system dependencies. |
| **Two interfaces** | Ten MCP tools, two fixed resources, and three resource templates, plus REST endpoints and a connected static UI. |

Reference metadata helps you inspect an answer's sources; it does not establish that every generated statement is correct. Saving conversations is explicit, not automatic background memory.

## MCP tools at a glance

| Task | Tools |
|---|---|
| Find documents | `search_documents`, `get_document_details`, `list_all_documents` |
| Ask about stored material | `ask_with_citations` |
| Keep and retrieve conversations | `save_chat`, `search_chat_history`, `retrieve_saved_chats`, `list_saved_chats` |
| Import and organize | `import_chat_export`, `process_chat_command` |

[Tool and resource reference →](docs/TOOLS.md)

## Built to extend

```text
personal_brain_mcp/   Installable MCP server, models, settings, and services
main.py              FastAPI application (run from the source checkout)
services.py          REST service implementation
frontend/            Static UI connected to the API
frontend-next/       Separate Next.js UI prototype
examples/            Offline walkthrough, portable MCP config, and sample document
scripts/             Offline repository validation and original artwork generator
docs/                Setup, architecture, tools, status, and brand assets
```

Older `npm-package/` and nested `personal-brain-mcp/` trees are historical packaging attempts. The root `pyproject.toml` is the maintained build entry point. This update ships GitHub distributions; it does not claim a new PyPI or npm publication.

## Current status

ContextOS is a **preview**. Live provider compatibility, ingestion quality, and retrieval quality need further validation. Knowledge-graph search, local embeddings, automatic sync, and multi-user authentication are roadmap items, not current capabilities.

The two current service copies use the modern LangChain splitter import and `ainvoke` retriever method; both are exercised by the local walkthrough.

- Returned relevance scores currently contain a fixed `0.85` placeholder; they are not calibrated similarities or confidence measurements.
- The chat save path does not persist its supplied title; recall falls back to a generated title. Long conversations may be represented by a retrieved chunk rather than a complete reconstruction.
- Document listing uses a retrieval window rather than a full index scan. Filename/tag regular-expression filters and provider initialization across all entry paths need live validation.
- The walkthrough does not verify MCP transport, OCR/audio, provider embeddings, Pinecone, or generated answers. The separate startup tests exercise MCP initialization and tool listing, without invoking providers.

The old setup reports and architecture diagrams at the repository root are historical notes. Use the linked `docs/` guides for the current supported entry points and known limitations.

- [Setup and configuration](docs/SETUP.md)
- [Architecture and data flow](docs/ARCHITECTURE.md)
- [Known limitations and roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)
- [Security](SECURITY.md) · [Brand assets](docs/BRAND.md)

## License

[MIT](LICENSE). Original license attribution is preserved. Maintained by [Anudeep Adiraju](https://github.com/anudeepadi).

<p align="center"><sub>Keep the thread.</sub></p>
