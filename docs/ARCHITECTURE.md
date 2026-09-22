# ContextOS architecture

ContextOS has two server entry points: an installable stdio MCP server and a FastAPI
application run from source. They currently use separate copies of the service layer;
consolidating those implementations is a roadmap item.

![Interfaces and service flow](assets/architecture.svg)

## Entry points

- `personal_brain_mcp/server.py`: FastMCP tools and resources; launched by `personal-brain-mcp`.
- `main.py`: REST API, OpenAPI schema, and the connected `frontend/` static UI.
- `frontend-next/`: standalone UI prototype, not a working replacement for the connected UI.

## Storage and inference

Parsing extracts text. Recursive splitting produces chunks. Google embeddings turn
chunks and queries into vectors; Pinecone stores and retrieves them with metadata.
Gemini or optional Anthropic generation combines retrieved passages with a question.
Chat saving and importing format conversations for storage and later retrieval.

![Capture, index, retrieve, use](assets/workflow.svg)

There is no implemented graph database or NetworkX retrieval path in the maintained
package. References are identifiers and excerpts returned with results, not a verification
that generated prose is entailed by those sources.

## Boundaries

API keys load from environment variables or `.env`. Provider service initialization is
lazy, but settings are validated at import time. Startup requires configured values;
it does not establish that credentials work or provider models are available.

The app runs locally, while embeddings, vector storage, generation, and audio transcription
can send data to external services. The API currently lacks authentication and has broad
CORS settings. See [security guidance](../SECURITY.md).

The project includes historical packaging copies under `npm-package/` and
`personal-brain-mcp/`. They are preserved for reference; builds and installation guidance
use the root Python project.
