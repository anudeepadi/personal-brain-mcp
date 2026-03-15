"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MessageSquare,
  Zap,
  Database,
  Moon,
  GitBranch,
  AlertTriangle,
  FileText,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PipelineStep {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly sublabel: string;
  readonly description: string;
}

const STEPS: readonly PipelineStep[] = [
  {
    icon: MessageSquare,
    label: "Chat Input",
    sublabel: "User message arrives",
    description: "A thought, question, or file upload enters the system.",
  },
  {
    icon: Zap,
    label: "System 1 — Fast Path",
    sublabel: "<10ms, no LLM call",
    description:
      "Event is appended to the immutable stream instantly. No blocking, no extraction.",
  },
  {
    icon: Database,
    label: "Events Accumulate",
    sublabel: "Append-only log",
    description:
      "Events pile up in the stream, each with a timestamp and type marker.",
  },
  {
    icon: Moon,
    label: "System 2 Awakens",
    sublabel: "Background, async",
    description:
      "The sleep consolidator activates — running offline, never blocking the agent.",
  },
  {
    icon: GitBranch,
    label: "Entity Extraction",
    sublabel: "LLM-powered parsing",
    description:
      "Entities and relationships are extracted from unconsolidated events into graph edges.",
  },
  {
    icon: AlertTriangle,
    label: "Contradiction Detection",
    sublabel: "Temporal resolution",
    description:
      "New facts are compared against existing edges. Contradictions are resolved with valid_until timestamps.",
  },
  {
    icon: FileText,
    label: "Memory Compilation",
    sublabel: "compiled_memory.md",
    description:
      "The graph compiles into a concise markdown summary — active facts and superseded history.",
  },
  {
    icon: RotateCcw,
    label: "Loop Complete",
    sublabel: "System prompt updated",
    description:
      "Compiled memory is injected into the agent's system prompt. Ground truth is always current.",
  },
] as const;

function StepCard({
  step,
  index,
  progress,
}: {
  readonly step: PipelineStep;
  readonly index: number;
  readonly progress: ReturnType<typeof useTransform<number, number>>;
}) {
  const stepStart = index / STEPS.length;
  const stepEnd = (index + 1) / STEPS.length;

  const opacity = useTransform(
    progress,
    [stepStart, stepStart + 0.05, stepEnd],
    [0.2, 1, 1],
  );
  const scale = useTransform(
    progress,
    [stepStart, stepStart + 0.05, stepEnd],
    [0.96, 1, 1],
  );
  const x = useTransform(
    progress,
    [stepStart, stepStart + 0.05],
    [index % 2 === 0 ? -24 : 24, 0],
  );

  return (
    <motion.div
      style={{ opacity, scale, x }}
      className={`flex items-start gap-6 ${
        index % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <div className="shrink-0 size-12 rounded-[var(--radius)] border border-border flex items-center justify-center bg-background">
        <step.icon className="size-5 text-accent" />
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-text-primary mb-1">
          {step.label}
        </h3>
        <p className="text-xs font-mono text-accent mb-2">{step.sublabel}</p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export function PipelineAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineScale = useTransform(scrollYProgress, [0.05, 0.9], [0, 1]);

  return (
    <section ref={containerRef} className="bg-background py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
            // PIPELINE
          </p>
          <h2 className="text-3xl font-semibold text-text-primary mb-3">
            The Full Pipeline
          </h2>
          <p className="text-base text-text-secondary max-w-xl">
            From chat bubble to updated ground truth — step by step.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-px hidden md:block overflow-hidden">
            <motion.div
              className="w-full h-full origin-top bg-border"
              style={{ scaleY: lineScale }}
            />
          </div>

          <div className="space-y-14 md:pl-20">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.label}
                step={step}
                index={i}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
