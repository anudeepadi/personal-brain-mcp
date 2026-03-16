"""Tests for ConfigManager — save, load, rollback, versioning."""

from __future__ import annotations

from pathlib import Path

import pytest

from mnemonic_autoimprove.engine.config_manager import ConfigManager
from mnemonic_autoimprove.models.config import RAGConfig


@pytest.fixture()
def config_manager(tmp_path: Path) -> ConfigManager:
    return ConfigManager(storage_dir=tmp_path / ".autoimprove")


class TestConfigManager:
    def test_initialize_baseline_creates_v1(self, config_manager: ConfigManager) -> None:
        config = config_manager.initialize_baseline()
        assert config.version == 1
        assert config_manager.get_current_config() is not None
        assert config_manager.get_current_config().version == 1

    def test_initialize_baseline_idempotent(self, config_manager: ConfigManager) -> None:
        first = config_manager.initialize_baseline()
        second = config_manager.initialize_baseline()
        assert first.version == second.version

    def test_initialize_baseline_custom_config(self, config_manager: ConfigManager) -> None:
        custom = RAGConfig(retrieval_k=10, temperature=0.5)
        result = config_manager.initialize_baseline(custom)
        assert result.retrieval_k == 10
        assert result.temperature == 0.5

    def test_save_and_load(self, config_manager: ConfigManager) -> None:
        config = RAGConfig()
        path = config_manager.save_config(config)
        assert path.exists()
        loaded = config_manager.load_config(1)
        assert loaded.version == config.version
        assert loaded.chunk_size == config.chunk_size

    def test_load_nonexistent_raises(self, config_manager: ConfigManager) -> None:
        with pytest.raises(FileNotFoundError):
            config_manager.load_config(999)

    def test_set_current(self, config_manager: ConfigManager) -> None:
        config = RAGConfig()
        config_manager.set_current(config)
        current = config_manager.get_current_config()
        assert current is not None
        assert current.version == 1

    def test_set_best(self, config_manager: ConfigManager) -> None:
        config = RAGConfig()
        config_manager.set_best(config)
        best = config_manager.get_best_config()
        assert best is not None
        assert best.version == 1

    def test_rollback(self, config_manager: ConfigManager) -> None:
        v1 = RAGConfig()
        config_manager.set_current(v1)

        v2 = v1.evolve(retrieval_k=7)
        config_manager.set_current(v2)
        assert config_manager.get_current_config().version == 2

        rolled_back = config_manager.rollback(1)
        assert rolled_back.version == 1
        assert config_manager.get_current_config().version == 1

    def test_rollback_nonexistent_raises(self, config_manager: ConfigManager) -> None:
        with pytest.raises(FileNotFoundError):
            config_manager.rollback(999)

    def test_list_versions(self, config_manager: ConfigManager) -> None:
        v1 = RAGConfig()
        config_manager.save_config(v1)

        v2 = v1.evolve(retrieval_k=7)
        config_manager.save_config(v2)

        v3 = v2.evolve(temperature=0.5)
        config_manager.save_config(v3)

        versions = config_manager.list_versions()
        assert versions == [1, 2, 3]

    def test_list_versions_empty(self, config_manager: ConfigManager) -> None:
        assert config_manager.list_versions() == []

    def test_get_current_config_when_empty(self, config_manager: ConfigManager) -> None:
        assert config_manager.get_current_config() is None

    def test_get_best_config_when_empty(self, config_manager: ConfigManager) -> None:
        assert config_manager.get_best_config() is None

    def test_multiple_evolve_and_track(self, config_manager: ConfigManager) -> None:
        """Full workflow: baseline → evolve → set best → evolve again."""
        baseline = config_manager.initialize_baseline()
        assert baseline.version == 1

        v2 = baseline.evolve(retrieval_k=7)
        config_manager.set_best(v2)
        assert config_manager.get_best_config().version == 2
        assert config_manager.get_current_config().version == 2

        v3 = v2.evolve(temperature=0.1)
        config_manager.set_current(v3)
        # Best is still v2, current moved to v3
        assert config_manager.get_best_config().version == 2
        assert config_manager.get_current_config().version == 3
