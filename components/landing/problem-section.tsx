"use client";

interface ProblemCard {
  readonly number: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly annotation: string;
}

const PROBLEMS: readonly ProblemCard[] = [
  {
    number: "01",
    slug: "STALE RECALL",
    title: "The Goldfish",
    description:
      "Vector databases return stale facts alongside current ones with no temporal ordering. Every fact looks equally valid.",
    annotation: `query: "where do I live?"
→ Austin (score: 0.87, t=2024-01)
→ NYC    (score: 0.86, t=2024-06)
→ Austin (score: 0.85, t=2024-09)
# no way to know which is current`,
  },
  {
    number: "02",
    slug: "LATENCY SPIKE",
    title: "The Bottleneck",
    description:
      "Synchronous graph extraction blocks the critical path. Every message waits for entity resolution before the agent responds.",
    annotation: `entity_extraction:  847ms ← blocking
llm_call:           1200ms
total_wait:         2047ms / message
p99_overhead:       +2.3s per turn`,
  },
  {
    number: "03",
    slug: "SILENT FAILURE",
    title: "The Forgetter",
    description:
      "Relying on agents to manage their own memory never works reliably. Without external enforcement, it simply doesn't happen.",
    annotation: `memory.save() calls / session: 0
agent_initiated_saves (30d):  0/183
auto_recall_attempts:         0/183
effective_memory_rate:        0.0%`,
  },
] as const;

export function ProblemSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <p className="font-mono text-[11px] text-accent uppercase tracking-[0.08em] mb-3">
            Fig. 3 — The Problem
          </p>
          <h2 className="font-display italic text-3xl text-text-primary mb-3">
            Your AI has <em className="text-accent">amnesia.</em>
          </h2>
          <p className="text-base text-text-secondary max-w-xl">
            Current memory systems share three fundamental failure modes.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-px md:grid-cols-3 bg-border rounded-lg overflow-hidden">
          {PROBLEMS.map((problem) => (
            <div key={problem.title} className="bg-background flex flex-col">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <span className="font-mono text-xs text-text-tertiary">
                  {problem.number}
                </span>
                <span className="font-mono text-[10px] text-accent bg-accent-muted px-1.5 py-0.5 rounded">
                  {problem.slug}
                </span>
              </div>

              {/* Card body */}
              <div className="px-6 py-5 flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary mb-5">
                  {problem.description}
                </p>

                {/* Technical annotation */}
                <pre className="font-mono text-[10px] leading-relaxed text-text-tertiary bg-surface rounded-[var(--radius)] border border-border p-3 overflow-x-auto whitespace-pre-wrap">
                  <code>{problem.annotation}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
