"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import type { CompetitorResult } from "@/lib/demo-scenario";

interface ScoreboardProps {
  readonly results: readonly CompetitorResult[];
  readonly visible: boolean;
}

function StatusIcon({ ok }: { ok: boolean | "partial" }) {
  if (ok === true) return <Check className="h-4 w-4 text-[#34D399]" />;
  if (ok === "partial") return <Minus className="h-4 w-4 text-[#FBBF24]" />;
  return <X className="h-4 w-4 text-[#F87171]" />;
}

export function Scoreboard({ results, visible }: ScoreboardProps) {
  if (!visible || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-[#1F2937] overflow-hidden"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1F2937] bg-[#111827]">
            <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">System</th>
            <th className="text-center px-4 py-3 text-[#9CA3AF] font-medium">Ingestion Latency</th>
            <th className="text-center px-4 py-3 text-[#9CA3AF] font-medium">Contradictions Resolved</th>
            <th className="text-center px-4 py-3 text-[#9CA3AF] font-medium">Temporal Trail</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isOurs = r.name === "Subconscious";
            return (
              <tr
                key={r.name}
                className={`border-b border-[#1F2937] last:border-b-0 ${
                  isOurs ? "bg-[#34D399]/5" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-[#E5E7EB]">{r.name}</td>
                <td className="text-center px-4 py-3 font-mono text-xs text-[#E5E7EB]">
                  {r.latency}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <span className="font-mono text-xs text-[#E5E7EB]">
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
