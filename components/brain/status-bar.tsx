"use client";

interface StatusBarProps {
  readonly memoryCount: number;
  readonly searchCount: number;
  readonly sessionDuration: string;
}

/**
 * MCP status bar with live session stats.
 * Shows: Mnemonic branding, connection status, memory/search/session counts.
 */
export function StatusBar({
  memoryCount,
  searchCount,
  sessionDuration,
}: StatusBarProps) {
  return (
    <div className="shrink-0 bg-surface border-b border-border flex items-center justify-between px-5 py-2">
      <div className="flex items-center gap-3">
        <span className="font-display italic text-sm text-accent">
          Mnemonic
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="font-mono text-[10px] text-text-tertiary">
            MCP Connected
          </span>
        </span>
        <span className="text-border-strong select-none">·</span>
        <span className="font-mono text-[10px] text-text-tertiary">
          Pinecone
        </span>
        <span className="text-border-strong select-none">·</span>
        <span className="font-mono text-[10px] text-text-tertiary">
          Gemini Flash
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px]">
          <span className="text-accent font-medium">{memoryCount}</span>
          <span className="text-text-tertiary"> memories</span>
        </span>
        <span className="text-border-strong select-none">·</span>
        <span className="font-mono text-[10px]">
          <span className="text-accent font-medium">{searchCount}</span>
          <span className="text-text-tertiary"> searches</span>
        </span>
        <span className="text-border-strong select-none">·</span>
        <span className="font-mono text-[10px]">
          <span className="text-accent font-medium">{sessionDuration}</span>
          <span className="text-text-tertiary"> session</span>
        </span>
        <span className="size-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-accent" />
        </span>
      </div>
    </div>
  );
}
