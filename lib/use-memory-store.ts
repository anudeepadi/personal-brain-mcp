"use client";

import { useState, useRef, useCallback } from "react";
import {
  createMemoryEngine,
  type MemoryEvent,
  type GraphNode,
  type GraphEdge,
  type ConsolidationResult,
  type MemoryEngine,
} from "./use-memory-engine";

export interface MemoryStore {
  readonly events: readonly MemoryEvent[];
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly compiledMemory: string;
  readonly lastConsolidation: ConsolidationResult | null;
  readonly isConsolidating: boolean;
  readonly eventCount: number;
  appendEvent: (content: string, type?: MemoryEvent["type"]) => MemoryEvent;
  consolidate: () => Promise<ConsolidationResult>;
  reset: () => void;
}

export function useMemoryStore(): MemoryStore {
  const engineRef = useRef<MemoryEngine>(createMemoryEngine());

  const [events, setEvents] = useState<readonly MemoryEvent[]>([]);
  const [nodes, setNodes] = useState<readonly GraphNode[]>([]);
  const [edges, setEdges] = useState<readonly GraphEdge[]>([]);
  const [compiledMemory, setCompiledMemory] = useState("");
  const [lastConsolidation, setLastConsolidation] =
    useState<ConsolidationResult | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [eventCount, setEventCount] = useState(0);

  const syncState = useCallback(() => {
    const engine = engineRef.current;
    const evts = engine.getEvents();
    const graph = engine.getGraph();
    setEvents(evts);
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setCompiledMemory(engine.getCompiledMemory());
    setEventCount(evts.length);
  }, []);

  const appendEvent = useCallback(
    (content: string, type: MemoryEvent["type"] = "chat"): MemoryEvent => {
      const event = engineRef.current.appendEvent(content, type);
      syncState();
      return event;
    },
    [syncState],
  );

  const consolidate = useCallback(async (): Promise<ConsolidationResult> => {
    setIsConsolidating(true);

    // Visual delay to show consolidation animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = engineRef.current.consolidate();
    setLastConsolidation(result);
    syncState();
    setIsConsolidating(false);
    return result;
  }, [syncState]);

  const reset = useCallback(() => {
    engineRef.current.reset();
    setEvents([]);
    setNodes([]);
    setEdges([]);
    setCompiledMemory("");
    setLastConsolidation(null);
    setIsConsolidating(false);
    setEventCount(0);
  }, []);

  return {
    events,
    nodes,
    edges,
    compiledMemory,
    lastConsolidation,
    isConsolidating,
    eventCount,
    appendEvent,
    consolidate,
    reset,
  };
}
