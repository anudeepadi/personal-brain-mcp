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
      <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-[0.05em]">
            compiled_memory.md
          </span>
          {contradictionsResolved > 0 && (
            <span className="text-[10px] bg-accent-muted text-accent px-2 py-0.5 rounded-full font-medium">
              {contradictionsResolved} resolved
            </span>
          )}
        </div>
        <button
          onClick={onConsolidate}
          disabled={isConsolidating}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[var(--radius)] bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">
            {compiledMemory}
          </pre>
        ) : (
          <p className="text-xs text-text-tertiary italic">
            No consolidated memory yet. Send some messages and click
            &quot;Consolidate Now&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
