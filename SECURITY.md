# Security and data handling

## Deployment boundary

The current REST API has **no authentication** and broad CORS configuration. The documented
command binds to `127.0.0.1`. Add authentication, authorization, appropriate CORS restrictions,
and upload limits before exposing it beyond your own machine. The MCP entry point uses stdio
and relies on the MCP client and local machine access controls.

## Data flow

Documents and saved conversations are processed into chunks. Content goes to Google for
embeddings and Pinecone for storage and search. Answer generation can send retrieved passages
to Google or optional Anthropic services. Audio transcription uses Google's speech service.
Running the server locally does not make the workflow fully offline.

Credentials load from environment variables or `.env`. MCP logs can contain error details;
review them before sharing. Use synthetic documents and a separate index for tests. Do not
commit real chat exports, uploaded content, API keys, or logs.

## Report a vulnerability

Use GitHub's private **Report a vulnerability** option in the Security tab if available.
Otherwise request a private channel using a contact method on the
[maintainer's profile](https://github.com/anudeepadi), without posting exploit details or
secrets. Include the version, affected entry point, minimal reproduction, and impact.
The latest preview is maintained on a best-effort basis; no response-time SLA is promised.
