"""LLM-as-judge implementations for RAG evaluation metrics."""

from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


# --- Prompt templates for each metric ---

FAITHFULNESS_PROMPT = """You are evaluating the faithfulness of an AI-generated answer.
Faithfulness measures whether the answer is grounded in the provided context (no hallucination).

Question: {question}

Context:
{context}

Answer: {answer}

Instructions:
1. Extract each factual claim from the answer.
2. For each claim, check if it can be inferred from the context.
3. Calculate the ratio of supported claims to total claims.

Respond with ONLY a JSON object:
{{"supported_claims": <int>, "total_claims": <int>, "score": <float 0.0-1.0>}}"""

ANSWER_RELEVANCY_PROMPT = """You are evaluating the relevancy of an AI-generated answer.
Answer relevancy measures how well the answer addresses the original question.

Question: {question}

Answer: {answer}

Instructions:
1. Does the answer directly address what was asked?
2. Is the answer complete, or does it miss key aspects?
3. Does the answer contain unnecessary or off-topic information?

Respond with ONLY a JSON object:
{{"addresses_question": <bool>, "completeness": <float 0.0-1.0>, "score": <float 0.0-1.0>}}"""

CONTEXT_PRECISION_PROMPT = """You are evaluating context precision for a RAG system.
Context precision measures the proportion of retrieved contexts that are relevant.

Question: {question}

Retrieved Contexts:
{contexts}

Instructions:
1. For each context, determine if it contains information relevant to answering the question.
2. Count relevant vs total contexts.

Respond with ONLY a JSON object:
{{"relevant_count": <int>, "total_count": <int>, "score": <float 0.0-1.0>}}"""

CONTEXT_RECALL_PROMPT = """You are evaluating context recall for a RAG system.
Context recall measures whether the retrieved contexts cover the expected answer.

Question: {question}

Expected Answer: {expected_answer}

Retrieved Contexts:
{contexts}

Instructions:
1. Break the expected answer into key facts.
2. Check which facts are present in the retrieved contexts.
3. Calculate the ratio of covered facts to total facts.

Respond with ONLY a JSON object:
{{"covered_facts": <int>, "total_facts": <int>, "score": <float 0.0-1.0>}}"""


class BaseLLMJudge(ABC):
    """Abstract base for LLM-as-judge implementations."""

    @abstractmethod
    async def judge_faithfulness(
        self, question: str, answer: str, contexts: list[str]
    ) -> float:
        """Score 0-1: Is the answer grounded in the contexts?"""

    @abstractmethod
    async def judge_answer_relevancy(
        self, question: str, answer: str
    ) -> float:
        """Score 0-1: How relevant is the answer to the question?"""

    @abstractmethod
    async def judge_context_precision(
        self, question: str, contexts: list[str]
    ) -> float:
        """Score 0-1: Are relevant contexts ranked higher?"""

    @abstractmethod
    async def judge_context_recall(
        self, question: str, contexts: list[str], expected_answer: str
    ) -> float:
        """Score 0-1: Are all relevant contexts retrieved?"""


class GeminiFlashJudge(BaseLLMJudge):
    """Uses Gemini Flash for LLM-as-judge evaluation (~$0.0003/eval).

    Sends structured prompts and parses JSON responses.
    """

    def __init__(self, api_key: str, model: str = "gemini-1.5-flash") -> None:
        self._api_key = api_key
        self._model = model
        self._llm = None

    def _get_llm(self):
        """Lazy-init the LLM client."""
        if self._llm is None:
            from langchain_google_genai import ChatGoogleGenerativeAI
            self._llm = ChatGoogleGenerativeAI(
                model=self._model,
                google_api_key=self._api_key,
                temperature=0.0,
            )
        return self._llm

    async def _invoke(self, prompt: str) -> dict:
        """Send prompt to LLM and parse JSON response."""
        llm = self._get_llm()
        response = await llm.ainvoke(prompt)
        text = response.content.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(
                line for line in lines
                if not line.startswith("```")
            ).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.warning("Failed to parse judge response: %s", text[:200])
            return {"score": 0.5}

    async def judge_faithfulness(
        self, question: str, answer: str, contexts: list[str]
    ) -> float:
        context_text = "\n---\n".join(f"[{i+1}] {c}" for i, c in enumerate(contexts))
        prompt = FAITHFULNESS_PROMPT.format(
            question=question, context=context_text, answer=answer
        )
        result = await self._invoke(prompt)
        return _clamp(result.get("score", 0.5))

    async def judge_answer_relevancy(
        self, question: str, answer: str
    ) -> float:
        prompt = ANSWER_RELEVANCY_PROMPT.format(question=question, answer=answer)
        result = await self._invoke(prompt)
        return _clamp(result.get("score", 0.5))

    async def judge_context_precision(
        self, question: str, contexts: list[str]
    ) -> float:
        context_text = "\n---\n".join(f"[{i+1}] {c}" for i, c in enumerate(contexts))
        prompt = CONTEXT_PRECISION_PROMPT.format(
            question=question, contexts=context_text
        )
        result = await self._invoke(prompt)
        return _clamp(result.get("score", 0.5))

    async def judge_context_recall(
        self, question: str, contexts: list[str], expected_answer: str
    ) -> float:
        context_text = "\n---\n".join(f"[{i+1}] {c}" for i, c in enumerate(contexts))
        prompt = CONTEXT_RECALL_PROMPT.format(
            question=question, contexts=context_text, expected_answer=expected_answer
        )
        result = await self._invoke(prompt)
        return _clamp(result.get("score", 0.5))


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    """Clamp a value between low and high."""
    return max(low, min(high, float(value)))
