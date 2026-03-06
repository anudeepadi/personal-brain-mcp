"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Moon, Network, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stage {
  icon: LucideIcon;
  color: string;
  glowClass: string;
  label: string;
  sublabel: string;
  description: string;
  side: "left" | "right";
}

const STAGES: readonly Stage[] = [
  {
    icon: Zap,
    color: "#34D399",
    glowClass: "glow-green",
    label: "Event Stream",
    sublabel: "<10ms, Append-Only",
    description:
      "Every thought, message, and upload is instantly captured as an immutable event. No LLM calls, no blocking — just fast, reliable storage.",
    side: "left",
  },
  {
    icon: Moon,
    color: "#818CF8",
    glowClass: "glow-indigo",
    label: "Sleep Consolidator",
    sublabel: "Background, Async",
    description:
      "Like human sleep, the consolidator runs offline — extracting entities, resolving contradictions, and building a coherent knowledge graph.",
    side: "right",
  },
  {
    icon: Network,
    color: "#818CF8",
    glowClass: "glow-indigo",
    label: "Temporal Graph",
    sublabel: "Bitemporal, Episodic",
    description:
      "A graph where every edge carries time bounds. Old facts aren't deleted — they're marked with valid_until, preserving the full history.",
    side: "left",
  },
  {
    icon: FileText,
    color: "#34D399",
    glowClass: "glow-green",
    label: "Compiled Memory",
    sublabel: "System Prompt, Always Current",
    description:
      "The graph compiles down to a concise markdown summary injected into the agent's system prompt — always up-to-date, zero retrieval latency.",
    side: "right",
  },
] as const;

function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const fromX = stage.side === "left" ? -60 : 60;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: fromX }}
      animate={isInView ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className={`flex items-start gap-6 ${
        stage.side === "right" ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <div
        className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${stage.glowClass}`}
        style={{ backgroundColor: `${stage.color}15` }}
      >
        <stage.icon className="h-7 w-7" style={{ color: stage.color }} />
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-[#E5E7EB] mb-1">{stage.label}</h3>
        <p className="text-xs font-mono text-[#818CF8] mb-2">{stage.sublabel}</p>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">{stage.description}</p>
      </div>
    </motion.div>
  );
}

export function ArchitectureSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  return (
    <section className="bg-[#0A0E1A] py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#E5E7EB] mb-4"
        >
          How it works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-center text-[#9CA3AF] mb-20"
        >
          Dual-process architecture inspired by human memory consolidation.
        </motion.p>

        <div className="relative">
          {/* Vertical connecting line */}
          <div
            ref={lineRef}
            className="absolute left-7 top-0 bottom-0 w-px hidden md:block"
          >
            <motion.div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(to bottom, #34D399, #818CF8, #818CF8, #34D399)",
              }}
              initial={{ scaleY: 0 }}
              animate={lineInView ? { scaleY: 1 } : undefined}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="origin-top"
            />
          </div>

          <div className="space-y-16 md:pl-20">
            {STAGES.map((stage, i) => (
              <StageCard key={stage.label} stage={stage} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
