"""Tests for experiment catalog, selection, and application."""

from __future__ import annotations

import pytest

from mnemonic_autoimprove.experiments.base import apply_experiment
from mnemonic_autoimprove.experiments.catalog import ExperimentCatalog
from mnemonic_autoimprove.models.config import RAGConfig
from mnemonic_autoimprove.models.experiment import ExperimentSpec


class TestExperimentCatalog:
    def test_default_catalog_has_experiments(self) -> None:
        catalog = ExperimentCatalog()
        assert catalog.total_count >= 12  # at least 12 built-in

    def test_select_next_returns_first_untried(self) -> None:
        catalog = ExperimentCatalog()
        first = catalog.select_next()
        assert first is not None
        assert first.name == "retrieval_k_3"  # first in retrieval list

    def test_select_next_skips_tried(self) -> None:
        catalog = ExperimentCatalog()
        catalog.mark_tried("retrieval_k_3")
        second = catalog.select_next()
        assert second is not None
        assert second.name != "retrieval_k_3"

    def test_select_next_returns_none_when_exhausted(self) -> None:
        specs = [
            ExperimentSpec(
                name="only_one",
                description="test",
                parameter_changes={"retrieval_k": 3},
                category="test",
            )
        ]
        catalog = ExperimentCatalog(experiments=specs)
        catalog.mark_tried("only_one")
        assert catalog.select_next() is None

    def test_all_exhausted(self) -> None:
        specs = [
            ExperimentSpec(
                name="a", description="a", parameter_changes={}, category="test"
            ),
            ExperimentSpec(
                name="b", description="b", parameter_changes={}, category="test"
            ),
        ]
        catalog = ExperimentCatalog(experiments=specs)
        assert not catalog.all_exhausted
        catalog.mark_tried("a")
        catalog.mark_tried("b")
        assert catalog.all_exhausted

    def test_remaining_count(self) -> None:
        specs = [
            ExperimentSpec(
                name="a", description="a", parameter_changes={}, category="test"
            ),
            ExperimentSpec(
                name="b", description="b", parameter_changes={}, category="test"
            ),
        ]
        catalog = ExperimentCatalog(experiments=specs)
        assert catalog.remaining_count == 2
        catalog.mark_tried("a")
        assert catalog.remaining_count == 1

    def test_reset(self) -> None:
        catalog = ExperimentCatalog()
        first = catalog.select_next()
        catalog.mark_tried(first.name)
        catalog.reset()
        assert catalog.remaining_count == catalog.total_count

    def test_get_by_name(self) -> None:
        catalog = ExperimentCatalog()
        spec = catalog.get_by_name("retrieval_k_3")
        assert spec is not None
        assert spec.parameter_changes == {"retrieval_k": 3}

    def test_get_by_name_not_found(self) -> None:
        catalog = ExperimentCatalog()
        assert catalog.get_by_name("nonexistent") is None

    def test_get_by_category(self) -> None:
        catalog = ExperimentCatalog()
        retrieval = catalog.get_by_category("retrieval")
        assert len(retrieval) >= 3
        assert all(s.category == "retrieval" for s in retrieval)

    def test_list_all(self) -> None:
        catalog = ExperimentCatalog()
        all_exps = catalog.list_all()
        assert len(all_exps) == catalog.total_count
        assert all("name" in e and "tried" in e for e in all_exps)

    def test_list_all_shows_tried_status(self) -> None:
        catalog = ExperimentCatalog()
        catalog.mark_tried("retrieval_k_3")
        all_exps = catalog.list_all()
        for e in all_exps:
            if e["name"] == "retrieval_k_3":
                assert e["tried"] is True
            else:
                assert e["tried"] is False


class TestApplyExperiment:
    def test_apply_retrieval_change(self) -> None:
        config = RAGConfig()
        spec = ExperimentSpec(
            name="test",
            description="test",
            parameter_changes={"retrieval_k": 7},
            category="retrieval",
        )
        new_config = apply_experiment(config, spec)
        assert new_config.retrieval_k == 7
        assert new_config.version == 2
        assert config.retrieval_k == 5  # original unchanged

    def test_apply_multiple_changes(self) -> None:
        config = RAGConfig()
        spec = ExperimentSpec(
            name="test",
            description="test",
            parameter_changes={"retrieval_k": 10, "temperature": 0.5},
            category="retrieval",
        )
        new_config = apply_experiment(config, spec)
        assert new_config.retrieval_k == 10
        assert new_config.temperature == 0.5
