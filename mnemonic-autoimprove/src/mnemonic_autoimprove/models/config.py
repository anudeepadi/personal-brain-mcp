from __future__ import annotations
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field

class RAGConfig(BaseModel):
    """Immutable snapshot of all tunable RAG parameters.

    Use evolve() to create a new version with changes.
    Never mutate in place.
    """
    model_config = ConfigDict(frozen=True)

    # Versioning
    version: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    parent_version: int | None = None

    # Chunking
    chunk_size: int = 1000
    chunk_overlap: int = 100

    # Retrieval
    retrieval_k: int = 5
    search_type: str = "similarity"  # "similarity" | "mmr"
    reranking_enabled: bool = False
    reranking_model: str | None = None

    # LLM
    llm_model: str = "gemini-1.5-flash"
    temperature: float = 0.3

    # Embedding
    embedding_model: str = "models/embedding-001"

    # Prompts
    system_prompt_template: str = (
        "You are a helpful AI assistant with access to a personal knowledge base. "
        "Use the following context to answer the question. If the context doesn't "
        "contain relevant information, say so.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}"
    )
    citation_prompt_template: str = (
        "You are a helpful AI assistant. Answer the question using ONLY the provided context. "
        "Include citations using [1], [2], etc. for each piece of information.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}"
    )

    def evolve(self, **changes: object) -> RAGConfig:
        """Create a new config version with the specified changes.

        Automatically increments version and sets parent_version.
        """
        return self.model_copy(update={
            **changes,
            "version": self.version + 1,
            "parent_version": self.version,
            "created_at": datetime.now(timezone.utc),
        })

    def diff(self, other: RAGConfig) -> dict[str, tuple[object, object]]:
        """Return fields that differ between two configs as {field: (self_val, other_val)}."""
        result: dict[str, tuple[object, object]] = {}
        for field_name in type(self).model_fields:
            if field_name in ("version", "created_at", "parent_version"):
                continue
            self_val = getattr(self, field_name)
            other_val = getattr(other, field_name)
            if self_val != other_val:
                result[field_name] = (self_val, other_val)
        return result
