"use client";

import { useEffect } from "react";

interface MemoryToastProps {
  readonly content: string;
  readonly visible: boolean;
  readonly onDismiss: () => void;
}

const DISMISS_DELAY_MS = 4000;
const MAX_CONTENT_LENGTH = 60;

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) {
    return content;
  }
  return content.slice(0, MAX_CONTENT_LENGTH) + "...";
}

/**
 * "Memory just formed" toast notification.
 * Amber left border, Geist Mono content, auto-dismisses after 4 seconds.
 */
export function MemoryToast({ content, visible, onDismiss }: MemoryToastProps) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(onDismiss, DISMISS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <div
      data-testid="memory-toast"
      className="fixed bottom-6 right-6 z-50 max-w-sm border-l-2 border-l-accent border border-border bg-background rounded-[var(--radius)] px-4 py-3 shadow-md animate-fade-up"
    >
      <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-accent font-medium mb-1">
        MEMORY STORED
      </span>
      <span
        data-testid="memory-toast-content"
        className="block font-mono text-[11px] text-text-secondary leading-snug"
      >
        {truncateContent(content)}
      </span>
    </div>
  );
}
