"use client";

import { Zap, Moon, Network, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stage {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly sublabel: string;
  readonly description: string;
}

const STAGES: readonly Stage[] = [
  {
    icon: Zap,
    label: "Event Stream",
    sublabel: "<10ms · Append-Only",
    description:
      "Every thought, message, and upload is instantly captured as an immutable event. No LLM calls, no blocking — just fast, reliable storage.",
  },
  {
    icon: Moon,
    label: "Sleep Consolidator",
    sublabel: "Background · Async",
    description:
      "Like human sleep, the consolidator runs offline — extracting entities, resolving contradictions, and building a coherent knowledge graph.",
  },
  {
    icon: Network,
    label: "Temporal Graph",
    sublabel: "Bitemporal · Episodic",
    description:
      "A graph where every edge carries time bounds. Old facts aren't deleted — they're marked with valid_until, preserving full history.",
  },
  {
    icon: FileText,
    label: "Compiled Memory",
    sublabel: "System Prompt · Always Current",
    description:
      "The graph compiles down to a concise markdown summary injected into the agent's system prompt — always up-to-date, zero retrieval latency.",
  },
] as const;

export function ArchitectureSection() {
  return (
    <section className="bg-background py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-balance text-4xl font-semibold text-text-primary mb-4 md:text-5xl">
            How it works.
          </h2>
          <p className="text-lg text-text-secondary max-w-xl">
            Dual-process architecture inspired by human memory consolidation.
          </p>
        </div>

        {/* Horizontal pipeline */}
        <div className="grid md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden">
          {STAGES.map((stage, i) => (
            <div
              key={stage.label}
              className={`relative p-8 bg-background ${i < STAGES.length - 1 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0 border-border" : ""}`}
            >
              {/* Step number */}
              <span className="font-mono text-xs text-text-tertiary mb-5 block">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="size-10 rounded-[var(--radius)] border border-border flex items-center justify-center mb-4">
                <stage.icon className="size-5 text-accent" />
              </div>

              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {stage.label}
              </h3>
              <p className="font-mono text-[11px] text-accent mb-3">
                {stage.sublabel}
              </p>
              <p className="text-xs leading-relaxed text-text-secondary">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
