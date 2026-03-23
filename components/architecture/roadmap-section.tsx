"use client";

import { Check, Circle, Github, Star } from "lucide-react";

interface PhaseItem {
  readonly label: string;
  readonly done: boolean;
}

interface Phase {
  readonly number: string;
  readonly name: string;
  readonly subtitle: string;
  readonly status: "current" | "next" | "future";
  readonly items: readonly PhaseItem[];
}

const PHASES: readonly Phase[] = [
  {
    number: "0",
    name: "Foundation",
    subtitle: "Current sprint",
    status: "current",
    items: [
      { label: "Clean repo structure (archive old files)", done: true },
      { label: "Technical architecture document", done: true },
      { label: "Next.js frontend with component library", done: true },
      { label: "3-panel brain dashboard", done: true },
      { label: "Sharp Editorial design system", done: true },
      { label: "mnemonic-autoimprove RAG optimizer", done: true },
      { label: "Unit test framework setup", done: false },
    ],
  },
  {
    number: "1",
    name: "Wire + Auth",
    subtitle: "Next sprint",
    status: "next",
    items: [
      { label: "PostgreSQL schema + Alembic migrations", done: false },
      { label: "JWT authentication middleware", done: false },
      { label: "Connect frontend to backend (/chat/enhanced, /upsert)", done: false },
      { label: "CORS lockdown + rate limiting via Redis", done: false },
      { label: "Error handling + retry logic in frontend", done: false },
      { label: "CI/CD pipeline (GitHub Actions)", done: false },
      { label: "Docker Compose for local dev", done: false },
    ],
  },
  {
    number: "2",
    name: "Memory Engine",
    subtitle: "Three-tier implementation",
    status: "future",
    items: [
      { label: "Three-tier memory model (Episodic → Semantic → Identity)", done: false },
      { label: "Async consolidation pipeline", done: false },
      { label: "Contradiction detection & temporal resolution", done: false },
      { label: "Neo4j knowledge graph integration", done: false },
      { label: "MCP protocol v2 (7 operations)", done: false },
      { label: "WebSocket support for real-time updates", done: false },
    ],
  },
  {
    number: "3",
    name: "Platform",
    subtitle: "Multi-user & analytics",
    status: "future",
    items: [
      { label: "Multi-user + team memory", done: false },
      { label: "Analytics dashboard (ClickHouse)", done: false },
      { label: "Python + TypeScript SDK", done: false },
      { label: "Plugin system", done: false },
      { label: "OAuth / SSO", done: false },
      { label: "Billing integration (open core model)", done: false },
    ],
  },
] as const;

const STATUS_STYLE: Record<string, string> = {
  current: "border-accent/40 bg-accent-muted",
  next: "border-border bg-background",
  future: "border-border bg-background",
};

const STATUS_LABEL: Record<string, string> = {
  current: "text-accent",
  next: "text-text-tertiary",
  future: "text-text-tertiary",
};

export function RoadmapSection() {
  return (
    <>
      {/* ── Roadmap ── */}
      <section className="bg-surface py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
              // ROADMAP
            </p>
            <h2 className="text-3xl font-semibold text-text-primary mb-3">
              What&apos;s being built.
            </h2>
            <p className="text-base text-text-secondary max-w-xl">
              Four phases from working prototype to production memory platform.
              Phase 0 is complete — phases 1-3 are sequenced for minimum viable
              wiring first, intelligence second.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {PHASES.map((phase) => (
              <div
                key={phase.number}
                className={`rounded-lg border p-5 ${STATUS_STYLE[phase.status]}`}
              >
                {/* Phase header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-text-tertiary">
                        Phase {phase.number}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${STATUS_LABEL[phase.status]}`}
                      >
                        {phase.status === "current"
                          ? "● IN PROGRESS"
                          : phase.status === "next"
                            ? "○ NEXT"
                            : "○ FUTURE"}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      {phase.name}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {phase.subtitle}
                    </p>
                  </div>
                  {/* Progress */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs text-text-tertiary">
                      {phase.items.filter((i) => i.done).length}/
                      {phase.items.length}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item.label} className="flex items-start gap-2.5">
                      {item.done ? (
                        <Check className="size-3.5 text-success mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="size-3.5 text-border-strong mt-0.5 shrink-0" />
                      )}
                      <span
                        className={`text-xs leading-snug ${
                          item.done
                            ? "text-text-tertiary line-through"
                            : "text-text-secondary"
                        }`}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get Involved ── */}
      <section className="bg-background border-t border-border py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-5">
            // GET INVOLVED
          </p>
          <h2 className="font-display italic text-balance text-4xl text-text-primary mb-4">
            Open source memory infrastructure.
          </h2>
          <p className="text-base text-text-secondary mb-8 max-w-sm mx-auto leading-relaxed">
            Mnemonic is built in the open. Star the repo, open an issue, or
            contribute a consolidation strategy.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/anudeepadi/personal-brain-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-text-primary px-6 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              <Github className="size-4" />
              View on GitHub
            </a>
            <a
              href="https://github.com/anudeepadi/personal-brain-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              <Star className="size-4" />
              Star on GitHub
            </a>
          </div>
          <p className="mt-8 font-mono text-[11px] text-text-tertiary">
            pip install personal-brain-mcp
          </p>
        </div>
      </section>
    </>
  );
}
