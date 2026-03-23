"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section
      className="border-t border-border py-20 px-6"
      style={{ background: "var(--accent-muted)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-mono text-[11px] text-accent uppercase tracking-[0.08em] mb-5">
          Get Started
        </p>
        <h2 className="font-display italic text-balance text-4xl leading-tight text-text-primary mb-5 md:text-5xl">
          Memory that <em className="text-accent">improves</em> while you sleep.
        </h2>
        <p className="text-base text-text-secondary mb-10 max-w-sm mx-auto leading-relaxed">
          Watch contradictions resolve in real-time, or build your own knowledge
          brain.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/brain"
            className="inline-flex items-center rounded-[var(--radius)] bg-accent px-7 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Build Your Brain
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-[var(--radius)] border border-border bg-background px-7 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
          >
            Run the Demo
          </Link>
        </div>

        <p className="mt-8 font-mono text-[11px] text-text-tertiary">
          pip install personal-brain-mcp
        </p>
      </div>
    </section>
  );
}
