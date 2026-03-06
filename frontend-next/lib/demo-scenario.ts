export interface DemoFact {
  readonly step: number;
  readonly content: string;
  readonly contradicts?: number; // step index it contradicts
}

export interface CompetitorFact {
  readonly content: string;
  readonly active: boolean;
  readonly valid_until?: string;
}

export interface CompetitorResult {
  readonly name: string;
  readonly facts: readonly CompetitorFact[];
  readonly contradictionsResolved: number;
  readonly latency: string;
  readonly temporalTrail: boolean;
}

export interface DemoScenario {
  advance(): DemoFact | null;
  injectCustomFact(content: string): void;
  getCompetitorResults(): readonly CompetitorResult[];
  getStep(): number;
  isComplete(): boolean;
  getInjectedFacts(): readonly DemoFact[];
  reset(): void;
}

const GUIDED_FACTS: readonly DemoFact[] = [
  { step: 1, content: "I live in Austin, Texas" },
  { step: 2, content: "I work at Google as a software engineer" },
  { step: 3, content: "I just moved to New York City", contradicts: 1 },
  { step: 4, content: "I switched to Anthropic last month", contradicts: 2 },
  { step: 5, content: "Actually still in Austin, move fell through", contradicts: 3 },
];

function buildVectorOnly(facts: readonly DemoFact[]): CompetitorResult {
  return {
    name: "Vector-Only",
    facts: facts.map((f) => ({ content: f.content, active: true })),
    contradictionsResolved: 0,
    latency: "<10ms",
    temporalTrail: false,
  };
}

function buildSyncGraph(facts: readonly DemoFact[]): CompetitorResult {
  const activeFacts: CompetitorFact[] = [];
  let resolved = 0;

  for (const fact of facts) {
    if (fact.contradicts !== undefined) {
      // Sync graph resolves simple contradictions but misses reversals
      const contradicted = facts.find((f) => f.step === fact.contradicts);
      if (contradicted) {
        // Can detect direct contradiction, but not reversal (step 5 contradicts step 3)
        const isReversal = fact.step === 5;
        if (!isReversal) {
          // Mark contradicted fact as inactive
          const idx = activeFacts.findIndex(
            (af) => af.content === contradicted.content && af.active,
          );
          if (idx !== -1) {
            activeFacts[idx] = { ...activeFacts[idx], active: false };
            resolved++;
          }
        }
      }
    }
    activeFacts.push({ content: fact.content, active: true });
  }

  return {
    name: "Sync Graph",
    facts: activeFacts,
    contradictionsResolved: resolved,
    latency: "800ms+",
    temporalTrail: false,
  };
}

function buildSubconscious(facts: readonly DemoFact[]): CompetitorResult {
  const now = new Date().toISOString();
  const allFacts: CompetitorFact[] = [];
  let resolved = 0;

  for (const fact of facts) {
    if (fact.contradicts !== undefined) {
      const contradicted = facts.find((f) => f.step === fact.contradicts);
      if (contradicted) {
        // Mark contradicted fact with valid_until
        const idx = allFacts.findIndex(
          (af) => af.content === contradicted.content && af.active,
        );
        if (idx !== -1) {
          allFacts[idx] = {
            ...allFacts[idx],
            active: false,
            valid_until: now,
          };
          resolved++;
        }
      }
    }
    allFacts.push({ content: fact.content, active: true });
  }

  return {
    name: "Subconscious",
    facts: allFacts,
    contradictionsResolved: resolved,
    latency: "<10ms",
    temporalTrail: true,
  };
}

export function createDemoScenario(): DemoScenario {
  let currentStep = 0;
  let injectedFacts: DemoFact[] = [];

  function advance(): DemoFact | null {
    if (currentStep >= GUIDED_FACTS.length) return null;
    const fact = GUIDED_FACTS[currentStep];
    injectedFacts = [...injectedFacts, fact];
    currentStep++;
    return fact;
  }

  function injectCustomFact(content: string): void {
    const step = GUIDED_FACTS.length + injectedFacts.length + 1;
    injectedFacts = [...injectedFacts, { step, content }];
  }

  function getCompetitorResults(): readonly CompetitorResult[] {
    return [
      buildVectorOnly(injectedFacts),
      buildSyncGraph(injectedFacts),
      buildSubconscious(injectedFacts),
    ];
  }

  function getStep(): number {
    return currentStep;
  }

  function isComplete(): boolean {
    return currentStep >= GUIDED_FACTS.length;
  }

  function getInjectedFacts(): readonly DemoFact[] {
    return injectedFacts;
  }

  function reset(): void {
    currentStep = 0;
    injectedFacts = [];
  }

  return {
    advance,
    injectCustomFact,
    getCompetitorResults,
    getStep,
    isComplete,
    getInjectedFacts,
    reset,
  };
}
