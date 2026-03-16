"""Prompt template experiments — different RAG system prompts."""

from __future__ import annotations

from mnemonic_autoimprove.models.experiment import ExperimentSpec

CONCISE_PROMPT = (
    "Answer the question using the context below. Be concise and direct. "
    "If the context doesn't help, say so.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

STRUCTURED_PROMPT = (
    "You are a knowledge retrieval assistant. Follow these rules:\n"
    "1. ONLY use information from the provided context\n"
    "2. Structure your answer with clear sections if needed\n"
    "3. Quote relevant passages when helpful\n"
    "4. State clearly if the context doesn't contain the answer\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

COT_PROMPT = (
    "You are a careful reasoning assistant. Think step by step:\n"
    "1. Read the context carefully\n"
    "2. Identify which parts are relevant to the question\n"
    "3. Formulate your answer based only on relevant context\n"
    "4. Verify your answer is supported by the context\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

CITATION_FOCUSED_PROMPT = (
    "Answer the question using ONLY the provided context. "
    "For every factual claim, include a citation [1], [2], etc. "
    "referencing which context passage supports it. "
    "If the context doesn't contain the answer, explicitly state that.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

PROMPT_EXPERIMENTS: list[ExperimentSpec] = [
    ExperimentSpec(
        name="concise_prompt",
        description="Shorter, more direct system prompt for faster responses",
        parameter_changes={"system_prompt_template": CONCISE_PROMPT},
        category="prompt",
    ),
    ExperimentSpec(
        name="structured_prompt",
        description="Structured output with rules and quoting",
        parameter_changes={"system_prompt_template": STRUCTURED_PROMPT},
        category="prompt",
    ),
    ExperimentSpec(
        name="cot_prompt",
        description="Chain-of-thought reasoning before answering",
        parameter_changes={"system_prompt_template": COT_PROMPT},
        category="prompt",
    ),
    ExperimentSpec(
        name="citation_focused_prompt",
        description="Emphasize citations for every claim",
        parameter_changes={"system_prompt_template": CITATION_FOCUSED_PROMPT},
        category="prompt",
    ),
]
