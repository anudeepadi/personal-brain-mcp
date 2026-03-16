"""CLI entry point for mnemonic-autoimprove."""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

import click

from mnemonic_autoimprove.engine.config_manager import ConfigManager
from mnemonic_autoimprove.engine.run_tracker import RunTracker


def _default_storage_dir() -> Path:
    return Path.cwd() / ".autoimprove"


@click.group()
@click.option(
    "--storage-dir",
    type=click.Path(path_type=Path),
    default=None,
    help="Override storage directory (default: .autoimprove/)",
)
@click.pass_context
def main(ctx: click.Context, storage_dir: Path | None) -> None:
    """Mnemonic AutoImprove — self-improving RAG optimization engine."""
    ctx.ensure_object(dict)
    sd = storage_dir or _default_storage_dir()
    ctx.obj["storage_dir"] = sd
    ctx.obj["config_manager"] = ConfigManager(sd)
    ctx.obj["run_tracker"] = RunTracker(
        results_dir=sd / "results",
        state_file=sd / "state.json",
    )


@main.command()
@click.option("--golden-set", type=click.Path(exists=True, path_type=Path), required=True)
@click.option("--sample-fraction", type=float, default=0.25)
@click.option("--adapter", type=click.Choice(["mnemonic", "mock"]), default="mock")
@click.pass_context
def run(ctx: click.Context, golden_set: Path, sample_fraction: float, adapter: str) -> None:
    """Run a single optimization experiment."""
    from mnemonic_autoimprove.evaluation.evaluator import RAGEvaluator
    from mnemonic_autoimprove.experiments.catalog import ExperimentCatalog
    from mnemonic_autoimprove.engine.optimizer import AutoImproveOptimizer
    from mnemonic_autoimprove.models.golden_set import GoldenTestSet

    gs = GoldenTestSet.from_json_file(golden_set)
    cm = ctx.obj["config_manager"]
    rt = ctx.obj["run_tracker"]
    cm.initialize_baseline()

    # Load tried experiments from history
    catalog = ExperimentCatalog()
    for result in rt.get_recent_results(100):
        catalog.mark_tried(result.experiment_name)

    if adapter == "mock":
        from tests.test_evaluator import MockAdapter, MockJudge
        rag_adapter = MockAdapter()
        judge = MockJudge()
    else:
        import os
        from mnemonic_autoimprove.adapters.mnemonic import MnemonicAdapter
        from mnemonic_autoimprove.evaluation.judges import GeminiFlashJudge
        rag_adapter = MnemonicAdapter()
        judge = GeminiFlashJudge(api_key=os.environ.get("GOOGLE_API_KEY", ""))

    evaluator = RAGEvaluator(judge=judge)

    optimizer = AutoImproveOptimizer(
        adapter=rag_adapter,
        evaluator=evaluator,
        catalog=catalog,
        config_manager=cm,
        run_tracker=rt,
        golden_set=gs,
        sample_fraction=sample_fraction,
    )

    result = asyncio.run(optimizer.run_single_experiment())
    if result is None:
        click.echo("All experiments exhausted. Nothing to do.")
        click.echo("HEARTBEAT_OK")
    else:
        click.echo(result.summary())


@main.command()
@click.pass_context
def status(ctx: click.Context) -> None:
    """Show current optimization status."""
    cm: ConfigManager = ctx.obj["config_manager"]
    rt: RunTracker = ctx.obj["run_tracker"]

    current_run = rt.get_current_run_number()
    best = cm.get_best_config()
    stats = rt.get_statistics()

    click.echo("Mnemonic AutoImprove Status")
    click.echo("=" * 40)
    click.echo(f"Current run:      #{current_run}")
    click.echo(f"Best config:      v{best.version}" if best else "Best config:      (none)")
    click.echo(f"Total runs:       {stats['total_runs']}")
    click.echo(f"Accepted:         {stats['accepted']}")
    click.echo(f"Rejected:         {stats['rejected']}")
    click.echo(f"Acceptance rate:  {stats['acceptance_rate']:.1%}")
    click.echo(f"Total cost:       ${stats['total_cost_usd']:.2f}")
    click.echo(f"Best improvement: {stats['best_improvement']:.4f}")


@main.command()
@click.option("-n", "--count", type=int, default=10)
@click.pass_context
def history(ctx: click.Context, count: int) -> None:
    """Show recent experiment results."""
    rt: RunTracker = ctx.obj["run_tracker"]
    results = rt.get_recent_results(count)

    if not results:
        click.echo("No experiments recorded yet.")
        return

    click.echo(f"Last {len(results)} experiments:")
    click.echo("-" * 60)
    for r in results:
        click.echo(r.summary())


@main.command()
@click.option("--version", "target_version", type=int, required=True)
@click.pass_context
def rollback(ctx: click.Context, target_version: int) -> None:
    """Rollback to a previous config version."""
    cm: ConfigManager = ctx.obj["config_manager"]
    try:
        config = cm.rollback(target_version)
        click.echo(f"Rolled back to config v{config.version}")
    except FileNotFoundError:
        click.echo(f"Error: Config version {target_version} not found.", err=True)
        sys.exit(1)


@main.command()
@click.pass_context
def heartbeat(ctx: click.Context) -> None:
    """Generate heartbeat summary for OpenClaw."""
    cm: ConfigManager = ctx.obj["config_manager"]
    rt: RunTracker = ctx.obj["run_tracker"]

    best = cm.get_best_config()
    summary = rt.generate_heartbeat_summary(
        best_config_version=best.version if best else None,
    )
    click.echo(summary)


if __name__ == "__main__":
    main()
