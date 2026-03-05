"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 4,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-[#E8A04C]/20"
          style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 bg-[#FEFCF8] overflow-hidden">
      <Particles />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <Brain className="h-16 w-16 mx-auto text-[#E8A04C]" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-bold tracking-tight text-[#1A1A1A] mb-6"
        >
          Subconscious
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-[#6B6B6B] mb-4 font-medium"
        >
          Memory that consolidates, not just accumulates.
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-[#6B6B6B] mb-10 max-w-xl mx-auto"
        >
          A dual-process memory engine for AI agents — fast append at runtime,
          intelligent consolidation offline.
        </motion.p>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/brain"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-[#E8A04C] text-white font-semibold text-base shadow-lg hover:shadow-xl hover:bg-[#d4902f] transition-all duration-200"
          >
            Try the Brain
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center px-8 py-3 rounded-xl border-2 border-[#E8E4DE] text-[#1A1A1A] font-semibold text-base hover:border-[#E8A04C] hover:text-[#E8A04C] transition-all duration-200"
          >
            Watch the Demo
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
