"""Generic LangChain adapter for any vectorstore + LLM combo.

Open-source users can subclass this to connect AutoImprove
to their own LangChain RAG pipelines.
"""

from __future__ import annotations

import logging
from typing import Any

from mnemonic_autoimprove.adapters.base import RAGSystemAdapter
from mnemonic_autoimprove.models.config import RAGConfig

logger = logging.getLogger(__name__)


class LangChainGenericAdapter(RAGSystemAdapter):
    """Generic adapter that wraps any LangChain vectorstore + LLM.

    Users provide their own vectorstore and LLM factory functions.
    AutoImprove handles the config management and evaluation.

    Example:
        adapter = LangChainGenericAdapter(
            vectorstore_factory=lambda config: my_pinecone_store,
            llm_factory=lambda config: ChatOpenAI(temperature=config.temperature),
        )
    """

    def __init__(
        self,
        vectorstore_factory: Any = None,
        llm_factory: Any = None,
    ) -> None:
        self._vectorstore_factory = vectorstore_factory
        self._llm_factory = llm_factory
        self._config = RAGConfig()
        self._vectorstore = None
        self._llm = None

    async def apply_config(self, config: RAGConfig) -> None:
        self._config = config
        if self._vectorstore_factory is not None:
            self._vectorstore = self._vectorstore_factory(config)
        if self._llm_factory is not None:
            self._llm = self._llm_factory(config)

    async def query(self, question: str) -> tuple[str, list[str]]:
        if self._vectorstore is None or self._llm is None:
            msg = "Adapter not initialized. Call apply_config() first."
            raise RuntimeError(msg)

        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.prompts import ChatPromptTemplate

        retriever = self._vectorstore.as_retriever(
            search_type=self._config.search_type,
            search_kwargs={"k": self._config.retrieval_k},
        )

        docs = await retriever.ainvoke(question)
        contexts = [doc.page_content for doc in docs]
        context_text = "\n\n".join(
            f"[{i+1}] {c}" for i, c in enumerate(contexts)
        )

        prompt = ChatPromptTemplate.from_template(self._config.system_prompt_template)
        chain = prompt | self._llm | StrOutputParser()
        answer = await chain.ainvoke({"context": context_text, "question": question})

        return answer, contexts

    async def get_current_config(self) -> RAGConfig:
        return self._config

    async def health_check(self) -> bool:
        return self._vectorstore is not None and self._llm is not None
