"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Upload, Lightbulb } from "lucide-react";
import type { MemoryEvent } from "@/lib/use-memory-engine";

const TYPE_ICONS = {
  chat: MessageSquare,
  upload: Upload,
  thought: Lightbulb,
} as const;

interface EventStreamProps {
  readonly events: readonly MemoryEvent[];
}

export function EventStream({ events }: EventStreamProps) {
  const visibleEvents = events.slice(-20);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-[#1F2937]">
        <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
          Event Stream
        </span>
        <span className="text-xs font-mono bg-[#1F2937] text-[#34D399] px-2 py-0.5 rounded-full">
          {events.length} events
        </span>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {visibleEvents.map((event) => {
            const Icon = TYPE_ICONS[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-[#1F2937]/50 group"
              >
                <div className="relative shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  {!event.consolidated && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#34D399] pulse-dot" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#E5E7EB] truncate">
                    {event.content}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#6B7280]">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] font-mono text-[#34D399]">
                      &lt;10ms
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
