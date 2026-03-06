"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="bg-gradient-to-b from-[#0A0E1A] to-[#111827] py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-[#E5E7EB] mb-6">
          See it in action.
        </h2>
        <p className="text-lg text-[#9CA3AF] mb-10">
          Watch contradictions resolve in real-time, or build your own knowledge brain.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/demo"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-[#818CF8] text-white font-semibold text-base shadow-lg hover:shadow-xl hover:bg-[#6366F1] transition-all duration-200"
          >
            Run the Demo
          </Link>
          <Link
            href="/brain"
            className="inline-flex items-center px-8 py-3 rounded-xl border-2 border-[#1F2937] text-[#E5E7EB] font-semibold text-base hover:border-[#818CF8] hover:text-[#818CF8] transition-all duration-200"
          >
            Build Your Brain
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
