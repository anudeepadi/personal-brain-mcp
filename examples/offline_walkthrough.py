"""Exercise real service functions with synthetic data and a local test adapter.

No embeddings, LLM, Pinecone, HTTP server, or MCP transport are used. Outbound
socket connections are blocked. The adapter ranks exact word overlap and is
not a substitute for testing provider-backed semantic retrieval.
"""

import argparse
import asyncio
import importlib
import os
from pathlib import Path
import re
import socket
import sys
from unittest.mock import patch

# Explicit placeholders prevent accidentally using inherited credentials.
for key in ("GOOGLE_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX_NAME"):
    os.environ[key] = "offline-fixture-unused"
os.environ["ANTHROPIC_API_KEY"] = ""
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def deny_network(*args, **kwargs):
    raise RuntimeError("Network access is disabled in this offline walkthrough")


async def walkthrough(module_name):
    from langchain_core.retrievers import BaseRetriever
    from langchain_core.documents import Document
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    services = importlib.import_module(module_name)
    models = importlib.import_module(module_name.replace("services", "models"))

    class LocalRetriever(BaseRetriever):
        documents: list[Document]
        filters: dict
        count: int

        def _get_relevant_documents(self, query, *, run_manager):
            def matches(doc):
                for key, expected in self.filters.items():
                    if isinstance(expected, dict):
                        # This fixture only needs equality filters. Fail loudly
                        # if an untested filter operator is introduced.
                        if set(expected) != {"$eq"}:
                            raise ValueError(f"Unsupported fixture filter: {expected}")
                        expected = expected["$eq"]
                    if doc.metadata.get(key) != expected:
                        return False
                return True

            terms = set(re.findall(r"\w+", query.lower()))
            candidates = [doc for doc in self.documents if matches(doc)]
            candidates.sort(
                key=lambda doc: len(terms & set(re.findall(r"\w+", doc.page_content.lower()))),
                reverse=True,
            )
            return candidates[:self.count]

    class LocalStore:
        def __init__(self):
            self.documents = []

        async def aadd_documents(self, documents):
            self.documents.extend(documents)

        def as_retriever(self, *, search_kwargs):
            return LocalRetriever(
                documents=self.documents,
                filters=search_kwargs.get("filter", {}),
                count=search_kwargs.get("k", 5),
            )

    # Bypass provider initialization while preserving production chunking,
    # metadata, reference creation, chat serialization, and recall functions.
    services.embeddings = object()
    services.vectorstore = LocalStore()
    services.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    print("ContextX — Organizational Memory")
    print(f"OFFLINE SYNTHETIC WALKTHROUGH | {module_name}")
    print("Storage: temporary in-memory adapter | Ranking: word overlap | Network: blocked")
    print()

    note = "Project Aurora decision: weekly planning happens on Tuesday. Owner: Sam."
    document = await services.process_and_store_enhanced(
        note, "aurora-synthetic.txt", "text/plain", len(note.encode())
    )
    await services.process_and_store_enhanced(
        "Project Beacon decision: the release color is amber.",
        "beacon-synthetic.txt", "text/plain", 50,
    )
    assert document.total_chunks == 1
    print("1. Ingested 2 synthetic project notes through process_and_store_enhanced.")
    results = await services.search_documents_enhanced(
        "Aurora weekly planning", None, None, top_k=1
    )
    assert len(results) == 1 and results[0].document_id == document.document_id
    assert results[0].references[0].filename == "aurora-synthetic.txt"
    print(f"2. Retrieved: {results[0].content}")
    print(f"   Source: {results[0].references[0].filename}, chunk {results[0].references[0].chunk_index}")
    print("   The application's 0.85 relevance value is a placeholder, not a measured score.")

    saved = await services.save_chat_conversation(
        chat_id="synthetic-aurora-001",
        title="Aurora planning",
        messages=[
            models.ChatMessage(role="user", content="When is Aurora planning?"),
            models.ChatMessage(role="assistant", content="Tuesday, according to aurora-synthetic.txt."),
        ],
        tags=["synthetic"],
    )
    recalled = await services.retrieve_chat_conversations(chat_id=saved["chat_id"])
    assert len(recalled) == 1 and recalled[0]["chat_id"] == saved["chat_id"]
    assert "Tuesday" in recalled[0]["preview"]
    assert recalled[0]["tags"] == ["synthetic"]
    print(f"3. Saved and recalled {saved['message_count']} messages by chat ID.")
    print(f"   Preview: {recalled[0]['preview']}")
    print("   Titles are not persisted by the current archive path; recall uses a fallback title.")
    empty = await services.retrieve_chat_conversations(chat_id="does-not-exist")
    assert empty == [], "A missing chat must not return another conversation"
    print("4. A missing chat ID returned no results.")
    print()
    print("PASS: ingest, source references, chat recall, and missing-ID behavior.")
    print("Not tested: provider embeddings, Pinecone, generated answers, OCR/audio, or MCP transport.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--entry", choices=("packaged", "http"), default="packaged")
    args = parser.parse_args()
    module = "personal_brain_mcp.services" if args.entry == "packaged" else "services"
    with patch.object(socket.socket, "connect", deny_network), patch.object(socket.socket, "connect_ex", deny_network):
        asyncio.run(walkthrough(module))
