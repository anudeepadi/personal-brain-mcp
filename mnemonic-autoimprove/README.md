# Mnemonic AutoImprove

Self-improving RAG optimization engine inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch).

Autonomously experiments with RAG pipeline parameters (retrieval k, temperature, prompts, search strategy) and keeps only changes that measurably improve retrieval quality. Runs overnight via OpenClaw heartbeats or standalone CLI.

## Quick Start

```bash
pip install mnemonic-autoimprove

# Initialize baseline config
mnemonic-autoimprove status

# Run a single optimization experiment
mnemonic-autoimprove run --golden-set golden_sets/my_golden_set.json

# View history
mnemonic-autoimprove history

# Rollback to previous config
mnemonic-autoimprove rollback --version 3
```

## How It Works

1. **Pick experiment** from catalog (vary k, temperature, prompts, etc.)
2. **Create candidate config** (immutable, versioned)
3. **Evaluate baseline** on 25% sample of golden test set
4. **Evaluate candidate** on same sample
5. **Keep or discard** based on composite RAGAS score improvement (>0.01 threshold)
6. **Log everything** — every run is persisted as JSON for auditing

## License

MIT
