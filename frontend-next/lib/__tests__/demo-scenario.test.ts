import { describe, it, expect } from "vitest";
import { createDemoScenario } from "../demo-scenario";

describe("createDemoScenario", () => {
  it("starts at step 0, not complete", () => {
    const scenario = createDemoScenario();
    expect(scenario.getStep()).toBe(0);
    expect(scenario.isComplete()).toBe(false);
  });

  it("advances through all 5 guided facts", () => {
    const scenario = createDemoScenario();
    for (let i = 0; i < 5; i++) {
      scenario.advance();
    }
    expect(scenario.getStep()).toBe(5);
    expect(scenario.isComplete()).toBe(true);
  });

  it("vector-only returns all facts without resolution", () => {
    const scenario = createDemoScenario();
    // Inject all 5 facts
    for (let i = 0; i < 5; i++) {
      scenario.advance();
    }
    const results = scenario.getCompetitorResults();
    const vectorOnly = results.find((r) => r.name === "Vector-Only");
    expect(vectorOnly).toBeDefined();
    expect(vectorOnly!.facts.length).toBe(5);
    expect(vectorOnly!.contradictionsResolved).toBe(0);
  });

  it("subconscious resolves contradictions correctly", () => {
    const scenario = createDemoScenario();
    for (let i = 0; i < 5; i++) {
      scenario.advance();
    }
    const results = scenario.getCompetitorResults();
    const sub = results.find((r) => r.name === "Subconscious");
    expect(sub).toBeDefined();
    expect(sub!.contradictionsResolved).toBe(3);
    expect(sub!.temporalTrail).toBe(true);
  });

  it("resets cleanly", () => {
    const scenario = createDemoScenario();
    scenario.advance();
    scenario.advance();
    scenario.reset();
    expect(scenario.getStep()).toBe(0);
    expect(scenario.isComplete()).toBe(false);
    expect(scenario.getInjectedFacts()).toHaveLength(0);
  });
});
