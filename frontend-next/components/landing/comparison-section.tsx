"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

type CellValue = "yes" | "no" | "partial" | string;

interface Row {
  name: string;
  ours?: boolean;
  latency: string;
  contradiction: CellValue;
  async: CellValue;
  local: CellValue;
  openSource: CellValue;
}

const ROWS: readonly Row[] = [
  {
    name: "Subconscious",
    ours: true,
    latency: "<10ms",
    contradiction: "yes",
    async: "yes",
    local: "yes",
    openSource: "yes",
  },
  {
    name: "mem0",
    latency: "<10ms",
    contradiction: "no",
    async: "no",
    local: "partial",
    openSource: "yes",
  },
  {
    name: "SuperMemory",
    latency: "~200ms",
    contradiction: "partial",
    async: "no",
    local: "no",
    openSource: "no",
  },
  {
    name: "Zep / Graphiti",
    latency: "800ms+",
    contradiction: "partial",
    async: "no",
    local: "no",
    openSource: "partial",
  },
  {
    name: "MemGPT / Letta",
    latency: "~500ms",
    contradiction: "no",
    async: "partial",
    local: "yes",
    openSource: "yes",
  },
] as const;

const COLUMNS = [
  "Ingestion Latency",
  "Contradiction Resolution",
  "Async Consolidation",
  "Local-First",
  "Open Source",
] as const;

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") return <Check className="h-5 w-5 text-[#34D399]" />;
  if (value === "no") return <X className="h-5 w-5 text-[#F87171]" />;
  if (value === "partial") return <Minus className="h-5 w-5 text-[#9CA3AF]" />;
  return <span className="font-mono text-sm text-[#E5E7EB]">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section className="bg-[#0A0E1A] py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#E5E7EB] mb-4"
        >
          How we compare
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-center text-[#9CA3AF] mb-16"
        >
          The only memory system with async consolidation and temporal contradiction resolution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-[#1F2937] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#111827]">
                  <th className="text-left px-6 py-4 text-[#9CA3AF] font-medium">System</th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="text-center px-4 py-4 text-[#9CA3AF] font-medium whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[#1F2937] last:border-b-0 ${
                      row.ours ? "bg-[#818CF8]/5 border-l-2 border-l-[#818CF8]" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-[#E5E7EB] whitespace-nowrap">
                      {row.name}
                      {row.ours && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider bg-[#818CF8]/20 text-[#818CF8] px-2 py-0.5 rounded-full">
                          ours
                        </span>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="font-mono text-sm text-[#E5E7EB]">{row.latency}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <CellIcon value={row.contradiction} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <CellIcon value={row.async} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <CellIcon value={row.local} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <CellIcon value={row.openSource} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
