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
      <div className="rounded-[var(--radius)] border border-border p-6 flex items-center justify-center gap-3 bg-surface">
        <Lock className="h-4 w-4 text-text-tertiary" />
        <p className="text-sm text-text-tertiary">
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
      className="rounded-[var(--radius)] border border-success/30 p-6 bg-success/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">
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
          className="flex-1 rounded-[var(--radius)] border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-success/40 transition-colors"
        />
        <button
          onClick={handleInject}
          disabled={!input.trim()}
          className="shrink-0 px-5 py-2.5 rounded-[var(--radius)] bg-success text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Inject Fact
        </button>
      </div>
    </motion.div>
  );
}
