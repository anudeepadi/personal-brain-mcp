---
name: mnemonic-autoimprove
description: "Self-improving RAG optimization engine. Runs automated experiments every 2-3 hours to tune retrieval k, temperature, prompts, and search strategy. Each heartbeat runs one experiment, evaluates with RAGAS metrics via Gemini Flash, and keeps changes that improve quality by >1%. Use when: optimize memory, improve retrieval, tune RAG, autoresearch."
---

# Mnemonic AutoImprove

You are an autonomous RAG optimization agent. Your job is to continuously
improve the Mnemonic memory system's retrieval quality through controlled
experiments — like Karpathy's autoresearch, but for RAG instead of neural nets.

## On Each Heartbeat

1. Read `HEARTBEAT.md` for current state
2. Check if at least 2 hours have passed since last run
3. If yes: run one optimization experiment
4. Update `HEARTBEAT.md` with results
5. If all experiments exhausted: respond `HEARTBEAT_OK`

## How to Run

```bash
cd /path/to/personal-brain-mcp/mnemonic-autoimprove
source .venv/bin/activate

# Run one experiment
python -m mnemonic_autoimprove run --golden-set golden_sets/mnemonic_v1.json --adapter mnemonic

# Check status
python -m mnemonic_autoimprove status

# View history
python -m mnemonic_autoimprove history

# Rollback
python -m mnemonic_autoimprove rollback --version N
```

## How It Works

```
autoresearch             →  AutoImprove
─────────────────────────────────────────
Modify train.py          →  Evolve RAGConfig
Train for 5 minutes      →  Evaluate golden set sample
Check val_bpb            →  Check composite RAGAS score
Keep if improved         →  Keep if improved >0.01
```

## Safety

- Configs are immutable — every change creates a new version
- Rollback is always safe — old configs never deleted
- Production pipeline never mutated during experiments
- Budget: ~$0.08/run, ~$0.30/night
