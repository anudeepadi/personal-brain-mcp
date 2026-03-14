export interface MemoryEvent {
  readonly id: string;
  readonly content: string;
  readonly type: "chat" | "upload" | "thought";
  readonly timestamp: string;
  readonly consolidated: boolean;
}

export interface GraphNode {
  readonly id: string;
  readonly label: string;
  readonly type: "user" | "entity";
  readonly valid_until?: string;
}

export interface GraphEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly relation: string;
  readonly valid_until?: string;
}

export interface ConsolidationResult {
  readonly newNodes: readonly GraphNode[];
  readonly newEdges: readonly GraphEdge[];
  readonly contradictionsResolved: number;
}

export interface MemoryEngine {
  appendEvent(content: string, type: MemoryEvent["type"]): MemoryEvent;
  consolidate(): ConsolidationResult;
  getEvents(): readonly MemoryEvent[];
  getGraph(): { readonly nodes: readonly GraphNode[]; readonly edges: readonly GraphEdge[] };
  getCompiledMemory(): string;
  reset(): void;
}

interface FactExtraction {
  readonly field: string;
  readonly value: string;
}

const FACT_PATTERNS: readonly { field: string; pattern: RegExp }[] = [
  { field: "location", pattern: /(?:I\s+)?(?:live\s+in|moved\s+to|I'm\s+in|still\s+in|living\s+in)\s+(.+?)(?:\.|,|$)/i },
  { field: "employer", pattern: /(?:I\s+)?(?:work\s+at|switched\s+to|joined|started\s+at|employed\s+at|working\s+at)\s+(.+?)(?:\s+as\s+|\.|,|$)/i },
  { field: "role", pattern: /(?:I\s+)?(?:work\s+as\s+(?:a\s+)?|I'm\s+a\s+|my\s+role\s+is\s+)(.+?)(?:\.|,|$)/i },
  { field: "preference", pattern: /(?:I\s+)?(?:prefer|love|enjoy|like)\s+(.+?)(?:\.|,|$)/i },
];

function extractFacts(content: string): readonly FactExtraction[] {
  const results: FactExtraction[] = [];
  for (const { field, pattern } of FACT_PATTERNS) {
    const match = content.match(pattern);
    if (match?.[1]) {
      results.push({ field, value: match[1].trim() });
    }
  }
  return results;
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export function createMemoryEngine(): MemoryEngine {
  let events: MemoryEvent[] = [];
  let nodes: GraphNode[] = [{ id: "user", label: "You", type: "user" }];
  let edges: GraphEdge[] = [];

  function appendEvent(content: string, type: MemoryEvent["type"]): MemoryEvent {
    const event: MemoryEvent = {
      id: nextId("evt"),
      content,
      type,
      timestamp: new Date().toISOString(),
      consolidated: false,
    };
    events = [...events, event];
    return event;
  }

  function consolidate(): ConsolidationResult {
    const unconsolidated = events.filter((e) => !e.consolidated);
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];
    let contradictionsResolved = 0;
    const now = new Date().toISOString();

    for (const event of unconsolidated) {
      const facts = extractFacts(event.content);

      for (const fact of facts) {
        // Check for existing active edges with same field (contradiction)
        const existingActive = edges.filter(
          (e) => e.relation === fact.field && e.valid_until === undefined,
        );

        if (existingActive.length > 0) {
          // Supersede old nodes and edges
          for (const oldEdge of existingActive) {
            edges = edges.map((e) =>
              e.id === oldEdge.id ? { ...e, valid_until: now } : e,
            );
            nodes = nodes.map((n) =>
              n.id === oldEdge.target ? { ...n, valid_until: now } : n,
            );
          }
          contradictionsResolved += existingActive.length;
        }

        // Add new node and edge
        const nodeId = nextId("node");
        const newNode: GraphNode = {
          id: nodeId,
          label: fact.value,
          type: "entity",
        };
        const newEdge: GraphEdge = {
          id: nextId("edge"),
          source: "user",
          target: nodeId,
          relation: fact.field,
        };

        nodes = [...nodes, newNode];
        edges = [...edges, newEdge];
        newNodes.push(newNode);
        newEdges.push(newEdge);
      }
    }

    // Mark events as consolidated
    events = events.map((e) =>
      e.consolidated ? e : { ...e, consolidated: true },
    );

    return { newNodes, newEdges, contradictionsResolved };
  }

  function getEvents(): readonly MemoryEvent[] {
    return events;
  }

  function getGraph() {
    return { nodes: nodes as readonly GraphNode[], edges: edges as readonly GraphEdge[] };
  }

  function getCompiledMemory(): string {
    const activeEdges = edges.filter((e) => e.valid_until === undefined);
    const supersededEdges = edges.filter((e) => e.valid_until !== undefined);

    if (activeEdges.length === 0 && supersededEdges.length === 0) {
      return "# Compiled Memory\n\nNo facts consolidated yet.";
    }

    let md = "# Compiled Memory\n\n## Active Facts\n";

    for (const edge of activeEdges) {
      const node = nodes.find((n) => n.id === edge.target);
      if (node) {
        md += `- **${edge.relation}**: ${node.label}\n`;
      }
    }

    if (supersededEdges.length > 0) {
      md += "\n## Superseded Facts\n";
      for (const edge of supersededEdges) {
        const node = nodes.find((n) => n.id === edge.target);
        if (node) {
          md += `- ~~${edge.relation}: ${node.label}~~ (valid_until: ${edge.valid_until})\n`;
        }
      }
    }

    return md;
  }

  function reset(): void {
    events = [];
    nodes = [{ id: "user", label: "You", type: "user" }];
    edges = [];
  }

  return {
    appendEvent,
    consolidate,
    getEvents,
    getGraph,
    getCompiledMemory,
    reset,
  };
}
