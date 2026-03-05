"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Fish, Hourglass, BrainCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProblemCard {
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
}

const PROBLEMS: readonly ProblemCard[] = [
  {
    icon: Fish,
    color: "#E8A04C",
    title: "The Goldfish",
    description:
      "Vector databases return stale facts alongside current ones. Ask \"Where do I live?\" and get three different cities — with no way to know which is current.",
  },
  {
    icon: Hourglass,
    color: "#4A90D9",
    title: "The Bottleneck",
    description:
      "Synchronous graph extraction blocks the critical path. Every message waits 800ms+ for entity resolution before the agent can respond.",
  },
  {
    icon: BrainCog,
    color: "#818CF8",
    title: "The Forgetter",
    description:
      "Relying on agents to actively manage their own memory is like asking someone to take notes while sleeping. It never happens reliably.",
  },
] as const;

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    ["#FEFCF8", "#FEFCF8", "#0A0E1A", "#0A0E1A"],
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    ["#1A1A1A", "#1A1A1A", "#E5E7EB", "#E5E7EB"],
  );

  const mutedColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    ["#6B6B6B", "#6B6B6B", "#9CA3AF", "#9CA3AF"],
  );

  return (
    <motion.section
      ref={sectionRef}
      style={{ backgroundColor: bgColor }}
      className="py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          style={{ color: textColor }}
          className="text-4xl md:text-5xl font-bold text-center mb-4"
        >
          Your AI has amnesia
        </motion.h2>
        <motion.p
          style={{ color: mutedColor }}
          className="text-lg text-center mb-16 max-w-2xl mx-auto"
        >
          Current memory systems all share the same fundamental flaws.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {PROBLEMS.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative rounded-2xl p-8 backdrop-blur-xl border border-white/10 bg-white/5"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${problem.color}20` }}
              >
                <problem.icon className="h-6 w-6" style={{ color: problem.color }} />
              </div>
              <motion.h3
                style={{ color: textColor }}
                className="text-xl font-bold mb-3"
              >
                {problem.title}
              </motion.h3>
              <motion.p style={{ color: mutedColor }} className="text-sm leading-relaxed">
                {problem.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
