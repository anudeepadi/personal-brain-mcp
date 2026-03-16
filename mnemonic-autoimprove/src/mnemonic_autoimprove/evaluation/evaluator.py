"""Core evaluation engine — orchestrates LLM judge over golden test set samples."""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from mnemonic_autoimprove.adapters.base import RAGSystemAdapter
from mnemonic_autoimprove.evaluation.judges import BaseLLMJudge
from mnemonic_autoimprove.evaluation.sampler import GoldenSetSampler
from mnemonic_autoimprove.models.golden_set import GoldenTestCase, GoldenTestSet
from mnemonic_autoimprove.models.metrics import RAGMetrics

logger = logging.getLogger(__name__)

# Estimated cost per LLM judge call (Gemini Flash)
COST_PER_JUDGE_CALL_USD = 0.0003
JUDGE_CALLS_PER_CASE = 4  # faithfulness + relevancy + precision + recall


class RAGEvaluator:
    """Evaluates a RAG system against a golden test set using LLM-as-judge.

    Samples a fraction of the golden set (default 25%) for token efficiency,
    then scores each case across four RAGAS dimensions.
    """

    def __init__(
        self,
        judge: BaseLLMJudge,
        sampler: GoldenSetSampler | None = None,
    ) -> None:
        self._judge = judge
        self._sampler = sampler or GoldenSetSampler()

    async def evaluate(
        self,
        adapter: RAGSystemAdapter,
        golden_set: GoldenTestSet,
        sample_fraction: float = 0.25,
        seed: int | None = None,
    ) -> RAGMetrics:
        """Run evaluation on a sample of the golden set.

        Args:
            adapter: The RAG system to evaluate.
            golden_set: Ground truth test set.
            sample_fraction: Fraction to sample (0.0–1.0).
            seed: Random seed for reproducible sampling.

        Returns:
            Aggregated RAGMetrics across all sampled cases.
        """
        cases = self._sampler.sample(golden_set, fraction=sample_fraction, seed=seed)
        logger.info("Evaluating %d cases (%.0f%% of %d)", len(cases), sample_fraction * 100, len(golden_set.cases))

        start_time = time.monotonic()

        faithfulness_scores: list[float] = []
        relevancy_scores: list[float] = []
        precision_scores: list[float] = []
        recall_scores: list[float] = []

        for case in cases:
            scores = await self._evaluate_single(adapter, case)
            faithfulness_scores.append(scores["faithfulness"])
            relevancy_scores.append(scores["answer_relevancy"])
            precision_scores.append(scores["context_precision"])
            recall_scores.append(scores["context_recall"])

        elapsed_ms = (time.monotonic() - start_time) * 1000
        cost = len(cases) * JUDGE_CALLS_PER_CASE * COST_PER_JUDGE_CALL_USD

        return RAGMetrics(
            faithfulness=_safe_mean(faithfulness_scores),
            answer_relevancy=_safe_mean(relevancy_scores),
            context_precision=_safe_mean(precision_scores),
            context_recall=_safe_mean(recall_scores),
            latency_ms=round(elapsed_ms, 1),
            cost_usd=round(cost, 4),
            sample_size=len(cases),
            evaluated_at=datetime.now(timezone.utc),
        )

    async def _evaluate_single(
        self,
        adapter: RAGSystemAdapter,
        case: GoldenTestCase,
    ) -> dict[str, float]:
        """Evaluate a single test case across all four dimensions."""
        try:
            answer, contexts = await adapter.query(case.query)
        except Exception:
            logger.exception("Query failed for case %s", case.case_id)
            return {
                "faithfulness": 0.0,
                "answer_relevancy": 0.0,
                "context_precision": 0.0,
                "context_recall": 0.0,
            }

        faithfulness = await self._judge.judge_faithfulness(
            case.query, answer, contexts
        )
        answer_relevancy = await self._judge.judge_answer_relevancy(
            case.query, answer
        )
        context_precision = await self._judge.judge_context_precision(
            case.query, contexts
        )
        context_recall = await self._judge.judge_context_recall(
            case.query, contexts, case.expected_answer
        )

        logger.debug(
            "Case %s: F=%.2f R=%.2f P=%.2f C=%.2f",
            case.case_id, faithfulness, answer_relevancy,
            context_precision, context_recall,
        )

        return {
            "faithfulness": faithfulness,
            "answer_relevancy": answer_relevancy,
            "context_precision": context_precision,
            "context_recall": context_recall,
        }


def _safe_mean(values: list[float]) -> float:
    """Calculate mean, returning 0.0 for empty lists."""
    if not values:
        return 0.0
    return sum(values) / len(values)
