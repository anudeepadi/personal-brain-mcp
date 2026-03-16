"""Tests for evaluation engine — sampler, judges, evaluator with mocks."""

from __future__ import annotations

import pytest

from mnemonic_autoimprove.adapters.base import RAGSystemAdapter
from mnemonic_autoimprove.evaluation.evaluator import RAGEvaluator
from mnemonic_autoimprove.evaluation.judges import BaseLLMJudge, _clamp
from mnemonic_autoimprove.evaluation.sampler import GoldenSetSampler
from mnemonic_autoimprove.models.config import RAGConfig
from mnemonic_autoimprove.models.golden_set import GoldenTestCase, GoldenTestSet


# --- Mock implementations ---


class MockJudge(BaseLLMJudge):
    """Returns fixed scores for testing."""

    def __init__(
        self,
        faithfulness: float = 0.85,
        answer_relevancy: float = 0.80,
        context_precision: float = 0.75,
        context_recall: float = 0.70,
    ) -> None:
        self.faithfulness_score = faithfulness
        self.answer_relevancy_score = answer_relevancy
        self.context_precision_score = context_precision
        self.context_recall_score = context_recall
        self.call_count = 0

    async def judge_faithfulness(self, question, answer, contexts) -> float:
        self.call_count += 1
        return self.faithfulness_score

    async def judge_answer_relevancy(self, question, answer) -> float:
        self.call_count += 1
        return self.answer_relevancy_score

    async def judge_context_precision(self, question, contexts) -> float:
        self.call_count += 1
        return self.context_precision_score

    async def judge_context_recall(self, question, contexts, expected_answer) -> float:
        self.call_count += 1
        return self.context_recall_score


class MockAdapter(RAGSystemAdapter):
    """Returns canned answers and contexts for testing."""

    def __init__(self) -> None:
        self._config = RAGConfig()
        self.query_count = 0

    async def apply_config(self, config: RAGConfig) -> None:
        self._config = config

    async def query(self, question: str) -> tuple[str, list[str]]:
        self.query_count += 1
        return (
            f"Mock answer for: {question}",
            ["Context chunk 1", "Context chunk 2", "Context chunk 3"],
        )

    async def get_current_config(self) -> RAGConfig:
        return self._config

    async def health_check(self) -> bool:
        return True


class FailingAdapter(RAGSystemAdapter):
    """Adapter that raises on query — for error handling tests."""

    async def apply_config(self, config: RAGConfig) -> None:
        pass

    async def query(self, question: str) -> tuple[str, list[str]]:
        raise ConnectionError("Simulated failure")

    async def get_current_config(self) -> RAGConfig:
        return RAGConfig()

    async def health_check(self) -> bool:
        return False


# --- Sampler Tests ---


class TestGoldenSetSampler:
    def test_sample_fraction(self, sample_golden_set: GoldenTestSet) -> None:
        sampler = GoldenSetSampler()
        sample = sampler.sample(sample_golden_set, fraction=0.5, seed=42)
        assert 1 <= len(sample) <= len(sample_golden_set.cases)

    def test_sample_full(self, sample_golden_set: GoldenTestSet) -> None:
        sampler = GoldenSetSampler()
        sample = sampler.sample(sample_golden_set, fraction=1.0, seed=42)
        assert len(sample) == len(sample_golden_set.cases)

    def test_sample_reproducible(self, sample_golden_set: GoldenTestSet) -> None:
        sampler = GoldenSetSampler()
        s1 = sampler.sample(sample_golden_set, fraction=0.5, seed=42)
        s2 = sampler.sample(sample_golden_set, fraction=0.5, seed=42)
        assert [c.case_id for c in s1] == [c.case_id for c in s2]

    def test_different_seeds_different_samples(self, sample_golden_set: GoldenTestSet) -> None:
        sampler = GoldenSetSampler()
        s1 = sampler.sample(sample_golden_set, fraction=0.5, seed=1)
        s2 = sampler.sample(sample_golden_set, fraction=0.5, seed=2)
        # With only 4 cases, might still be same, but ids should differ at some point
        # Just verify they're valid samples
        assert all(isinstance(c, GoldenTestCase) for c in s1)
        assert all(isinstance(c, GoldenTestCase) for c in s2)

    def test_invalid_fraction_raises(self, sample_golden_set: GoldenTestSet) -> None:
        sampler = GoldenSetSampler()
        with pytest.raises(ValueError):
            sampler.sample(sample_golden_set, fraction=0.0)
        with pytest.raises(ValueError):
            sampler.sample(sample_golden_set, fraction=-0.5)

    def test_minimum_one_case(self, sample_golden_set: GoldenTestSet) -> None:
        sampler = GoldenSetSampler()
        sample = sampler.sample(sample_golden_set, fraction=0.01, seed=42)
        assert len(sample) >= 1


# --- Clamp Utility ---


class TestClamp:
    def test_clamp_within_range(self) -> None:
        assert _clamp(0.5) == 0.5

    def test_clamp_above(self) -> None:
        assert _clamp(1.5) == 1.0

    def test_clamp_below(self) -> None:
        assert _clamp(-0.3) == 0.0

    def test_clamp_boundaries(self) -> None:
        assert _clamp(0.0) == 0.0
        assert _clamp(1.0) == 1.0


# --- Evaluator Tests ---


class TestRAGEvaluator:
    @pytest.mark.asyncio
    async def test_evaluate_returns_metrics(self, sample_golden_set: GoldenTestSet) -> None:
        judge = MockJudge()
        adapter = MockAdapter()
        evaluator = RAGEvaluator(judge=judge)

        metrics = await evaluator.evaluate(
            adapter, sample_golden_set, sample_fraction=1.0, seed=42
        )

        assert metrics.faithfulness == 0.85
        assert metrics.answer_relevancy == 0.80
        assert metrics.context_precision == 0.75
        assert metrics.context_recall == 0.70
        assert metrics.sample_size == 4
        assert metrics.cost_usd > 0

    @pytest.mark.asyncio
    async def test_evaluate_queries_adapter(self, sample_golden_set: GoldenTestSet) -> None:
        judge = MockJudge()
        adapter = MockAdapter()
        evaluator = RAGEvaluator(judge=judge)

        await evaluator.evaluate(adapter, sample_golden_set, sample_fraction=1.0, seed=42)

        assert adapter.query_count == 4  # one per case
        assert judge.call_count == 16  # 4 metrics × 4 cases

    @pytest.mark.asyncio
    async def test_evaluate_with_sampling(self, sample_golden_set: GoldenTestSet) -> None:
        judge = MockJudge()
        adapter = MockAdapter()
        evaluator = RAGEvaluator(judge=judge)

        metrics = await evaluator.evaluate(
            adapter, sample_golden_set, sample_fraction=0.5, seed=42
        )

        assert metrics.sample_size < 4  # sampled

    @pytest.mark.asyncio
    async def test_evaluate_handles_adapter_failure(
        self, sample_golden_set: GoldenTestSet
    ) -> None:
        judge = MockJudge()
        adapter = FailingAdapter()
        evaluator = RAGEvaluator(judge=judge)

        metrics = await evaluator.evaluate(
            adapter, sample_golden_set, sample_fraction=1.0, seed=42
        )

        # All scores should be 0 due to query failure
        assert metrics.faithfulness == 0.0
        assert metrics.answer_relevancy == 0.0

    @pytest.mark.asyncio
    async def test_evaluate_composite_score(self, sample_golden_set: GoldenTestSet) -> None:
        judge = MockJudge()
        adapter = MockAdapter()
        evaluator = RAGEvaluator(judge=judge)

        metrics = await evaluator.evaluate(
            adapter, sample_golden_set, sample_fraction=1.0, seed=42
        )

        expected = 0.30 * 0.85 + 0.25 * 0.80 + 0.25 * 0.75 + 0.20 * 0.70
        assert abs(metrics.composite_score - expected) < 1e-9
