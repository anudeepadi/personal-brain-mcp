"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-background border-t border-border py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display italic text-balance text-5xl leading-tight text-text-primary mb-6 md:text-6xl">
          Memory that improves while you sleep.
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-md mx-auto">
          Watch contradictions resolve in real-time, or build your own
          knowledge brain.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/brain"
            className="inline-flex items-center rounded-[var(--radius)] bg-text-primary px-8 py-3 text-base font-medium text-background hover:opacity-90 transition-opacity"
          >
            Build Your Brain
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-[var(--radius)] border border-border px-8 py-3 text-base font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
          >
            Run the Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
