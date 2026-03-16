from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field


# Weights for composite score (sum to 1.0)
FAITHFULNESS_WEIGHT = 0.30
ANSWER_RELEVANCY_WEIGHT = 0.25
CONTEXT_PRECISION_WEIGHT = 0.25
CONTEXT_RECALL_WEIGHT = 0.20


class RAGMetrics(BaseModel):
    """Evaluation metrics for a RAG pipeline run.

    Composite score is a weighted combination of four RAGAS-style metrics.
    This replaces autoresearch's val_bpb as the single optimization target.
    """

    model_config = ConfigDict(frozen=True)

    faithfulness: float = Field(ge=0.0, le=1.0)
    answer_relevancy: float = Field(ge=0.0, le=1.0)
    context_precision: float = Field(ge=0.0, le=1.0)
    context_recall: float = Field(ge=0.0, le=1.0)

    latency_ms: float = 0.0
    cost_usd: float = 0.0
    sample_size: int = 0
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def composite_score(self) -> float:
        """Weighted composite score (0.0–1.0). Higher is better.

        Weights:
          - Faithfulness (30%): Don't hallucinate
          - Answer relevancy (25%): Answer the question
          - Context precision (25%): Retrieve only relevant docs
          - Context recall (20%): Don't miss relevant docs
        """
        return (
            FAITHFULNESS_WEIGHT * self.faithfulness
            + ANSWER_RELEVANCY_WEIGHT * self.answer_relevancy
            + CONTEXT_PRECISION_WEIGHT * self.context_precision
            + CONTEXT_RECALL_WEIGHT * self.context_recall
        )

    def improvement_over(self, baseline: RAGMetrics) -> float:
        """Calculate composite score delta vs a baseline."""
        return self.composite_score - baseline.composite_score

    def summary(self) -> str:
        """Human-readable one-line summary."""
        return (
            f"score={self.composite_score:.3f} "
            f"[F={self.faithfulness:.2f} R={self.answer_relevancy:.2f} "
            f"P={self.context_precision:.2f} C={self.context_recall:.2f}]"
        )
