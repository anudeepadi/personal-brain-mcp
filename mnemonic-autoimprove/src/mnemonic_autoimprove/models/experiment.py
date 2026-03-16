from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

from mnemonic_autoimprove.models.metrics import RAGMetrics


class ExperimentSpec(BaseModel):
    """Defines a single experiment to try against the RAG pipeline.

    Each spec describes what parameter changes to apply and why.
    """

    model_config = ConfigDict(frozen=True)

    experiment_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    description: str
    parameter_changes: dict[str, Any]
    category: str  # "retrieval" | "temperature" | "prompt" | "chunking"


class ExperimentResult(BaseModel):
    """Immutable record of a single experiment run.

    Contains both baseline and candidate metrics for comparison,
    plus the keep/discard decision.
    """

    model_config = ConfigDict(frozen=True)

    run_number: int
    experiment_id: str
    experiment_name: str
    baseline_config_version: int
    candidate_config_version: int
    baseline_metrics: RAGMetrics
    candidate_metrics: RAGMetrics
    improvement: float
    accepted: bool
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cost_estimate_usd: float = 0.0
    error: str | None = None

    def summary(self) -> str:
        """Human-readable one-line summary for heartbeat display."""
        status = "ACCEPTED" if self.accepted else "REJECTED"
        sign = "+" if self.improvement >= 0 else ""
        return (
            f"Run #{self.run_number}: \"{self.experiment_name}\" "
            f"→ {sign}{self.improvement:.3f} {status}"
        )
