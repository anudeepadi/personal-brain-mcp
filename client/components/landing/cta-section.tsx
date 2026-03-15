"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-background border-t border-border py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-5">
          // GET STARTED
        </p>
        <h2 className="font-display italic text-balance text-4xl leading-tight text-text-primary mb-5 md:text-5xl">
          Memory that improves while you sleep.
        </h2>
        <p className="text-base text-text-secondary mb-10 max-w-sm mx-auto leading-relaxed">
          Watch contradictions resolve in real-time, or build your own
          knowledge brain.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/brain"
            className="inline-flex items-center rounded-[var(--radius)] bg-text-primary px-7 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Build Your Brain
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-[var(--radius)] border border-border px-7 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
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
