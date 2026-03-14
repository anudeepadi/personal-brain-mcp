"use client";

interface ProblemCard {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

const PROBLEMS: readonly ProblemCard[] = [
  {
    number: "01",
    title: "The Goldfish",
    description:
      'Vector databases return stale facts alongside current ones. Ask "Where do I live?" and get three different cities with no way to know which is current.',
  },
  {
    number: "02",
    title: "The Bottleneck",
    description:
      "Synchronous graph extraction blocks the critical path. Every message waits 800ms+ for entity resolution before the agent can respond.",
  },
  {
    number: "03",
    title: "The Forgetter",
    description:
      "Relying on agents to actively manage their own memory is like asking someone to take notes while sleeping. It never happens reliably.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="bg-surface py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-balance text-4xl font-semibold text-text-primary mb-4 md:text-5xl">
            Your AI has amnesia.
          </h2>
          <p className="text-lg text-text-secondary max-w-xl">
            Current memory systems share the same fundamental flaws.
          </p>
        </div>

        <div className="grid gap-px md:grid-cols-3 border border-border rounded-lg overflow-hidden">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="bg-background p-8"
            >
              <span className="font-mono text-4xl font-medium text-border-strong leading-none block mb-6">
                {problem.number}
              </span>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {problem.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
