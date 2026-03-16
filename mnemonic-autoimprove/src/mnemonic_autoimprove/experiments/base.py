"""Base experiment interface."""

from __future__ import annotations

from mnemonic_autoimprove.models.config import RAGConfig
from mnemonic_autoimprove.models.experiment import ExperimentSpec


def apply_experiment(config: RAGConfig, spec: ExperimentSpec) -> RAGConfig:
    """Apply an experiment's parameter changes to a config, returning a new version.

    This is the core function that connects experiments to configs.
    It creates an evolved config with the experiment's changes applied.
    """
    return config.evolve(**spec.parameter_changes)
