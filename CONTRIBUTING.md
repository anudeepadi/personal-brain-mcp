# Contributing to ContextOS

ContextOS is the project name; `personal-brain-mcp` remains the distribution and command.
The root Python project is the maintained packaging entry point.

## Development

```bash
uv sync --extra dev
uv run pytest tests -q
uv run python scripts/check_repository.py
uv build
```

The tests use placeholder configuration and do not call live embedding, vector-store,
or generation services. Live integration checks require your own credentials and a
separate test index. Do not upload personal documents in automated tests.

## Changes and pull requests

Describe the problem, resulting behavior, and validation. Keep changes focused and
add behavioral regression tests for fixes. Report what was mocked, what ran offline,
and what was verified against live providers separately.

MCP services live in `personal_brain_mcp/`; REST services currently have a separate
root implementation. Keep equivalent changes consistent until those copies are
consolidated. Legacy npm and nested Python packaging trees are reference material;
do not build a new release from them.

Never commit `.env`, API keys, real chat exports, uploaded documents, generated logs,
or build artifacts. Preserve source references and license attribution.

## Documentation and artwork

Current guides live in `docs/`. Historical root setup reports are not authoritative.
Regenerate the original SVG artwork with `python scripts/render_brand.py`; inspect both
themes at full size and README width. Source code, documentation, and original graphics
use the repository's MIT license.

## CI

[The CI template](docs/ci.yml.example) validates offline tests, docs, and package builds.
Copy it to `.github/workflows/ci.yml` to activate. The credential used to publish this
update lacks the `workflow` scope, so the configuration ships as a template.

Be respectful, provide actionable feedback, and follow the [community guidelines](CODE_OF_CONDUCT.md).
