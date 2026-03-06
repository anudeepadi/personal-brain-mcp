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
  icon: LucideIcon;
  label: string;
  sublabel: string;
  description: string;
  color: string;
}

const STEPS: readonly PipelineStep[] = [
  {
    icon: MessageSquare,
    label: "Chat Input",
    sublabel: "User message arrives",
    description: "A thought, question, or file upload enters the system.",
    color: "#E8A04C",
  },
  {
    icon: Zap,
    label: "System 1 — Fast Path",
    sublabel: "<10ms, no LLM call",
    description: "Event is appended to the immutable stream instantly. No blocking, no extraction.",
    color: "#34D399",
  },
  {
    icon: Database,
    label: "Events Accumulate",
    sublabel: "Append-only log",
    description: "Events pile up in the stream, each with a timestamp and type marker.",
    color: "#34D399",
  },
  {
    icon: Moon,
    label: "System 2 Awakens",
    sublabel: "Background, async",
    description: "The sleep consolidator activates — running offline, never blocking the agent.",
    color: "#818CF8",
  },
  {
    icon: GitBranch,
    label: "Entity Extraction",
    sublabel: "LLM-powered parsing",
    description: "Entities and relationships are extracted from unconsolidated events into graph edges.",
    color: "#818CF8",
  },
  {
    icon: AlertTriangle,
    label: "Contradiction Detection",
    sublabel: "Temporal resolution",
    description: "New facts are compared against existing edges. Contradictions are resolved with valid_until timestamps.",
    color: "#F87171",
  },
  {
    icon: FileText,
    label: "Memory Compilation",
    sublabel: "compiled_memory.md",
    description: "The graph compiles into a concise markdown summary — active facts and superseded history.",
    color: "#34D399",
  },
  {
    icon: RotateCcw,
    label: "Loop Complete",
    sublabel: "System prompt updated",
    description: "Compiled memory is injected into the agent's system prompt. Ground truth is always current.",
    color: "#E8A04C",
  },
] as const;

function StepCard({
  step,
  index,
  progress,
}: {
  step: PipelineStep;
  index: number;
  progress: ReturnType<typeof useTransform<number, number>>;
}) {
  const stepStart = index / STEPS.length;
  const stepEnd = (index + 1) / STEPS.length;

  const opacity = useTransform(progress, [stepStart, stepStart + 0.05, stepEnd], [0.15, 1, 1]);
  const scale = useTransform(progress, [stepStart, stepStart + 0.05, stepEnd], [0.95, 1, 1]);
  const x = useTransform(
    progress,
    [stepStart, stepStart + 0.05],
    [index % 2 === 0 ? -30 : 30, 0],
  );

  return (
    <motion.div
      style={{ opacity, scale, x }}
      className={`flex items-start gap-6 ${
        index % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <div
        className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: `${step.color}15`,
          boxShadow: `0 0 20px ${step.color}30`,
        }}
      >
        <step.icon className="h-7 w-7" style={{ color: step.color }} />
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#E5E7EB] mb-1">{step.label}</h3>
        <p className="text-xs font-mono mb-2" style={{ color: step.color }}>
          {step.sublabel}
        </p>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">{step.description}</p>
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
    <section ref={containerRef} className="bg-[#0A0E1A] py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#E5E7EB] mb-4"
        >
          The Full Pipeline
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-center text-[#9CA3AF] mb-20"
        >
          From chat bubble to updated ground truth — step by step.
        </motion.p>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-7 top-0 bottom-0 w-px hidden md:block overflow-hidden">
            <motion.div
              className="w-full h-full origin-top"
              style={{
                scaleY: lineScale,
                background:
                  "linear-gradient(to bottom, #E8A04C, #34D399, #818CF8, #F87171, #34D399, #E8A04C)",
              }}
            />
          </div>

          <div className="space-y-16 md:pl-20">
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
