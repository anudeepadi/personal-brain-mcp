"use client";

import { Zap, Moon, Network, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stage {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly sublabel: string;
  readonly spec: string;
  readonly description: string;
}

const STAGES: readonly Stage[] = [
  {
    icon: Zap,
    label: "Event Stream",
    sublabel: "<10ms · Append-Only",
    spec: "no LLM call",
    description:
      "Every message, upload, and thought is instantly written as an immutable event. Zero blocking — the agent never waits.",
  },
  {
    icon: Moon,
    label: "Sleep Consolidator",
    sublabel: "Async · Background",
    spec: "runs offline",
    description:
      "Like human sleep, consolidation runs offline — extracting entities, resolving contradictions, updating the temporal graph.",
  },
  {
    icon: Network,
    label: "Temporal Graph",
    sublabel: "Bitemporal · Episodic",
    spec: "valid_until edges",
    description:
      "Every graph edge carries time bounds. Old facts aren't deleted — they're marked with valid_until, preserving full history.",
  },
  {
    icon: FileText,
    label: "Compiled Memory",
    sublabel: "System Prompt · Live",
    spec: "0ms retrieval",
    description:
      "The graph compiles to a concise markdown summary injected into the system prompt — always current, no retrieval step.",
  },
] as const;

export function ArchitectureSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <p className="font-mono text-[11px] text-accent uppercase tracking-[0.08em] mb-3">
            Fig. 4 — Architecture
          </p>
          <h2 className="font-display italic text-3xl text-text-primary mb-3">
            How it works.
          </h2>
          <p className="text-base text-text-secondary max-w-xl">
            Dual-process architecture inspired by human memory consolidation.
            Fast append at runtime, intelligent consolidation offline.
          </p>
        </div>

        {/* Horizontal pipeline */}
        <div className="grid md:grid-cols-4 bg-border rounded-lg overflow-hidden gap-px">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="bg-background flex flex-col">
              {/* Stage header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <span className="font-mono text-xs text-text-tertiary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {stage.spec}
                </span>
              </div>

              {/* Stage body */}
              <div className="px-5 py-5 flex-1 flex flex-col">
                {/* Icon */}
                <div className="size-9 rounded-[var(--radius)] bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <stage.icon className="size-4 text-accent" />
                </div>

                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  {stage.label}
                </h3>

                {/* Sublabel chip */}
                <span className="inline-flex font-mono text-[10px] text-accent bg-accent-muted rounded px-2 py-0.5 mb-3 self-start">
                  {stage.sublabel}
                </span>

                <p className="text-xs leading-relaxed text-text-secondary flex-1">
                  {stage.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="px-5 pb-4">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((dot) => (
                    <span
                      key={dot}
                      className={`h-px flex-1 ${dot <= i ? "bg-accent" : "bg-border"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
