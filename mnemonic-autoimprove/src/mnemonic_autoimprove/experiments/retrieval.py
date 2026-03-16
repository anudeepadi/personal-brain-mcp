"""Retrieval parameter experiments — k, search type, reranking."""

from __future__ import annotations

from mnemonic_autoimprove.models.experiment import ExperimentSpec

RETRIEVAL_EXPERIMENTS: list[ExperimentSpec] = [
    ExperimentSpec(
        name="retrieval_k_3",
        description="Fewer chunks for more focused, precise retrieval",
        parameter_changes={"retrieval_k": 3},
        category="retrieval",
    ),
    ExperimentSpec(
        name="retrieval_k_7",
        description="More chunks for broader coverage",
        parameter_changes={"retrieval_k": 7},
        category="retrieval",
    ),
    ExperimentSpec(
        name="retrieval_k_10",
        description="Many chunks for maximum context coverage",
        parameter_changes={"retrieval_k": 10},
        category="retrieval",
    ),
    ExperimentSpec(
        name="mmr_search",
        description="Maximal Marginal Relevance for diverse retrieval results",
        parameter_changes={"search_type": "mmr"},
        category="retrieval",
    ),
    ExperimentSpec(
        name="mmr_search_k_7",
        description="MMR search with increased k for diversity + coverage",
        parameter_changes={"search_type": "mmr", "retrieval_k": 7},
        category="retrieval",
    ),
]
