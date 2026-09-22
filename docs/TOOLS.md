# MCP tools and resources

The maintained server declares **10 tools** and **5 resources/templates** in
`personal_brain_mcp/server.py`.

| Tool | Purpose |
|---|---|
| `search_documents` | Semantic search, optionally filtered by content type or filename |
| `search_chat_history` | Search archived conversations by query, tool, or tags |
| `get_document_details` | Read document metadata and chunks by ID |
| `list_all_documents` | Browse stored documents with pagination |
| `ask_with_citations` | Generate an answer with retrieved references |
| `save_chat` | Save an explicitly supplied conversation |
| `retrieve_saved_chats` | Retrieve saved conversations by criteria |
| `list_saved_chats` | List saved conversations |
| `import_chat_export` | Import a supported chat export |
| `process_chat_command` | Handle supported save/retrieve command text |

Use your MCP client's tool schema for exact argument types and defaults. Document uploads
use the REST `/upsert` endpoint; the MCP package does not expose a file-upload tool.

| Resource URI | Purpose |
|---|---|
| `documents://list` | Document list |
| `documents://{document_id}` | Document details |
| `search://documents/{query}` | Search results |
| `chats://saved` | Saved conversation list |
| `chats://{chat_id}` | One saved conversation |

Tool errors may be returned as structured error content. A successful MCP connection
or tool listing does not establish provider readiness. Knowledge-graph and hybrid graph
search tools described in older notes are not registered by this implementation.
