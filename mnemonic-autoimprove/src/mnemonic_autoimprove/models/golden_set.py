from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class GoldenTestCase(BaseModel):
    """A single ground-truth test case for RAG evaluation.

    Each case has a query, expected answer, and the ideal contexts
    that should be retrieved.
    """

    model_config = ConfigDict(frozen=True)

    case_id: str
    query: str
    expected_answer: str
    expected_contexts: list[str] = Field(default_factory=list)
    difficulty: str = "medium"  # "easy" | "medium" | "hard"
    category: str = "general"
    metadata: dict[str, Any] = Field(default_factory=dict)


class GoldenTestSet(BaseModel):
    """A versioned collection of golden test cases.

    Loaded from JSON, used as the evaluation ground truth.
    """

    model_config = ConfigDict(frozen=True)

    name: str
    version: str
    cases: list[GoldenTestCase]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def from_json_file(cls, path: Path) -> GoldenTestSet:
        """Load a golden test set from a JSON file."""
        raw = json.loads(path.read_text(encoding="utf-8"))
        return cls.model_validate(raw)

    def filter_by_difficulty(self, difficulty: str) -> list[GoldenTestCase]:
        """Return cases matching the given difficulty level."""
        return [c for c in self.cases if c.difficulty == difficulty]

    def filter_by_category(self, category: str) -> list[GoldenTestCase]:
        """Return cases matching the given category."""
        return [c for c in self.cases if c.category == category]
