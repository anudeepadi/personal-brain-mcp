"""Tests for all Pydantic data models — immutability, evolve, validation, scoring."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from mnemonic_autoimprove.models.config import RAGConfig
from mnemonic_autoimprove.models.experiment import ExperimentResult, ExperimentSpec
from mnemonic_autoimprove.models.golden_set import GoldenTestCase, GoldenTestSet
from mnemonic_autoimprove.models.metrics import RAGMetrics


# --- RAGConfig ---


class TestRAGConfig:
    def test_default_values(self, baseline_config: RAGConfig) -> None:
        assert baseline_config.version == 1
        assert baseline_config.chunk_size == 1000
        assert baseline_config.chunk_overlap == 100
        assert baseline_config.retrieval_k == 5
        assert baseline_config.temperature == 0.3
        assert baseline_config.parent_version is None

    def test_frozen_immutability(self, baseline_config: RAGConfig) -> None:
        with pytest.raises(Exception):  # ValidationError for frozen
            baseline_config.retrieval_k = 7  # type: ignore[misc]

    def test_evolve_creates_new_version(self, baseline_config: RAGConfig) -> None:
        evolved = baseline_config.evolve(retrieval_k=7)
        assert evolved.version == 2
        assert evolved.parent_version == 1
        assert evolved.retrieval_k == 7
        # Original unchanged
        assert baseline_config.version == 1
        assert baseline_config.retrieval_k == 5

    def test_evolve_preserves_unchanged_fields(self, baseline_config: RAGConfig) -> None:
        evolved = baseline_config.evolve(temperature=0.5)
        assert evolved.chunk_size == baseline_config.chunk_size
        assert evolved.retrieval_k == baseline_config.retrieval_k
        assert evolved.temperature == 0.5

    def test_evolve_chain(self, baseline_config: RAGConfig) -> None:
        v2 = baseline_config.evolve(retrieval_k=7)
        v3 = v2.evolve(temperature=0.5)
        assert v3.version == 3
        assert v3.parent_version == 2
        assert v3.retrieval_k == 7
        assert v3.temperature == 0.5

    def test_diff(self, baseline_config: RAGConfig) -> None:
        other = baseline_config.evolve(retrieval_k=7, temperature=0.5)
        diff = baseline_config.diff(other)
        assert "retrieval_k" in diff
        assert diff["retrieval_k"] == (5, 7)
        assert "temperature" in diff
        assert diff["temperature"] == (0.3, 0.5)
        assert "chunk_size" not in diff  # unchanged

    def test_serialization_roundtrip(self, baseline_config: RAGConfig) -> None:
        json_str = baseline_config.model_dump_json()
        restored = RAGConfig.model_validate_json(json_str)
        assert restored.version == baseline_config.version
        assert restored.chunk_size == baseline_config.chunk_size

    def test_is_hashable(self, baseline_config: RAGConfig) -> None:
        # Frozen models should be hashable
        hash(baseline_config)


# --- RAGMetrics ---


class TestRAGMetrics:
    def test_composite_score_calculation(self, sample_metrics: RAGMetrics) -> None:
        expected = (
            0.30 * 0.85
            + 0.25 * 0.78
            + 0.25 * 0.72
            + 0.20 * 0.68
        )
        assert abs(sample_metrics.composite_score - expected) < 1e-9

    def test_composite_score_range(self) -> None:
        perfect = RAGMetrics(
            faithfulness=1.0,
            answer_relevancy=1.0,
            context_precision=1.0,
            context_recall=1.0,
        )
        assert abs(perfect.composite_score - 1.0) < 1e-9

        worst = RAGMetrics(
            faithfulness=0.0,
            answer_relevancy=0.0,
            context_precision=0.0,
            context_recall=0.0,
        )
        assert abs(worst.composite_score - 0.0) < 1e-9

    def test_improvement_over(
        self, sample_metrics: RAGMetrics, better_metrics: RAGMetrics
    ) -> None:
        improvement = better_metrics.improvement_over(sample_metrics)
        assert improvement > 0

    def test_summary_format(self, sample_metrics: RAGMetrics) -> None:
        summary = sample_metrics.summary()
        assert "score=" in summary
        assert "F=" in summary
        assert "R=" in summary

    def test_frozen_immutability(self, sample_metrics: RAGMetrics) -> None:
        with pytest.raises(Exception):
            sample_metrics.faithfulness = 0.99  # type: ignore[misc]

    def test_validation_rejects_out_of_range(self) -> None:
        with pytest.raises(Exception):
            RAGMetrics(
                faithfulness=1.5,
                answer_relevancy=0.5,
                context_precision=0.5,
                context_recall=0.5,
            )

    def test_validation_rejects_negative(self) -> None:
        with pytest.raises(Exception):
            RAGMetrics(
                faithfulness=-0.1,
                answer_relevancy=0.5,
                context_precision=0.5,
                context_recall=0.5,
            )


# --- ExperimentSpec ---


class TestExperimentSpec:
    def test_auto_generated_id(self, sample_experiment_spec: ExperimentSpec) -> None:
        assert sample_experiment_spec.experiment_id is not None
        assert len(sample_experiment_spec.experiment_id) > 0

    def test_unique_ids(self) -> None:
        spec_a = ExperimentSpec(
            name="a", description="a", parameter_changes={}, category="test"
        )
        spec_b = ExperimentSpec(
            name="b", description="b", parameter_changes={}, category="test"
        )
        assert spec_a.experiment_id != spec_b.experiment_id

    def test_frozen(self, sample_experiment_spec: ExperimentSpec) -> None:
        with pytest.raises(Exception):
            sample_experiment_spec.name = "modified"  # type: ignore[misc]


# --- ExperimentResult ---


class TestExperimentResult:
    def test_summary_accepted(self, sample_experiment_result: ExperimentResult) -> None:
        summary = sample_experiment_result.summary()
        assert "ACCEPTED" in summary
        assert "#1" in summary

    def test_summary_rejected(self, sample_metrics: RAGMetrics) -> None:
        result = ExperimentResult(
            run_number=2,
            experiment_id="test-002",
            experiment_name="temp_0.7",
            baseline_config_version=1,
            candidate_config_version=3,
            baseline_metrics=sample_metrics,
            candidate_metrics=sample_metrics,
            improvement=-0.005,
            accepted=False,
        )
        assert "REJECTED" in result.summary()

    def test_frozen(self, sample_experiment_result: ExperimentResult) -> None:
        with pytest.raises(Exception):
            sample_experiment_result.accepted = False  # type: ignore[misc]


# --- GoldenTestSet ---


class TestGoldenTestSet:
    def test_from_json_file(self, tmp_path: Path, sample_golden_set: GoldenTestSet) -> None:
        json_path = tmp_path / "golden.json"
        json_path.write_text(
            sample_golden_set.model_dump_json(indent=2),
            encoding="utf-8",
        )
        loaded = GoldenTestSet.from_json_file(json_path)
        assert len(loaded.cases) == len(sample_golden_set.cases)
        assert loaded.cases[0].case_id == "gs-001"

    def test_filter_by_difficulty(self, sample_golden_set: GoldenTestSet) -> None:
        easy = sample_golden_set.filter_by_difficulty("easy")
        assert len(easy) == 2
        assert all(c.difficulty == "easy" for c in easy)

    def test_filter_by_category(self, sample_golden_set: GoldenTestSet) -> None:
        arch = sample_golden_set.filter_by_category("architecture")
        assert len(arch) == 2
        assert all(c.category == "architecture" for c in arch)

    def test_frozen(self, sample_golden_set: GoldenTestSet) -> None:
        with pytest.raises(Exception):
            sample_golden_set.name = "modified"  # type: ignore[misc]
