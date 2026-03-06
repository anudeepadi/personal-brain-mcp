"use client";

import { FileText, RefreshCw } from "lucide-react";

interface CompiledMemoryProps {
  readonly compiledMemory: string;
  readonly isConsolidating: boolean;
  readonly contradictionsResolved: number;
  readonly onConsolidate: () => void;
}

export function CompiledMemory({
  compiledMemory,
  isConsolidating,
  contradictionsResolved,
  onConsolidate,
}: CompiledMemoryProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-[#9CA3AF]" />
          <span className="text-xs font-mono text-[#9CA3AF]">compiled_memory.md</span>
          {contradictionsResolved > 0 && (
            <span className="text-[10px] bg-[#818CF8]/20 text-[#818CF8] px-2 py-0.5 rounded-full">
              {contradictionsResolved} resolved
            </span>
          )}
        </div>
        <button
          onClick={onConsolidate}
          disabled={isConsolidating}
          className="flex items-center gap-1.5 text-xs text-[#818CF8] hover:text-[#6366F1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw
            className={`h-3 w-3 ${isConsolidating ? "animate-spin" : ""}`}
          />
          Consolidate Now
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {compiledMemory ? (
          <pre className="text-xs font-mono text-[#E5E7EB] whitespace-pre-wrap leading-relaxed">
            {compiledMemory}
          </pre>
        ) : (
          <p className="text-xs text-[#6B7280] italic">
            No consolidated memory yet. Send some messages and click &quot;Consolidate Now&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
