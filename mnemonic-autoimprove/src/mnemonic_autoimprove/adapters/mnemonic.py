"""Adapter for the Mnemonic Personal Brain MCP backend.

Creates parallel LangChain pipelines for evaluation without
mutating the production services.
"""

from __future__ import annotations

import logging
import os

from mnemonic_autoimprove.adapters.base import RAGSystemAdapter
from mnemonic_autoimprove.models.config import RAGConfig

logger = logging.getLogger(__name__)


class MnemonicAdapter(RAGSystemAdapter):
    """Wraps the Mnemonic server's RAG pipeline for AutoImprove evaluation.

    Creates independent LangChain components (vectorstore, LLM, retriever)
    based on the given RAGConfig. Never mutates the production pipeline.
    """

    def __init__(
        self,
        pinecone_api_key: str | None = None,
        pinecone_index_name: str | None = None,
        google_api_key: str | None = None,
    ) -> None:
        self._pinecone_api_key = pinecone_api_key or os.environ.get("PINECONE_API_KEY", "")
        self._pinecone_index_name = pinecone_index_name or os.environ.get("PINECONE_INDEX_NAME", "")
        self._google_api_key = google_api_key or os.environ.get("GOOGLE_API_KEY", "")
        self._config = RAGConfig()
        self._vectorstore = None
        self._llm = None

    async def apply_config(self, config: RAGConfig) -> None:
        """Create new LangChain components from config (never mutate originals)."""
        self._config = config
        # Re-initialize components with new config
        self._vectorstore = None
        self._llm = None

    def _ensure_vectorstore(self):
        """Lazy-init vectorstore from current config."""
        if self._vectorstore is None:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            from langchain_pinecone import PineconeVectorStore

            embeddings = GoogleGenerativeAIEmbeddings(
                model=self._config.embedding_model,
                google_api_key=self._google_api_key,
                task_type="RETRIEVAL_DOCUMENT",
            )
            self._vectorstore = PineconeVectorStore.from_existing_index(
                index_name=self._pinecone_index_name,
                embedding=embeddings,
            )
        return self._vectorstore

    def _ensure_llm(self):
        """Lazy-init LLM from current config."""
        if self._llm is None:
            from langchain_google_genai import ChatGoogleGenerativeAI

            self._llm = ChatGoogleGenerativeAI(
                model=self._config.llm_model,
                google_api_key=self._google_api_key,
                temperature=self._config.temperature,
            )
        return self._llm

    async def query(self, question: str) -> tuple[str, list[str]]:
        """Run a RAG query with the current config, return answer + contexts."""
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.runnables import RunnablePassthrough

        vectorstore = self._ensure_vectorstore()
        llm = self._ensure_llm()

        retriever = vectorstore.as_retriever(
            search_type=self._config.search_type,
            search_kwargs={
                "k": self._config.retrieval_k,
                "filter": {"type": "document"},
            },
        )

        docs = await retriever.ainvoke(question)
        contexts = [doc.page_content for doc in docs]
        context_text = "\n\n".join(
            f"[{i+1}] {c}" for i, c in enumerate(contexts)
        )

        prompt = ChatPromptTemplate.from_template(self._config.system_prompt_template)
        chain = prompt | llm | StrOutputParser()
        answer = await chain.ainvoke({"context": context_text, "question": question})

        return answer, contexts

    async def get_current_config(self) -> RAGConfig:
        return self._config

    async def health_check(self) -> bool:
        """Check that Pinecone and Google API keys are configured."""
        if not self._pinecone_api_key:
            logger.warning("PINECONE_API_KEY not set")
            return False
        if not self._google_api_key:
            logger.warning("GOOGLE_API_KEY not set")
            return False
        if not self._pinecone_index_name:
            logger.warning("PINECONE_INDEX_NAME not set")
            return False
        return True
