"""Shared test fixtures for mnemonic-autoimprove."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from mnemonic_autoimprove.models.config import RAGConfig
from mnemonic_autoimprove.models.experiment import ExperimentResult, ExperimentSpec
from mnemonic_autoimprove.models.golden_set import GoldenTestCase, GoldenTestSet
from mnemonic_autoimprove.models.metrics import RAGMetrics


@pytest.fixture()
def baseline_config() -> RAGConfig:
    return RAGConfig()


@pytest.fixture()
def sample_metrics() -> RAGMetrics:
    return RAGMetrics(
        faithfulness=0.85,
        answer_relevancy=0.78,
        context_precision=0.72,
        context_recall=0.68,
        sample_size=12,
    )


@pytest.fixture()
def better_metrics() -> RAGMetrics:
    return RAGMetrics(
        faithfulness=0.90,
        answer_relevancy=0.82,
        context_precision=0.80,
        context_recall=0.75,
        sample_size=12,
    )


@pytest.fixture()
def sample_experiment_spec() -> ExperimentSpec:
    return ExperimentSpec(
        name="retrieval_k_7",
        description="Increase retrieval k from 5 to 7",
        parameter_changes={"retrieval_k": 7},
        category="retrieval",
    )


@pytest.fixture()
def sample_experiment_result(sample_metrics: RAGMetrics, better_metrics: RAGMetrics) -> ExperimentResult:
    return ExperimentResult(
        run_number=1,
        experiment_id="test-exp-001",
        experiment_name="retrieval_k_7",
        baseline_config_version=1,
        candidate_config_version=2,
        baseline_metrics=sample_metrics,
        candidate_metrics=better_metrics,
        improvement=better_metrics.composite_score - sample_metrics.composite_score,
        accepted=True,
        cost_estimate_usd=0.08,
    )


@pytest.fixture()
def sample_golden_case() -> GoldenTestCase:
    return GoldenTestCase(
        case_id="gs-001",
        query="What are the key features of the memory engine?",
        expected_answer="The memory engine provides three-tier memory with episodic, semantic, and identity layers.",
        expected_contexts=[
            "Episodic Memory: Raw events, chat logs, and interactions",
            "Semantic Memory: Consolidated facts and knowledge",
        ],
        difficulty="medium",
        category="architecture",
    )


@pytest.fixture()
def sample_golden_set(sample_golden_case: GoldenTestCase) -> GoldenTestSet:
    cases = [
        sample_golden_case,
        GoldenTestCase(
            case_id="gs-002",
            query="How does document chunking work?",
            expected_answer="Documents are split into 1000-char chunks with 100-char overlap.",
            expected_contexts=["RecursiveCharacterTextSplitter with chunk_size=1000"],
            difficulty="easy",
            category="retrieval",
        ),
        GoldenTestCase(
            case_id="gs-003",
            query="What embedding model is used?",
            expected_answer="Google's embedding-001 model for retrieval documents.",
            expected_contexts=["embedding model: models/embedding-001"],
            difficulty="easy",
            category="retrieval",
        ),
        GoldenTestCase(
            case_id="gs-004",
            query="How does the consolidation engine promote memories?",
            expected_answer="Episodic memories are promoted to semantic every 6 hours via pattern extraction.",
            expected_contexts=[
                "Consolidation engine runs every 6 hours",
                "Promotes episodic to semantic via pattern extraction",
            ],
            difficulty="hard",
            category="architecture",
        ),
    ]
    return GoldenTestSet(
        name="test_set",
        version="1.0.0",
        cases=cases,
    )
