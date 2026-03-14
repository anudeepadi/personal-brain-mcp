"use client";

import { EventStream } from "./event-stream";
import { TemporalGraph } from "./temporal-graph";
import { CompiledMemory } from "./compiled-memory";
import type {
  MemoryEvent,
  GraphNode,
  GraphEdge,
} from "@/lib/use-memory-engine";

interface MemoryDashboardProps {
  readonly events: readonly MemoryEvent[];
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly compiledMemory: string;
  readonly isConsolidating: boolean;
  readonly contradictionsResolved: number;
  readonly onConsolidate: () => void;
}

export function MemoryDashboard({
  events,
  nodes,
  edges,
  compiledMemory,
  isConsolidating,
  contradictionsResolved,
  onConsolidate,
}: MemoryDashboardProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Event Stream — 40% */}
      <div className="h-[40%] border-b border-border">
        <EventStream events={events} />
      </div>

      {/* Temporal Graph — 35% */}
      <div className="h-[35%] border-b border-border">
        <TemporalGraph
          nodes={nodes}
          edges={edges}
          isConsolidating={isConsolidating}
        />
      </div>

      {/* Compiled Memory — 25% */}
      <div className="h-[25%]">
        <CompiledMemory
          compiledMemory={compiledMemory}
          isConsolidating={isConsolidating}
          contradictionsResolved={contradictionsResolved}
          onConsolidate={onConsolidate}
        />
      </div>
    </div>
  );
}
