"""LLM temperature experiments."""

from __future__ import annotations

from mnemonic_autoimprove.models.experiment import ExperimentSpec

TEMPERATURE_EXPERIMENTS: list[ExperimentSpec] = [
    ExperimentSpec(
        name="temp_0.1",
        description="Very deterministic — minimal creativity, maximum consistency",
        parameter_changes={"temperature": 0.1},
        category="temperature",
    ),
    ExperimentSpec(
        name="temp_0.5",
        description="Moderate creativity — balance between consistency and variation",
        parameter_changes={"temperature": 0.5},
        category="temperature",
    ),
    ExperimentSpec(
        name="temp_0.7",
        description="High creativity — more varied responses",
        parameter_changes={"temperature": 0.7},
        category="temperature",
    ),
]
