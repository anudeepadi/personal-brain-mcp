"use client";

import Link from "next/link";
import { ArchitectureDiagram } from "./architecture-diagram";

const METRICS = [
  { value: "<10ms", label: "ingestion latency" },
  { value: "0ms", label: "compiled recall" },
  { value: "94.2%", label: "recall accuracy" },
  { value: "MIT", label: "license" },
] as const;

export function HeroSection() {
  return (
    <section className="min-h-dvh bg-background flex items-center px-6 py-20">
      <div className="mx-auto max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-mono text-text-secondary">
              <span className="size-1.5 rounded-full bg-success inline-block" />
              Open Source · MCP Server · Claude Desktop
            </span>
          </div>

          <h1 className="font-display text-5xl leading-[1.05] text-text-primary text-balance sm:text-6xl md:text-7xl">
            AI Agents Forget.
            <br />
            Mnemonic <em className="italic text-accent">Remembers.</em>
          </h1>

          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-md">
            Persistent memory for Claude Desktop — semantic search over your
            documents and conversations, grounded answers with citations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link
              href="/brain"
              className="inline-flex items-center rounded-[var(--radius)] bg-text-primary px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              Setup in 60 seconds
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center rounded-[var(--radius)] border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              Documentation
            </Link>
          </div>

          {/* Metrics strip */}
          <div className="mt-10 pt-10 border-t border-border grid grid-cols-4 gap-6">
            {METRICS.map((m) => (
              <div key={m.value}>
                <span className="font-mono text-base font-semibold text-text-primary block leading-none">
                  {m.value}
                </span>
                <span className="text-[11px] text-text-tertiary mt-1 block leading-snug">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — architecture diagram */}
        <div className="hidden md:block">
          <ArchitectureDiagram />
        </div>
      </div>
    </section>
  );
}
