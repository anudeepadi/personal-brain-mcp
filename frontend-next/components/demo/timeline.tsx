"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { DemoFact } from "@/lib/demo-scenario";

interface TimelineProps {
  readonly facts: readonly DemoFact[];
  readonly currentStep: number;
}

export function Timeline({ facts, currentStep }: TimelineProps) {
  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center gap-3 min-w-max px-4">
        <AnimatePresence initial={false}>
          {facts.map((fact, i) => {
            const isActive = fact.step === currentStep;
            return (
              <motion.div
                key={fact.step}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative shrink-0 w-56 rounded-xl border p-4 transition-colors ${
                  isActive
                    ? "border-[#818CF8] bg-[#818CF8]/10"
                    : "border-[#1F2937] bg-[#111827]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    t={fact.step - 1}
                  </span>
                  {fact.contradicts !== undefined && (
                    <span className="flex items-center gap-1 text-[10px] text-[#F87171]">
                      <AlertTriangle className="h-3 w-3" />
                      contradicts t={fact.contradicts - 1}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#E5E7EB] leading-snug">
                  {fact.content}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {facts.length === 0 && (
          <p className="text-sm text-[#6B7280] italic">
            Press Play or Step to begin the demo...
          </p>
        )}
      </div>
    </div>
  );
}
