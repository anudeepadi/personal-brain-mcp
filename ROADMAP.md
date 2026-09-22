# ContextOS roadmap

## Implemented surfaces

- Ten MCP tools and five resource/template declarations.
- Document and chat retrieval, explicit chat saving and import, reference-bearing answers.
- FastAPI routes and an API-connected static UI.
- Separate Next.js UI prototype.

## Next validation work

- Validate current provider model identifiers and Pinecone index compatibility.
- Run a real upload → search → answer workflow with a synthetic corpus.
- Test chat import against representative current export formats.
- Evaluate OCR, audio, retrieval quality, citation relevance, and failure handling.
- Review ingestion duplication: `/upsert` currently invokes both basic and enhanced storage.

## Engineering priorities

- Consolidate the duplicated REST and MCP services into one implementation.
- Make model selection configurable and document embedding migrations.
- Add authentication, authorization, upload limits, and deployment-specific CORS.
- Connect or retire the separate Next.js prototype and consolidate historical packaging copies.
- Expand regression and retrieval-quality tests.

## Future exploration

Local embeddings, automatic source sync, multi-user isolation, and knowledge-graph retrieval
are candidates for future work. They are not capabilities of this release. There are no
announced delivery dates or measured quality claims.
