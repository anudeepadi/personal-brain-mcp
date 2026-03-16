"""Immutable config versioning with atomic file persistence and safe rollback."""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

from mnemonic_autoimprove.models.config import RAGConfig


class ConfigManager:
    """Manages immutable RAG config versions persisted as JSON files.

    Each accepted config gets a new version number. The "current" pointer
    tracks which version is active. Rollback is always safe because
    old versions are never deleted.
    """

    def __init__(self, storage_dir: Path) -> None:
        self._storage_dir = storage_dir
        self._configs_dir = storage_dir / "configs"
        self._state_file = storage_dir / "state.json"
        self._configs_dir.mkdir(parents=True, exist_ok=True)

    def _read_state(self) -> dict:
        """Read the state file, returning defaults if it doesn't exist."""
        if not self._state_file.exists():
            return {"current_config_version": None, "best_config_version": None}
        return json.loads(self._state_file.read_text(encoding="utf-8"))

    def _write_state(self, state: dict) -> None:
        """Atomically write state to disk."""
        _atomic_write_json(self._state_file, state)

    def save_config(self, config: RAGConfig) -> Path:
        """Save a config version to disk. Returns the file path."""
        path = self._configs_dir / f"config_v{config.version}.json"
        _atomic_write_json(path, config.model_dump(mode="json"))
        return path

    def load_config(self, version: int) -> RAGConfig:
        """Load a specific config version from disk."""
        path = self._configs_dir / f"config_v{version}.json"
        if not path.exists():
            msg = f"Config version {version} not found at {path}"
            raise FileNotFoundError(msg)
        raw = json.loads(path.read_text(encoding="utf-8"))
        return RAGConfig.model_validate(raw)

    def set_current(self, config: RAGConfig) -> None:
        """Mark a config as the current active version.

        Saves the config and updates the state pointer.
        """
        self.save_config(config)
        state = self._read_state()
        state["current_config_version"] = config.version
        self._write_state(state)

    def set_best(self, config: RAGConfig) -> None:
        """Mark a config as the best-scoring version.

        Saves the config and updates both current and best pointers.
        """
        self.save_config(config)
        state = self._read_state()
        state["current_config_version"] = config.version
        state["best_config_version"] = config.version
        self._write_state(state)

    def get_current_config(self) -> RAGConfig | None:
        """Return the active config, or None if no config has been saved."""
        state = self._read_state()
        version = state.get("current_config_version")
        if version is None:
            return None
        return self.load_config(version)

    def get_best_config(self) -> RAGConfig | None:
        """Return the best-scoring config, or None if none recorded."""
        state = self._read_state()
        version = state.get("best_config_version")
        if version is None:
            return None
        return self.load_config(version)

    def rollback(self, version: int) -> RAGConfig:
        """Set a previous version as the current active config.

        The old version file must exist. Does not delete any versions.
        """
        config = self.load_config(version)
        state = self._read_state()
        state["current_config_version"] = version
        self._write_state(state)
        return config

    def list_versions(self) -> list[int]:
        """Return all saved version numbers, sorted ascending."""
        versions: list[int] = []
        for path in self._configs_dir.glob("config_v*.json"):
            stem = path.stem  # "config_v3"
            version_str = stem.removeprefix("config_v")
            try:
                versions.append(int(version_str))
            except ValueError:
                continue
        return sorted(versions)

    def initialize_baseline(self, config: RAGConfig | None = None) -> RAGConfig:
        """Create the initial baseline config if none exists.

        Returns the existing current config if one is already set,
        or saves the provided config (or default) as v1.
        """
        existing = self.get_current_config()
        if existing is not None:
            return existing
        baseline = config if config is not None else RAGConfig()
        self.set_best(baseline)
        return baseline


def _atomic_write_json(path: Path, data: object) -> None:
    """Write JSON atomically using a temp file + rename."""
    path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(data, indent=2, default=str)
    tmp_fd, tmp_path_str = tempfile.mkstemp(
        dir=str(path.parent),
        suffix=".tmp",
    )
    tmp_path = Path(tmp_path_str)
    try:
        tmp_path.write_text(content, encoding="utf-8")
        tmp_path.replace(path)
    except BaseException:
        tmp_path.unlink(missing_ok=True)
        raise
    finally:
        import os
        try:
            os.close(tmp_fd)
        except OSError:
            pass
