"""Tests for RunTracker — run numbering, persistence, heartbeat summaries."""

from __future__ import annotations

from pathlib import Path

import pytest

from mnemonic_autoimprove.engine.run_tracker import RunTracker
from mnemonic_autoimprove.models.experiment import ExperimentResult
from mnemonic_autoimprove.models.metrics import RAGMetrics


@pytest.fixture()
def run_tracker(tmp_path: Path) -> RunTracker:
    return RunTracker(
        results_dir=tmp_path / "results",
        state_file=tmp_path / "state.json",
    )


def _make_result(
    run_number: int,
    name: str = "test_exp",
    improvement: float = 0.02,
    accepted: bool = True,
) -> ExperimentResult:
    baseline = RAGMetrics(
        faithfulness=0.80,
        answer_relevancy=0.75,
        context_precision=0.70,
        context_recall=0.65,
    )
    candidate = RAGMetrics(
        faithfulness=0.80 + improvement,
        answer_relevancy=0.75,
        context_precision=0.70,
        context_recall=0.65,
    )
    return ExperimentResult(
        run_number=run_number,
        experiment_id=f"exp-{run_number:03d}",
        experiment_name=name,
        baseline_config_version=1,
        candidate_config_version=run_number + 1,
        baseline_metrics=baseline,
        candidate_metrics=candidate,
        improvement=improvement,
        accepted=accepted,
        cost_estimate_usd=0.08,
    )


class TestRunTracker:
    def test_initial_run_number_is_zero(self, run_tracker: RunTracker) -> None:
        assert run_tracker.get_current_run_number() == 0

    def test_get_next_run_number_increments(self, run_tracker: RunTracker) -> None:
        assert run_tracker.get_next_run_number() == 1
        assert run_tracker.get_next_run_number() == 2
        assert run_tracker.get_next_run_number() == 3

    def test_current_run_reflects_next(self, run_tracker: RunTracker) -> None:
        run_tracker.get_next_run_number()
        run_tracker.get_next_run_number()
        assert run_tracker.get_current_run_number() == 2

    def test_record_and_get_result(self, run_tracker: RunTracker) -> None:
        result = _make_result(1)
        path = run_tracker.record_result(result)
        assert path.exists()

        loaded = run_tracker.get_result(1)
        assert loaded is not None
        assert loaded.run_number == 1
        assert loaded.experiment_name == "test_exp"

    def test_get_nonexistent_result(self, run_tracker: RunTracker) -> None:
        assert run_tracker.get_result(999) is None

    def test_get_recent_results(self, run_tracker: RunTracker) -> None:
        for i in range(1, 6):
            run_tracker.get_next_run_number()
            run_tracker.record_result(_make_result(i, name=f"exp_{i}"))

        recent = run_tracker.get_recent_results(3)
        assert len(recent) == 3
        assert recent[0].run_number == 5  # newest first
        assert recent[2].run_number == 3

    def test_get_recent_results_when_fewer_exist(self, run_tracker: RunTracker) -> None:
        run_tracker.get_next_run_number()
        run_tracker.record_result(_make_result(1))
        recent = run_tracker.get_recent_results(10)
        assert len(recent) == 1

    def test_statistics_empty(self, run_tracker: RunTracker) -> None:
        stats = run_tracker.get_statistics()
        assert stats["total_runs"] == 0
        assert stats["acceptance_rate"] == 0.0

    def test_statistics_with_data(self, run_tracker: RunTracker) -> None:
        for i in range(1, 5):
            run_tracker.get_next_run_number()
            accepted = i % 2 == 0  # 2 accepted, 2 rejected
            run_tracker.record_result(
                _make_result(i, accepted=accepted, improvement=0.02 if accepted else -0.01)
            )

        stats = run_tracker.get_statistics()
        assert stats["total_runs"] == 4
        assert stats["accepted"] == 2
        assert stats["rejected"] == 2
        assert stats["acceptance_rate"] == 0.5

    def test_heartbeat_summary_no_runs(self, run_tracker: RunTracker) -> None:
        summary = run_tracker.generate_heartbeat_summary()
        assert "No runs yet" in summary

    def test_heartbeat_summary_with_runs(self, run_tracker: RunTracker) -> None:
        run_tracker.get_next_run_number()
        run_tracker.record_result(_make_result(1, name="retrieval_k_7"))

        summary = run_tracker.generate_heartbeat_summary(
            best_config_version=2,
            best_score=0.781,
        )
        assert "# AutoImprove Status" in summary  # markdown heading
        assert "#1" in summary
        assert "v2" in summary
        assert "0.781" in summary
        assert "retrieval_k_7" in summary
