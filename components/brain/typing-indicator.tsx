"use client";

/**
 * Pulsing amber dots typing indicator.
 * Shown while waiting for first chunk from SSE stream.
 */
export function TypingIndicator() {
  return (
    <div
      className="flex justify-start"
      role="status"
      aria-label="Thinking..."
    >
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-[var(--radius)] bg-surface border border-border">
        <span
          data-testid="typing-dot"
          className="size-2 rounded-full bg-accent animate-pulse"
          style={{ animationDelay: "0ms" }}
        />
        <span
          data-testid="typing-dot"
          className="size-2 rounded-full bg-accent animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <span
          data-testid="typing-dot"
          className="size-2 rounded-full bg-accent animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
