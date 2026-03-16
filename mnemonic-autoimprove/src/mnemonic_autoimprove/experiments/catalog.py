"""Registry of all predefined experiments for the optimization loop."""

from __future__ import annotations

from mnemonic_autoimprove.experiments.prompts import PROMPT_EXPERIMENTS
from mnemonic_autoimprove.experiments.retrieval import RETRIEVAL_EXPERIMENTS
from mnemonic_autoimprove.experiments.temperature import TEMPERATURE_EXPERIMENTS
from mnemonic_autoimprove.models.experiment import ExperimentSpec


class ExperimentCatalog:
    """Registry of predefined experiments, with selection logic.

    Tracks which experiments have been tried to avoid repeats.
    """

    def __init__(self, experiments: list[ExperimentSpec] | None = None) -> None:
        self._experiments = experiments or self._default_experiments()
        self._tried: set[str] = set()

    @staticmethod
    def _default_experiments() -> list[ExperimentSpec]:
        """Return all built-in experiments."""
        return [
            *RETRIEVAL_EXPERIMENTS,
            *TEMPERATURE_EXPERIMENTS,
            *PROMPT_EXPERIMENTS,
        ]

    @property
    def total_count(self) -> int:
        return len(self._experiments)

    @property
    def remaining_count(self) -> int:
        return len(self._experiments) - len(self._tried)

    @property
    def all_exhausted(self) -> bool:
        return self.remaining_count <= 0

    def mark_tried(self, experiment_name: str) -> None:
        """Mark an experiment as tried (won't be selected again)."""
        self._tried.add(experiment_name)

    def reset(self) -> None:
        """Clear the tried set — allows re-running all experiments."""
        self._tried.clear()

    def select_next(self) -> ExperimentSpec | None:
        """Return the next untried experiment, or None if all exhausted.

        Iterates through experiments in catalog order (retrieval → temperature → prompts).
        """
        for spec in self._experiments:
            if spec.name not in self._tried:
                return spec
        return None

    def get_by_name(self, name: str) -> ExperimentSpec | None:
        """Look up a specific experiment by name."""
        for spec in self._experiments:
            if spec.name == name:
                return spec
        return None

    def get_by_category(self, category: str) -> list[ExperimentSpec]:
        """Return all experiments in a given category."""
        return [s for s in self._experiments if s.category == category]

    def list_all(self) -> list[dict]:
        """Return all experiments with their tried status."""
        return [
            {
                "name": spec.name,
                "category": spec.category,
                "description": spec.description,
                "tried": spec.name in self._tried,
            }
            for spec in self._experiments
        ]
