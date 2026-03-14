"use client";

import { Check, X, Minus } from "lucide-react";

type CellValue = "yes" | "no" | "partial" | string;

interface Row {
  readonly name: string;
  readonly ours?: boolean;
  readonly latency: string;
  readonly contradiction: CellValue;
  readonly async: CellValue;
  readonly local: CellValue;
  readonly openSource: CellValue;
}

const ROWS: readonly Row[] = [
  {
    name: "Mnemonic",
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

function CellIcon({ value }: { readonly value: CellValue }) {
  if (value === "yes")
    return <Check className="size-4 text-success mx-auto" />;
  if (value === "no")
    return <X className="size-4 text-danger mx-auto" />;
  if (value === "partial")
    return <Minus className="size-4 text-text-tertiary mx-auto" />;
  return (
    <span className="tabular-nums font-mono text-xs text-text-primary">
      {value}
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="bg-surface py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-balance text-4xl font-semibold text-text-primary mb-4 md:text-5xl">
            How we compare.
          </h2>
          <p className="text-lg text-text-secondary max-w-xl">
            The only memory system with async consolidation and temporal
            contradiction resolution.
          </p>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-6 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                    System
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="text-center px-4 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider whitespace-nowrap"
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
                    className={`border-b border-border last:border-b-0 ${
                      row.ours
                        ? "bg-accent-muted border-l-2 border-l-accent"
                        : "bg-background"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                      {row.name}
                      {row.ours && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider font-mono bg-accent text-background px-1.5 py-0.5 rounded-sm">
                          ours
                        </span>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="tabular-nums font-mono text-xs text-text-primary">
                        {row.latency}
                      </span>
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
        </div>
      </div>
    </section>
  );
}
