"""Stratified sampling of golden test sets for token-efficient evaluation."""

from __future__ import annotations

import random
from math import ceil

from mnemonic_autoimprove.models.golden_set import GoldenTestCase, GoldenTestSet


class GoldenSetSampler:
    """Samples a fraction of the golden test set with stratification by difficulty.

    Ensures each difficulty level is proportionally represented in the sample.
    Uses a fixed seed per run_number for reproducibility across baseline/candidate.
    """

    def sample(
        self,
        golden_set: GoldenTestSet,
        fraction: float = 0.25,
        seed: int | None = None,
    ) -> list[GoldenTestCase]:
        """Return a stratified sample of the golden set.

        Args:
            golden_set: The full set to sample from.
            fraction: Proportion to sample (0.0–1.0). Minimum 1 case returned.
            seed: Random seed for reproducibility.

        Returns:
            Sampled list of test cases.
        """
        if not 0.0 < fraction <= 1.0:
            msg = f"fraction must be in (0.0, 1.0], got {fraction}"
            raise ValueError(msg)

        if fraction >= 1.0:
            return list(golden_set.cases)

        rng = random.Random(seed)

        # Group by difficulty
        buckets: dict[str, list[GoldenTestCase]] = {}
        for case in golden_set.cases:
            buckets.setdefault(case.difficulty, []).append(case)

        total_target = max(1, ceil(len(golden_set.cases) * fraction))
        sampled: list[GoldenTestCase] = []

        # Sample proportionally from each bucket
        for difficulty, cases in buckets.items():
            bucket_target = max(1, round(len(cases) / len(golden_set.cases) * total_target))
            bucket_target = min(bucket_target, len(cases))
            sampled.extend(rng.sample(cases, bucket_target))

        # If we overshot, trim. If undershot, add more from largest bucket.
        if len(sampled) > total_target:
            rng.shuffle(sampled)
            sampled = sampled[:total_target]
        elif len(sampled) < total_target:
            remaining = [c for c in golden_set.cases if c not in sampled]
            needed = min(total_target - len(sampled), len(remaining))
            sampled.extend(rng.sample(remaining, needed))

        return sampled


def sample_for_run(
    golden_set: GoldenTestSet,
    run_number: int,
    fraction: float = 0.25,
) -> list[GoldenTestCase]:
    """Convenience: sample with run_number as seed for reproducibility."""
    return GoldenSetSampler().sample(golden_set, fraction=fraction, seed=run_number)
