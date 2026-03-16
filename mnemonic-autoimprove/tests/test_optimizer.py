"""Tests for the optimizer loop — full integration with mocked adapter and judge."""

from __future__ import annotations

from pathlib import Path

import pytest

from mnemonic_autoimprove.engine.config_manager import ConfigManager
from mnemonic_autoimprove.engine.optimizer import AutoImproveOptimizer
from mnemonic_autoimprove.engine.run_tracker import RunTracker
from mnemonic_autoimprove.evaluation.evaluator import RAGEvaluator
from mnemonic_autoimprove.experiments.catalog import ExperimentCatalog
from mnemonic_autoimprove.models.config import RAGConfig
from mnemonic_autoimprove.models.experiment import ExperimentSpec
from mnemonic_autoimprove.models.golden_set import GoldenTestSet

from tests.test_evaluator import MockAdapter, MockJudge


@pytest.fixture()
def optimizer_deps(tmp_path: Path, sample_golden_set: GoldenTestSet):
    """Create all dependencies for the optimizer."""
    storage_dir = tmp_path / ".autoimprove"
    cm = ConfigManager(storage_dir)
    cm.initialize_baseline()
    rt = RunTracker(
        results_dir=storage_dir / "results",
        state_file=storage_dir / "state.json",
    )
    return cm, rt, sample_golden_set


class TestAutoImproveOptimizer:
    @pytest.mark.asyncio
    async def test_run_single_experiment_accepted(self, optimizer_deps) -> None:
        cm, rt, golden_set = optimizer_deps

        # Judge returns better scores for candidate (higher faithfulness)
        judge = MockJudge(faithfulness=0.90, answer_relevancy=0.85,
                          context_precision=0.80, context_recall=0.75)
        adapter = MockAdapter()
        evaluator = RAGEvaluator(judge=judge)

        # Use a simple catalog with one experiment
        catalog = ExperimentCatalog(experiments=[
            ExperimentSpec(
                name="test_k_7",
                description="test",
                parameter_changes={"retrieval_k": 7},
                category="retrieval",
            ),
        ])

        optimizer = AutoImproveOptimizer(
            adapter=adapter,
            evaluator=evaluator,
            catalog=catalog,
            config_manager=cm,
            run_tracker=rt,
            golden_set=golden_set,
            sample_fraction=1.0,
            improvement_threshold=-0.01,  # accept zero or better (mock returns same scores for both)
        )

        result = await optimizer.run_single_experiment()

        assert result is not None
        assert result.run_number == 1
        assert result.experiment_name == "test_k_7"
        # With same judge for both, improvement should be ~0 (accepted because threshold=0)
        assert result.accepted is True
        assert result.cost_estimate_usd > 0

    @pytest.mark.asyncio
    async def test_run_single_experiment_rejected(self, optimizer_deps) -> None:
        cm, rt, golden_set = optimizer_deps

        # Default mock returns same scores → improvement = 0 → below threshold
        judge = MockJudge()
        adapter = MockAdapter()
        evaluator = RAGEvaluator(judge=judge)

        catalog = ExperimentCatalog(experiments=[
            ExperimentSpec(
                name="test_temp",
                description="test",
                parameter_changes={"temperature": 0.7},
                category="temperature",
            ),
        ])

        optimizer = AutoImproveOptimizer(
            adapter=adapter,
            evaluator=evaluator,
            catalog=catalog,
            config_manager=cm,
            run_tracker=rt,
            golden_set=golden_set,
            sample_fraction=1.0,
            improvement_threshold=0.05,  # strict threshold
        )

        result = await optimizer.run_single_experiment()

        assert result is not None
        assert result.accepted is False
        # Config should still be v1
        assert cm.get_current_config().version == 1

    @pytest.mark.asyncio
    async def test_run_returns_none_when_exhausted(self, optimizer_deps) -> None:
        cm, rt, golden_set = optimizer_deps

        catalog = ExperimentCatalog(experiments=[
            ExperimentSpec(
                name="only",
                description="test",
                parameter_changes={"retrieval_k": 3},
                category="retrieval",
            ),
        ])
        catalog.mark_tried("only")

        optimizer = AutoImproveOptimizer(
            adapter=MockAdapter(),
            evaluator=RAGEvaluator(judge=MockJudge()),
            catalog=catalog,
            config_manager=cm,
            run_tracker=rt,
            golden_set=golden_set,
        )

        result = await optimizer.run_single_experiment()
        assert result is None

    @pytest.mark.asyncio
    async def test_multiple_experiments_track_runs(self, optimizer_deps) -> None:
        cm, rt, golden_set = optimizer_deps

        catalog = ExperimentCatalog(experiments=[
            ExperimentSpec(
                name="exp_a", description="a",
                parameter_changes={"retrieval_k": 3}, category="retrieval",
            ),
            ExperimentSpec(
                name="exp_b", description="b",
                parameter_changes={"retrieval_k": 7}, category="retrieval",
            ),
            ExperimentSpec(
                name="exp_c", description="c",
                parameter_changes={"temperature": 0.1}, category="temperature",
            ),
        ])

        optimizer = AutoImproveOptimizer(
            adapter=MockAdapter(),
            evaluator=RAGEvaluator(judge=MockJudge()),
            catalog=catalog,
            config_manager=cm,
            run_tracker=rt,
            golden_set=golden_set,
            sample_fraction=1.0,
            improvement_threshold=0.0,
        )

        results = []
        for _ in range(3):
            r = await optimizer.run_single_experiment()
            assert r is not None
            results.append(r)

        # Fourth call should return None (all exhausted)
        assert await optimizer.run_single_experiment() is None

        assert results[0].run_number == 1
        assert results[1].run_number == 2
        assert results[2].run_number == 3
        assert rt.get_current_run_number() == 3

    @pytest.mark.asyncio
    async def test_result_persisted_to_disk(self, optimizer_deps) -> None:
        cm, rt, golden_set = optimizer_deps

        catalog = ExperimentCatalog(experiments=[
            ExperimentSpec(
                name="persist_test", description="test",
                parameter_changes={"retrieval_k": 10}, category="retrieval",
            ),
        ])

        optimizer = AutoImproveOptimizer(
            adapter=MockAdapter(),
            evaluator=RAGEvaluator(judge=MockJudge()),
            catalog=catalog,
            config_manager=cm,
            run_tracker=rt,
            golden_set=golden_set,
        )

        await optimizer.run_single_experiment()

        # Result should be loadable from disk
        loaded = rt.get_result(1)
        assert loaded is not None
        assert loaded.experiment_name == "persist_test"

    @pytest.mark.asyncio
    async def test_get_status(self, optimizer_deps) -> None:
        cm, rt, golden_set = optimizer_deps

        catalog = ExperimentCatalog()
        optimizer = AutoImproveOptimizer(
            adapter=MockAdapter(),
            evaluator=RAGEvaluator(judge=MockJudge()),
            catalog=catalog,
            config_manager=cm,
            run_tracker=rt,
            golden_set=golden_set,
        )

        status = await optimizer.get_status()
        assert "current_run" in status
        assert "experiments_remaining" in status
        assert status["experiments_total"] > 0
