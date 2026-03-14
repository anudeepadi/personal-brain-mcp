import { describe, it, expect } from "vitest";
import { createMemoryEngine } from "../use-memory-engine";

describe("createMemoryEngine", () => {
  it("appends events to stream", () => {
    const engine = createMemoryEngine();
    const event = engine.appendEvent("I live in Austin, Texas", "chat");
    expect(event.content).toBe("I live in Austin, Texas");
    expect(event.type).toBe("chat");
    expect(engine.getEvents()).toHaveLength(1);
  });

  it("detects contradictions during consolidation", () => {
    const engine = createMemoryEngine();
    engine.appendEvent("I live in Austin, Texas", "chat");
    engine.consolidate();
    engine.appendEvent("I just moved to New York City", "chat");
    const result = engine.consolidate();
    expect(result.contradictionsResolved).toBeGreaterThan(0);
  });

  it("resolves contradictions with valid_until", () => {
    const engine = createMemoryEngine();
    engine.appendEvent("I live in Austin, Texas", "chat");
    engine.consolidate();
    engine.appendEvent("I just moved to New York City", "chat");
    engine.consolidate();

    const { nodes, edges } = engine.getGraph();
    const superseded = edges.filter((e) => e.valid_until !== undefined);
    expect(superseded.length).toBeGreaterThan(0);
    const active = edges.filter(
      (e) => e.valid_until === undefined && e.relation === "location",
    );
    expect(active.length).toBe(1);
    const activeNode = nodes.find((n) => n.id === active[0].target);
    expect(activeNode?.label).toContain("New York");
  });

  it("generates compiled memory markdown", () => {
    const engine = createMemoryEngine();
    engine.appendEvent("I live in Austin, Texas", "chat");
    engine.consolidate();
    const md = engine.getCompiledMemory();
    expect(md).toContain("Austin");
    expect(md).toContain("location");
  });

  it("builds graph nodes from events", () => {
    const engine = createMemoryEngine();
    engine.appendEvent("I work at Google as a software engineer", "chat");
    engine.consolidate();
    const { nodes } = engine.getGraph();
    expect(nodes.length).toBeGreaterThanOrEqual(2); // "You" + entity
    const entityNames = nodes.map((n) => n.label.toLowerCase());
    expect(entityNames.some((l) => l.includes("google"))).toBe(true);
  });
});
