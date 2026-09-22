# ContextOS setup

The maintained build is the root `pyproject.toml`. Use a fresh Python 3.11+ environment.
The distribution and command remain `personal-brain-mcp`; ContextOS is the display name.

## Source install

```bash
uv sync
cp .env.example .env
```

Required: `GOOGLE_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`.
Optional: `ANTHROPIC_API_KEY`, used for Claude-generated answers.
Settings load `.env` from the working directory. Do not commit credentials.

Pinecone must have an existing index compatible with the embedding output dimensions.
Both service implementations currently name `models/embedding-001`, `gemini-1.5-flash`,
and optional `claude-3-haiku-20240307`. These are legacy defaults, not a guarantee that
those models remain available. Validate the models against your provider account and
update both `services.py` and `personal_brain_mcp/services.py` together if needed.
Changing embeddings may require reindexing existing documents.

## MCP client configuration

Find the absolute path to uv with `command -v uv` (or the equivalent on your OS).
Copy [the configuration example](../examples/claude_desktop_config.json) into your MCP
client's settings, replacing both placeholder paths:

```json
{
  "mcpServers": {
    "contextos": {
      "command": "/absolute/path/to/uv",
      "args": ["--directory", "/absolute/path/to/personal-brain-mcp", "run", "personal-brain-mcp"]
    }
  }
}
```

The directory argument makes `.env` resolution explicit. Restart the client after
editing its configuration. The internal MCP server identity remains `personal-brain`.
The configurable client key `contextos` is just the display label.

The server speaks MCP over stdio and logs separately; it does not offer a browser page
or a question prompt on stdin. Use a client to list and invoke its tools.

## REST and static UI

```bash
uv run uvicorn main:app --host 127.0.0.1 --port 8000
```

The API and static UI run from the checkout or source distribution. The Python wheel
contains the MCP package; root `main.py` and `frontend/` are source-level entry points.
The API has no built-in authentication. Keep it local while evaluating.

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Process health, not a provider readiness check |
| `POST /upsert` | Parse, embed, and store a file |
| `GET /search/documents` | Search uploaded documents |
| `GET /search` | Search archived chat memory |
| `POST /chat/enhanced` | Answer with document references |
| `POST /archive/chat` | Archive a conversation |
| `POST /import/chat` | Import a supported export |
| `POST /chats/save` | Save a chat |
| `POST /chats/retrieve` | Retrieve by criteria |
| `GET /chats` | List saved chats |
| `DELETE /chats/{chat_id}` | Delete a saved chat |

See `/docs` on your local server for request schemas.

## File dependencies

Text/PDF processing uses Python dependencies. Image OCR requires the Tesseract executable.
Audio conversion requires FFmpeg, and transcription calls Google's speech service through
SpeechRecognition. Processing is not fully offline. OCR and audio have not been live-tested
as part of this packaging update.

## Build and verify

```bash
uv sync --extra dev
uv run pytest tests -q
uv run python scripts/check_repository.py
uv build
```

The `tests/` suite uses placeholder credentials and checks startup and protocol surfaces
without external provider calls. Historical root `test_setup.py` and
`test_mcp_startup.py` are manual diagnostics and are not a comprehensive integration suite.

Fresh API keys, a compatible index, and currently supported provider models are needed
for a real upload/search/answer test. Build success alone does not verify retrieval quality.
