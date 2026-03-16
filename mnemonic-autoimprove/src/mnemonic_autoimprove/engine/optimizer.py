"""Main optimization loop — the core autoresearch-for-RAG engine."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from mnemonic_autoimprove.adapters.base import RAGSystemAdapter
from mnemonic_autoimprove.engine.config_manager import ConfigManager
from mnemonic_autoimprove.engine.run_tracker import RunTracker
from mnemonic_autoimprove.evaluation.evaluator import RAGEvaluator
from mnemonic_autoimprove.experiments.base import apply_experiment
from mnemonic_autoimprove.experiments.catalog import ExperimentCatalog
from mnemonic_autoimprove.models.experiment import ExperimentResult
from mnemonic_autoimprove.models.golden_set import GoldenTestSet

logger = logging.getLogger(__name__)

IMPROVEMENT_THRESHOLD = 0.01


class AutoImproveOptimizer:
    """The main optimization loop: pick → evaluate → keep/discard.

    Mirrors Karpathy's autoresearch pattern:
    - autoresearch: modify train.py → train 5min → check val_bpb → keep/discard
    - AutoImprove:  evolve RAGConfig → eval golden set → check composite → keep/discard
    """

    def __init__(
        self,
        adapter: RAGSystemAdapter,
        evaluator: RAGEvaluator,
        catalog: ExperimentCatalog,
        config_manager: ConfigManager,
        run_tracker: RunTracker,
        golden_set: GoldenTestSet,
        sample_fraction: float = 0.25,
        improvement_threshold: float = IMPROVEMENT_THRESHOLD,
    ) -> None:
        self._adapter = adapter
        self._evaluator = evaluator
        self._catalog = catalog
        self._config_manager = config_manager
        self._run_tracker = run_tracker
        self._golden_set = golden_set
        self._sample_fraction = sample_fraction
        self._improvement_threshold = improvement_threshold

    async def run_single_experiment(self) -> ExperimentResult | None:
        """Pick next experiment, evaluate it, keep or discard.

        Returns the ExperimentResult, or None if all experiments exhausted.
        """
        # 1. Select next untried experiment
        spec = self._catalog.select_next()
        if spec is None:
            logger.info("All experiments exhausted. Nothing to do.")
            return None

        run_number = self._run_tracker.get_next_run_number()
        started_at = datetime.now(timezone.utc)
        logger.info("Run #%d: Testing '%s'", run_number, spec.name)

        # 2. Get current baseline config
        baseline_config = self._config_manager.get_current_config()
        if baseline_config is None:
            baseline_config = self._config_manager.initialize_baseline()

        # 3. Create candidate config (immutable evolution)
        candidate_config = apply_experiment(baseline_config, spec)
        self._config_manager.save_config(candidate_config)

        try:
            # 4. Evaluate baseline (use run_number as seed for reproducibility)
            await self._adapter.apply_config(baseline_config)
            baseline_metrics = await self._evaluator.evaluate(
                self._adapter,
                self._golden_set,
                sample_fraction=self._sample_fraction,
                seed=run_number,
            )
            logger.info("Baseline: %s", baseline_metrics.summary())

            # 5. Evaluate candidate (same seed = same sample for fair comparison)
            await self._adapter.apply_config(candidate_config)
            candidate_metrics = await self._evaluator.evaluate(
                self._adapter,
                self._golden_set,
                sample_fraction=self._sample_fraction,
                seed=run_number,
            )
            logger.info("Candidate: %s", candidate_metrics.summary())

            # 6. Compare
            improvement = candidate_metrics.improvement_over(baseline_metrics)
            accepted = improvement > self._improvement_threshold

            if accepted:
                logger.info("ACCEPTED: +%.3f improvement", improvement)
                self._config_manager.set_best(candidate_config)
            else:
                logger.info("REJECTED: %.3f improvement (threshold: %.3f)",
                           improvement, self._improvement_threshold)

            # 7. Restore baseline config (production safety)
            current_best = self._config_manager.get_best_config()
            if current_best is not None:
                await self._adapter.apply_config(current_best)

            error = None

        except Exception as exc:
            logger.exception("Experiment '%s' failed", spec.name)
            from mnemonic_autoimprove.models.metrics import RAGMetrics
            baseline_metrics = RAGMetrics(
                faithfulness=0.0, answer_relevancy=0.0,
                context_precision=0.0, context_recall=0.0,
            )
            candidate_metrics = baseline_metrics
            improvement = 0.0
            accepted = False
            error = str(exc)

        completed_at = datetime.now(timezone.utc)

        # 8. Record result
        result = ExperimentResult(
            run_number=run_number,
            experiment_id=spec.experiment_id,
            experiment_name=spec.name,
            baseline_config_version=baseline_config.version,
            candidate_config_version=candidate_config.version,
            baseline_metrics=baseline_metrics,
            candidate_metrics=candidate_metrics,
            improvement=round(improvement, 6),
            accepted=accepted,
            started_at=started_at,
            completed_at=completed_at,
            cost_estimate_usd=round(
                baseline_metrics.cost_usd + candidate_metrics.cost_usd, 4
            ),
            error=error,
        )
        self._run_tracker.record_result(result)
        self._catalog.mark_tried(spec.name)

        return result

    async def get_status(self) -> dict:
        """Return current optimization status for heartbeat display."""
        best_config = self._config_manager.get_best_config()
        best_score = None
        if best_config is not None:
            best_score = None  # Would need to track this separately

        return {
            "current_run": self._run_tracker.get_current_run_number(),
            "best_config_version": best_config.version if best_config else None,
            "experiments_remaining": self._catalog.remaining_count,
            "experiments_total": self._catalog.total_count,
            "all_exhausted": self._catalog.all_exhausted,
            "statistics": self._run_tracker.get_statistics(),
        }
