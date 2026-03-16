"""Abstract interface for RAG systems that AutoImprove can optimize."""

from __future__ import annotations

from abc import ABC, abstractmethod

from mnemonic_autoimprove.models.config import RAGConfig


class RAGSystemAdapter(ABC):
    """Abstract interface for any RAG system that AutoImprove can evaluate.

    Implement this to connect AutoImprove to your RAG pipeline.
    The adapter must be able to:
    - Apply a config (create a new pipeline with those params)
    - Run a query and return answer + retrieved contexts
    - Report its current config
    - Verify it's healthy
    """

    @abstractmethod
    async def apply_config(self, config: RAGConfig) -> None:
        """Apply a RAG config to the system.

        Creates a new pipeline with the given parameters.
        Must NOT mutate any existing pipeline state.
        """

    @abstractmethod
    async def query(self, question: str) -> tuple[str, list[str]]:
        """Run a query, return (answer, retrieved_contexts).

        The answer is the generated response text.
        The contexts are the text passages that were retrieved.
        """

    @abstractmethod
    async def get_current_config(self) -> RAGConfig:
        """Return the current active RAG configuration."""

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify the system is ready for experiments.

        Returns True if healthy, False otherwise.
        """
