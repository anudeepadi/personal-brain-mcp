"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import type { CompetitorResult } from "@/lib/demo-scenario";

interface ScoreboardProps {
  readonly results: readonly CompetitorResult[];
  readonly visible: boolean;
}

function StatusIcon({ ok }: { ok: boolean | "partial" }) {
  if (ok === true) return <Check className="h-4 w-4 text-success" />;
  if (ok === "partial") return <Minus className="h-4 w-4 text-amber-500" />;
  return <X className="h-4 w-4 text-danger" />;
}

export function Scoreboard({ results, visible }: ScoreboardProps) {
  if (!visible || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[var(--radius)] border border-border overflow-hidden"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="text-left px-4 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">
              System
            </th>
            <th className="text-center px-4 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
              Ingestion Latency
            </th>
            <th className="text-center px-4 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
              Contradictions Resolved
            </th>
            <th className="text-center px-4 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
              Temporal Trail
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isOurs = r.name === "Mnemonic";
            return (
              <tr
                key={r.name}
                className={`border-b border-border last:border-b-0 ${
                  isOurs ? "bg-accent-muted border-l-2 border-l-accent" : "bg-background"
                }`}
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {r.name}
                </td>
                <td className="text-center px-4 py-3 font-mono text-xs text-text-primary">
                  {r.latency}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <span className="font-mono text-xs text-text-primary">
                      {r.contradictionsResolved}/3
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <StatusIcon
                      ok={
                        r.temporalTrail
                          ? true
                          : r.name === "Sync Graph"
                            ? "partial"
                            : false
                      }
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
