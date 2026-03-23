"use client";

import { Check, Clock } from "lucide-react";

interface Tier {
  readonly number: string;
  readonly label: string;
  readonly sublabel: string;
  readonly writeLatency: string;
  readonly writePath: string;
  readonly readPath: string;
  readonly storage: string;
  readonly description: string;
  readonly status: "active" | "planned";
}

const TIERS: readonly Tier[] = [
  {
    number: "01",
    label: "Episodic",
    sublabel: "Short-term · Append-only",
    writeLatency: "<10ms",
    writePath: "Real-time, no LLM call",
    readPath: "Recent N events",
    storage: "Append-only event log",
    description:
      "Every message, upload, and thought is instantly written as an immutable event. Zero blocking — the agent never waits for acknowledgement.",
    status: "active",
  },
  {
    number: "02",
    label: "Semantic",
    sublabel: "Long-term · Graph + Vectors",
    writeLatency: "async",
    writePath: "Consolidation pipeline",
    readPath: "Semantic search",
    storage: "Knowledge graph + vectors",
    description:
      "Facts, entities, and relationships extracted from episodic events. Graph edges carry valid_until timestamps so contradictions are never silently deleted.",
    status: "planned",
  },
  {
    number: "03",
    label: "Identity",
    sublabel: "Core self · Compiled profile",
    writeLatency: "async",
    writePath: "Consolidation → merge",
    readPath: "Direct lookup",
    storage: "Compiled profile JSON",
    description:
      "Persistent user profile compiled from semantic memory. Injected into every system prompt as ground truth — no retrieval step, zero latency.",
    status: "planned",
  },
] as const;

interface Layer {
  readonly level: string;
  readonly name: string;
  readonly items: readonly string[];
  readonly status: "live" | "partial" | "planned";
}

const LAYERS: readonly Layer[] = [
  {
    level: "L5",
    name: "Applications",
    items: ["Web Dashboard", "Claude Desktop MCP", "SDK / API Clients"],
    status: "partial",
  },
  {
    level: "L4",
    name: "API Gateway",
    items: ["FastAPI · Auth · Rate Limiting"],
    status: "partial",
  },
  {
    level: "L3",
    name: "Memory Engine",
    items: ["Episodic Memory", "Semantic Memory", "Identity Memory"],
    status: "partial",
  },
  {
    level: "L2",
    name: "Processing",
    items: [
      "Document Parser",
      "Embedding Pipeline",
      "Consolidation Engine",
      "Contradiction Resolver",
    ],
    status: "planned",
  },
  {
    level: "L1",
    name: "Storage",
    items: ["Pinecone / Qdrant", "PostgreSQL", "Neo4j", "Redis"],
    status: "partial",
  },
] as const;

const MCP_OPS = [
  {
    op: "memory.append",
    desc: "Write event to episodic memory",
    latency: "<10ms",
    status: "live" as const,
  },
  {
    op: "memory.search",
    desc: "Semantic search across all tiers",
    latency: "~50ms",
    status: "live" as const,
  },
  {
    op: "memory.consolidate",
    desc: "Trigger offline consolidation",
    latency: "async",
    status: "live" as const,
  },
  {
    op: "memory.recall",
    desc: "Retrieve specific memory by ID",
    latency: "<5ms",
    status: "planned" as const,
  },
  {
    op: "memory.forget",
    desc: "Mark memory entry for removal",
    latency: "<10ms",
    status: "planned" as const,
  },
  {
    op: "memory.compile",
    desc: "Rebuild identity summary from graph",
    latency: "~200ms",
    status: "planned" as const,
  },
  {
    op: "memory.status",
    desc: "Health check and usage stats",
    latency: "<5ms",
    status: "live" as const,
  },
] as const;

const STATUS_LAYER: Record<string, string> = {
  live: "text-success bg-success/10",
  partial: "text-accent bg-accent-muted",
  planned: "text-text-tertiary bg-surface-raised",
};

export function MemoryTiersSection() {
  return (
    <>
      {/* ── Three-Tier Memory ── */}
      <section className="bg-background py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              // THREE-TIER MEMORY
            </p>
            <h2 className="text-3xl font-semibold text-text-primary mb-3">
              How memory is structured.
            </h2>
            <p className="text-base text-text-secondary max-w-xl">
              Inspired by human memory consolidation — fast writes at runtime,
              intelligent promotion offline. Three tiers, one coherent brain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 bg-border rounded-lg overflow-hidden gap-px">
            {TIERS.map((tier) => (
              <div key={tier.label} className="bg-background flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <span className="font-mono text-xs text-text-tertiary">
                    {tier.number}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      tier.status === "active"
                        ? "text-success bg-success/10"
                        : "text-text-tertiary bg-surface-raised"
                    }`}
                  >
                    {tier.status === "active" ? "● ACTIVE" : "○ PLANNED"}
                  </span>
                </div>

                {/* Body */}
                <div className="px-5 py-5 flex-1 flex flex-col">
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    {tier.label}
                  </h3>
                  <span className="font-mono text-[10px] text-accent bg-accent-muted rounded px-2 py-0.5 mb-3 self-start">
                    {tier.sublabel}
                  </span>
                  <p className="text-xs leading-relaxed text-text-secondary mb-5 flex-1">
                    {tier.description}
                  </p>

                  {/* Spec table */}
                  <div className="space-y-1.5 text-[11px] font-mono border-t border-border pt-3">
                    <div className="flex justify-between gap-2">
                      <span className="text-text-tertiary">write latency</span>
                      <span className="text-text-primary">{tier.writeLatency}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-text-tertiary">write path</span>
                      <span className="text-text-primary text-right">{tier.writePath}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-text-tertiary">read path</span>
                      <span className="text-text-primary">{tier.readPath}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-text-tertiary">storage</span>
                      <span className="text-text-primary text-right">{tier.storage}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Five-Layer Architecture ── */}
      <section className="bg-surface py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              // FIVE LAYERS
            </p>
            <h2 className="text-3xl font-semibold text-text-primary mb-3">
              The full stack.
            </h2>
            <p className="text-base text-text-secondary max-w-xl">
              Each layer has a single responsibility. Applications talk to the
              API gateway. The gateway talks to the memory engine. Storage is
              pluggable.
            </p>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            {LAYERS.map((layer, i) => (
              <div
                key={layer.level}
                className={`flex items-center gap-0 ${i < LAYERS.length - 1 ? "border-b border-border" : ""}`}
              >
                {/* Level */}
                <div className="shrink-0 w-16 px-5 py-4 border-r border-border bg-surface-raised">
                  <span className="font-mono text-xs text-text-tertiary">
                    {layer.level}
                  </span>
                </div>

                {/* Name */}
                <div className="shrink-0 w-44 px-5 py-4 border-r border-border bg-background">
                  <span className="text-sm font-semibold text-text-primary">
                    {layer.name}
                  </span>
                </div>

                {/* Items */}
                <div className="flex-1 px-5 py-4 bg-background flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[11px] text-text-secondary border border-border rounded px-2 py-0.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Status */}
                <div className="shrink-0 px-5 py-4 bg-background">
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${STATUS_LAYER[layer.status]}`}
                  >
                    {layer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MCP Protocol ── */}
      <section className="bg-background py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              // MCP PROTOCOL
            </p>
            <h2 className="text-3xl font-semibold text-text-primary mb-3">
              7 core operations.
            </h2>
            <p className="text-base text-text-secondary max-w-xl">
              A minimal, well-defined interface for agents to interact with
              memory. Each operation maps to exactly one memory tier.
            </p>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-surface-raised border-b border-border grid grid-cols-[1fr_2fr_5rem_5rem] text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              <div className="px-5 py-3">Operation</div>
              <div className="px-4 py-3">Description</div>
              <div className="px-4 py-3">Latency</div>
              <div className="px-4 py-3">Status</div>
            </div>
            {MCP_OPS.map((op, i) => (
              <div
                key={op.op}
                className={`grid grid-cols-[1fr_2fr_5rem_5rem] items-center ${i < MCP_OPS.length - 1 ? "border-b border-border" : ""} bg-background`}
              >
                <div className="px-5 py-3.5">
                  <span className="font-mono text-xs text-text-primary">
                    {op.op}
                  </span>
                </div>
                <div className="px-4 py-3.5">
                  <span className="text-xs text-text-secondary">{op.desc}</span>
                </div>
                <div className="px-4 py-3.5">
                  <span className="font-mono text-xs text-text-primary tabular-nums">
                    {op.latency}
                  </span>
                </div>
                <div className="px-4 py-3.5">
                  {op.status === "live" ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-success">
                      <Check className="size-3" /> live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-text-tertiary">
                      <Clock className="size-3" /> planned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 font-mono text-[10px] text-text-tertiary text-right">
            * "live" = implemented in current MCP server · "planned" = Phase 2
          </p>
        </div>
      </section>
    </>
  );
}
