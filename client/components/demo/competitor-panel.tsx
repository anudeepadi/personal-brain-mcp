"use client";

import { Check, X, Clock } from "lucide-react";
import type { CompetitorResult } from "@/lib/demo-scenario";

interface CompetitorPanelProps {
  readonly results: readonly CompetitorResult[];
}

const HEADER_COLORS: Record<
  string,
  { border: string; text: string; bg: string }
> = {
  "Vector-Only": {
    border: "border-danger/30",
    text: "text-danger",
    bg: "bg-danger/5",
  },
  "Sync Graph": {
    border: "border-amber-500/30",
    text: "text-amber-600",
    bg: "bg-amber-500/5",
  },
  Mnemonic: {
    border: "border-accent/30",
    text: "text-accent",
    bg: "bg-accent-muted",
  },
};

export function CompetitorPanel({ results }: CompetitorPanelProps) {
  if (results.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {["Vector-Only", "Sync Graph", "Mnemonic"].map((name) => {
          const colors = HEADER_COLORS[name] ?? HEADER_COLORS["Vector-Only"]!;
          return (
            <div
              key={name}
              className={`rounded-[var(--radius)] border ${colors.border} p-4 bg-background`}
            >
              <h3 className={`text-sm font-semibold ${colors.text} mb-3`}>
                {name}
              </h3>
              <p className="text-xs text-text-tertiary italic">
                Waiting for facts...
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {results.map((result) => {
        const colors =
          HEADER_COLORS[result.name] ?? HEADER_COLORS["Vector-Only"]!;
        const activeFacts = result.facts.filter((f) => f.active);
        const superseded = result.facts.filter((f) => !f.active);

        return (
          <div
            key={result.name}
            className={`rounded-[var(--radius)] border ${colors.border} ${colors.bg} p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${colors.text}`}>
                {result.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-text-tertiary" />
                <span className="text-[10px] font-mono text-text-tertiary">
                  {result.latency}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {activeFacts.map((fact, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-text-primary"
                >
                  <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />
                  <span>{fact.content}</span>
                </div>
              ))}
            </div>

            {superseded.length > 0 && (
              <div className="border-t border-border pt-2 space-y-1.5">
                {superseded.map((fact, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-text-tertiary line-through"
                  >
                    <X className="h-3 w-3 text-danger shrink-0 mt-0.5" />
                    <span>{fact.content}</span>
                    {fact.valid_until && (
                      <span className="text-[10px] font-mono text-danger shrink-0">
                        superseded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-text-tertiary">Resolved</span>
              <span className={`text-xs font-mono ${colors.text}`}>
                {result.contradictionsResolved}/3
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
