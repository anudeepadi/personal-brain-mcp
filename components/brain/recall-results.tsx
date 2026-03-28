"use client";

import type { SearchResultItem } from "@/lib/api";

interface RecallResultsProps {
  readonly results: readonly SearchResultItem[];
}

/**
 * Renders search results from /recall mode as memory cards.
 * Each card shows content, relevance score (amber badge), and document ID.
 */
export function RecallResults({ results }: RecallResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-sm text-text-tertiary">No memories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((item) => (
        <div
          key={item.documentId}
          data-testid="recall-card"
          className="bg-surface border border-border rounded-[var(--radius)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-text-primary leading-relaxed flex-1">
              {item.content}
            </p>
            <span
              data-testid="relevance-badge"
              className="shrink-0 bg-accent/10 text-accent font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border border-accent/20"
            >
              {item.relevanceScore.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              {item.documentId}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
