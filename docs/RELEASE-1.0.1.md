# ContextOS 1.0.1 — identity and open-source packaging

ContextOS is the project identity for `personal-brain-mcp`: an MCP server and REST API
for document retrieval and explicit conversation memory. Existing package, executable,
import names, and MCP server identity remain compatible.

## Included

- Original light/dark banners, bracket mark, workflow and architecture graphics, social preview,
  and reproducible SVG sources.
- A rewritten README, setup and tool guides, contributor and security policies, issue forms,
  a roadmap, and portable example configuration.
- Root MIT license with original attribution, modern package metadata, and a uv lockfile.
- Corrected text-splitter import, multipart upload dependency, Python 3.13 audio compatibility,
  and a compatible MCP v1 dependency bound.
- Removal of generated distributions and egg metadata from source tracking. Installable
  wheel and source archive are provided as release assets.
- Offline startup and API schema tests, a real stdio MCP handshake/tool-list test, and
  repository documentation checks.

## Validation and limits

Six tests pass, including a client/server stdio handshake using placeholder credentials.
The handshake needs ordinary subprocess permissions and timed out in the restricted agent
sandbox; it passed outside it. Package builds, current-guide links, example JSON, declared
tool counts, and graphic accessibility metadata validate. Artwork was rendered and inspected.

No live Google, Pinecone, Anthropic, OCR, or audio processing result is claimed. Legacy model
identifiers need provider validation, and the REST API remains unauthenticated. The project
is a preview, not a production-readiness claim.

Hosted CI is not activated: the publishing credential lacks GitHub's `workflow` scope.
The ready-to-enable configuration is in `docs/ci.yml.example`.
