"""Run numbering, result persistence, and heartbeat summaries."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from mnemonic_autoimprove.engine.config_manager import _atomic_write_json
from mnemonic_autoimprove.models.experiment import ExperimentResult


class RunTracker:
    """Tracks optimization run numbers and persists experiment results.

    Each run gets a monotonically increasing number. Results are stored
    as individual JSON files for easy inspection and auditing.
    """

    def __init__(self, results_dir: Path, state_file: Path) -> None:
        self._results_dir = results_dir
        self._state_file = state_file
        self._results_dir.mkdir(parents=True, exist_ok=True)

    def _read_state(self) -> dict:
        if not self._state_file.exists():
            return {"current_run": 0}
        raw = json.loads(self._state_file.read_text(encoding="utf-8"))
        return raw

    def _write_state(self, state: dict) -> None:
        _atomic_write_json(self._state_file, state)

    def get_current_run_number(self) -> int:
        """Return the current (last completed) run number."""
        return self._read_state().get("current_run", 0)

    def get_next_run_number(self) -> int:
        """Reserve and return the next run number (increments state)."""
        state = self._read_state()
        next_num = state.get("current_run", 0) + 1
        state["current_run"] = next_num
        self._write_state(state)
        return next_num

    def record_result(self, result: ExperimentResult) -> Path:
        """Persist an experiment result as JSON. Returns the file path."""
        path = self._results_dir / f"run_{result.run_number:04d}.json"
        _atomic_write_json(path, result.model_dump(mode="json"))
        return path

    def get_result(self, run_number: int) -> ExperimentResult | None:
        """Load a specific run result, or None if not found."""
        path = self._results_dir / f"run_{run_number:04d}.json"
        if not path.exists():
            return None
        raw = json.loads(path.read_text(encoding="utf-8"))
        return ExperimentResult.model_validate(raw)

    def get_recent_results(self, n: int = 10) -> list[ExperimentResult]:
        """Load the last N results, newest first."""
        current = self.get_current_run_number()
        results: list[ExperimentResult] = []
        for run_num in range(current, max(current - n, 0), -1):
            result = self.get_result(run_num)
            if result is not None:
                results.append(result)
        return results

    def get_statistics(self) -> dict:
        """Aggregate stats across all recorded runs."""
        current = self.get_current_run_number()
        if current == 0:
            return {
                "total_runs": 0,
                "accepted": 0,
                "rejected": 0,
                "acceptance_rate": 0.0,
                "total_cost_usd": 0.0,
                "best_improvement": 0.0,
            }

        total = 0
        accepted = 0
        total_cost = 0.0
        best_improvement = 0.0

        for run_num in range(1, current + 1):
            result = self.get_result(run_num)
            if result is None:
                continue
            total += 1
            if result.accepted:
                accepted += 1
            total_cost += result.cost_estimate_usd
            best_improvement = max(best_improvement, result.improvement)

        return {
            "total_runs": total,
            "accepted": accepted,
            "rejected": total - accepted,
            "acceptance_rate": accepted / total if total > 0 else 0.0,
            "total_cost_usd": round(total_cost, 4),
            "best_improvement": round(best_improvement, 4),
        }

    def generate_heartbeat_summary(
        self,
        best_config_version: int | None = None,
        best_score: float | None = None,
    ) -> str:
        """Format a status summary for OpenClaw heartbeat display."""
        current_run = self.get_current_run_number()

        if current_run == 0:
            return "AutoImprove: No runs yet. Waiting for first experiment."

        lines = [
            f"## AutoImprove Status",
            f"- Current run: #{current_run}",
        ]

        if best_config_version is not None:
            lines.append(f"- Best config: v{best_config_version}")
        if best_score is not None:
            lines.append(f"- Best score: {best_score:.3f}")

        last_result = self.get_result(current_run)
        if last_result is not None:
            lines.append(f"- Last: {last_result.summary()}")

        stats = self.get_statistics()
        lines.append(
            f"- Stats: {stats['accepted']}/{stats['total_runs']} accepted "
            f"(${stats['total_cost_usd']:.2f} total cost)"
        )

        # Recent history table
        recent = self.get_recent_results(5)
        if recent:
            lines.append("")
            lines.append("| Run | Experiment | Delta | Status |")
            lines.append("|-----|-----------|-------|--------|")
            for r in recent:
                status = "ACCEPTED" if r.accepted else "REJECTED"
                sign = "+" if r.improvement >= 0 else ""
                lines.append(
                    f"| #{r.run_number} | {r.experiment_name} "
                    f"| {sign}{r.improvement:.3f} | {status} |"
                )

        return "\n".join(lines)
