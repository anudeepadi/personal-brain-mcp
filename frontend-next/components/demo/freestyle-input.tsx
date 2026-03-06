"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap } from "lucide-react";

interface FreestyleInputProps {
  readonly unlocked: boolean;
  readonly onInjectFact: (content: string) => void;
}

export function FreestyleInput({ unlocked, onInjectFact }: FreestyleInputProps) {
  const [input, setInput] = useState("");

  function handleInject() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onInjectFact(trimmed);
    setInput("");
  }

  if (!unlocked) {
    return (
      <div className="rounded-xl border border-[#1F2937] p-6 flex items-center justify-center gap-3 bg-[#111827]/50">
        <Lock className="h-5 w-5 text-[#6B7280]" />
        <p className="text-sm text-[#6B7280]">
          Complete the guided demo to unlock freestyle mode
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-[#34D399]/30 p-6 bg-[#34D399]/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-[#34D399]" />
        <span className="text-sm font-semibold text-[#34D399]">
          Freestyle Mode — Try your own contradictions
        </span>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInject()}
          placeholder='e.g. "I moved to San Francisco"'
          className="flex-1 rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-2.5 text-sm text-[#E5E7EB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#34D399] transition-colors"
        />
        <button
          onClick={handleInject}
          disabled={!input.trim()}
          className="shrink-0 px-5 py-2.5 rounded-lg bg-[#34D399] text-[#0A0E1A] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2DD4A8] transition-colors"
        >
          Inject Fact
        </button>
      </div>
    </motion.div>
  );
}
