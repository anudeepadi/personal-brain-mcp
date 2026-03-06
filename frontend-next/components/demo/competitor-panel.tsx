"use client";

import { Check, X, Clock } from "lucide-react";
import type { CompetitorResult } from "@/lib/demo-scenario";

interface CompetitorPanelProps {
  readonly results: readonly CompetitorResult[];
}

const HEADER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "Vector-Only": { bg: "bg-[#F87171]/10", border: "border-[#F87171]/30", text: "text-[#F87171]" },
  "Sync Graph": { bg: "bg-[#FBBF24]/10", border: "border-[#FBBF24]/30", text: "text-[#FBBF24]" },
  "Subconscious": { bg: "bg-[#34D399]/10", border: "border-[#34D399]/30", text: "text-[#34D399]" },
};

export function CompetitorPanel({ results }: CompetitorPanelProps) {
  if (results.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {["Vector-Only", "Sync Graph", "Subconscious"].map((name) => {
          const colors = HEADER_COLORS[name]!;
          return (
            <div key={name} className={`rounded-xl border ${colors.border} p-4`}>
              <h3 className={`text-sm font-semibold ${colors.text} mb-3`}>{name}</h3>
              <p className="text-xs text-[#6B7280] italic">Waiting for facts...</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {results.map((result) => {
        const colors = HEADER_COLORS[result.name] ?? HEADER_COLORS["Vector-Only"]!;
        const activeFacts = result.facts.filter((f) => f.active);
        const superseded = result.facts.filter((f) => !f.active);

        return (
          <div key={result.name} className={`rounded-xl border ${colors.border} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${colors.text}`}>{result.name}</h3>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-[#9CA3AF]" />
                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  {result.latency}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {activeFacts.map((fact, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-[#E5E7EB]"
                >
                  <Check className="h-3 w-3 text-[#34D399] shrink-0 mt-0.5" />
                  <span>{fact.content}</span>
                </div>
              ))}
            </div>

            {superseded.length > 0 && (
              <div className="border-t border-[#1F2937] pt-2 space-y-1.5">
                {superseded.map((fact, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-[#6B7280] line-through"
                  >
                    <X className="h-3 w-3 text-[#F87171] shrink-0 mt-0.5" />
                    <span>{fact.content}</span>
                    {fact.valid_until && (
                      <span className="text-[10px] font-mono text-[#F87171] shrink-0">
                        superseded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-[#1F2937] flex items-center justify-between">
              <span className="text-[10px] text-[#9CA3AF]">Resolved</span>
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
