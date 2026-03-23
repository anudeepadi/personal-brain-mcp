"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { CountUp } from "@/components/ui/count-up";

/**
 * Design system showcase sections — Typography, Color, Components, Dashboard, Editorial.
 * Matches the preview page structure from /design-consultation.
 * Monochrome + amber. Editorial/Magazine aesthetic.
 */

/* ────────────────────────────────────────────────────
   Section 1: Typography
   ──────────────────────────────────────────────────── */

const BENCHMARK_DATA = [
  {
    type: "Episodic Stream",
    latency: "< 10ms",
    recall: "100%",
    freshness: "Real-time",
  },
  {
    type: "Knowledge Graph",
    latency: "45ms",
    recall: "94.2%",
    freshness: "Consolidated",
  },
  {
    type: "Compiled Memory",
    latency: "0ms",
    recall: "87.6%",
    freshness: "Last cycle",
  },
  {
    type: "Vector Search (baseline)",
    latency: "120ms",
    recall: "71.3%",
    freshness: "At write",
  },
] as const;

export function TypographySection() {
  return (
    <section className="py-16 px-6 border-b border-border">
      <div className="max-w-[1120px] mx-auto">
        <FadeIn>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-2">
            Fig. 2 — Typography
          </p>
          <h2 className="font-display text-4xl leading-[1.1] text-text-primary mb-4 text-balance">
            Three fonts, three roles.
          </h2>
          <p className="text-base text-text-tertiary max-w-[560px] mb-12 text-pretty">
            Instrument Serif signals intellectual depth — no other AI
            infrastructure product uses a serif. Geist handles readability.
            Geist Mono anchors data.
          </p>
        </FadeIn>

        <div className="grid gap-12">
          {/* Instrument Serif */}
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div className="pt-1">
              <p className="font-mono text-xs font-medium text-text-primary mb-1">
                Instrument Serif
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted">
                Display / Hero
              </p>
            </div>
            <div className="p-8 bg-surface border border-border rounded-lg">
              <p className="font-display text-[42px] leading-[1.1] text-text-primary mb-2">
                Memory that improves while you sleep.
              </p>
              <p className="font-display italic text-[42px] leading-[1.1] text-text-secondary">
                Temporal knowledge graphs with bitemporal edges.
              </p>
            </div>
          </div>

          {/* Geist */}
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div className="pt-1">
              <p className="font-mono text-xs font-medium text-text-primary mb-1">
                Geist
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted">
                Body / UI
              </p>
            </div>
            <div className="p-8 bg-surface border border-border rounded-lg">
              <p className="text-base leading-relaxed text-text-secondary">
                Mnemonic uses a dual-process architecture inspired by human
                sleep consolidation. Fast, non-blocking writes at runtime.
                Intelligent graph consolidation offline. The result: an agent
                that actually remembers — without latency spikes, stale recalls,
                or silent failures.
              </p>
            </div>
          </div>

          {/* Geist Mono */}
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div className="pt-1">
              <p className="font-mono text-xs font-medium text-text-primary mb-1">
                Geist Mono
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted">
                Data / Code
              </p>
            </div>
            <div className="p-8 bg-surface border border-border rounded-lg">
              <pre className="font-mono text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">{`episodic_stream.append(event)       # <10ms, no LLM call
consolidator.process(stream)         # async, offline
knowledge_graph.query(entity="NYC")  # bitemporal lookup
compiled_memory.inject(prompt)       # 0ms retrieval`}</pre>
            </div>
          </div>

          {/* Data Table */}
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div className="pt-1">
              <p className="font-mono text-xs font-medium text-text-primary mb-1">
                Geist (tabular-nums)
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted">
                Data Tables
              </p>
            </div>
            <div className="p-8 bg-surface border border-border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Memory Type", "Latency", "Recall Rate", "Freshness"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted font-medium pb-2 pr-4 border-b border-border-strong"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {BENCHMARK_DATA.map((row) => (
                    <tr
                      key={row.type}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="py-2.5 pr-4 text-sm font-medium text-text-primary">
                        {row.type}
                      </td>
                      <td className="py-2.5 pr-4 text-sm tabular-nums text-text-secondary">
                        {row.latency}
                      </td>
                      <td className="py-2.5 pr-4 text-sm tabular-nums text-text-secondary">
                        {row.recall}
                      </td>
                      <td className="py-2.5 text-sm text-text-secondary">
                        {row.freshness}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────
   Section 2: Color Palette
   ──────────────────────────────────────────────────── */

const SWATCHES = [
  { name: "Amber (accent)", hex: "#b45309", color: "#b45309" },
  { name: "Stone 950", hex: "#0c0a09", color: "#0c0a09" },
  { name: "Stone 900", hex: "#1c1917", color: "#1c1917" },
  { name: "Stone 700", hex: "#44403c", color: "#44403c" },
  { name: "Stone 500", hex: "#78716c", color: "#78716c" },
  { name: "Stone 400", hex: "#a8a29e", color: "#a8a29e" },
  { name: "Stone 300", hex: "#d6d3d1", color: "#d6d3d1" },
  { name: "Stone 200", hex: "#e7e5e4", color: "#e7e5e4" },
  { name: "Stone 100", hex: "#f5f5f4", color: "#f5f5f4" },
  { name: "Stone 50", hex: "#fafaf9", color: "#fafaf9" },
] as const;

const SEMANTICS = [
  {
    label: "Success",
    desc: "Connected · Consolidated · Synced",
    color: "var(--success)",
    bg: "rgba(21, 128, 61, 0.06)",
    border: "var(--success)",
  },
  {
    label: "Warning",
    desc: "Stale memory · Pending consolidation",
    color: "var(--warning)",
    bg: "rgba(161, 98, 7, 0.06)",
    border: "var(--warning)",
  },
  {
    label: "Error",
    desc: "Failed recall · Broken connection",
    color: "var(--danger)",
    bg: "rgba(185, 28, 28, 0.06)",
    border: "var(--danger)",
  },
  {
    label: "Info",
    desc: "System note · Background process",
    color: "var(--text-secondary)",
    bg: "var(--surface)",
    border: "var(--border-strong)",
  },
] as const;

export function ColorSection() {
  return (
    <section className="py-16 px-6 border-b border-border bg-surface">
      <div className="max-w-[1120px] mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-2">
          Fig. 3 — Color Palette
        </p>
        <h2 className="font-display text-4xl leading-[1.1] text-text-primary mb-4">
          Monochrome + amber.
        </h2>
        <p className="text-base text-text-tertiary max-w-[560px] mb-12">
          Every competitor fights over blue vs green vs purple. Mnemonic
          sidesteps the game entirely. Amber is the only color — it means
          &ldquo;memory activated.&rdquo;
        </p>

        {/* Swatches */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-12">
          {SWATCHES.map((s) => (
            <div
              key={s.hex}
              className="flex flex-col border border-border rounded-lg overflow-hidden"
            >
              <div
                className="h-16"
                style={{
                  background: s.color,
                  borderBottom:
                    s.hex === "#fafaf9" ? "1px solid var(--border)" : "none",
                }}
              />
              <div className="p-2 bg-background">
                <p className="text-[11px] font-medium text-text-primary truncate">
                  {s.name}
                </p>
                <p className="font-mono text-[10px] text-text-muted">{s.hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Semantic */}
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-4">
          Semantic Colors
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {SEMANTICS.map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-lg"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <p
                className="font-mono text-[11px] uppercase tracking-[0.05em] mb-1"
                style={{ color: s.color }}
              >
                {s.label}
              </p>
              <p className="text-[13px] text-text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Accent usage */}
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-4">
          Accent Usage — When Amber Appears
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-6 bg-background border border-border rounded-lg">
            <div className="w-2 h-2 rounded-full bg-accent mb-3" />
            <p className="text-[15px] font-semibold text-text-primary mb-1">
              Memory active
            </p>
            <p className="text-sm text-text-tertiary">
              Consolidation in progress, recall triggered, entity highlighted
            </p>
          </div>
          <div className="p-6 bg-background border border-border rounded-lg">
            <p className="text-sm font-medium text-accent mb-3">3 new</p>
            <p className="text-[15px] font-semibold text-text-primary mb-1">
              Notifications
            </p>
            <p className="text-sm text-text-tertiary">
              New memories consolidated, attention signals, badges
            </p>
          </div>
          <div className="p-6 bg-background border border-border rounded-lg">
            <p className="text-sm mb-3">
              <span className="underline decoration-accent underline-offset-2 decoration-1">
                temporal edges
              </span>
            </p>
            <p className="text-[15px] font-semibold text-text-primary mb-1">
              Emphasis
            </p>
            <p className="text-sm text-text-tertiary">
              Key terms, hover states, focus rings, selected items
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────
   Section 3: Components
   ──────────────────────────────────────────────────── */

export function ComponentsSection() {
  return (
    <section className="py-16 px-6 border-b border-border">
      <div className="max-w-[1120px] mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-2">
          Fig. 4 — Components
        </p>
        <h2 className="font-display text-4xl leading-[1.1] text-text-primary mb-4">
          Buttons, inputs, and cards.
        </h2>
        <p className="text-base text-text-tertiary max-w-[560px] mb-12">
          Black primary buttons. Amber reserved for memory-active states. Links
          are underlined, editorial-style.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Buttons */}
          <div className="p-8 bg-surface border border-border rounded-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-5">
              Buttons
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <button className="px-5 py-2 text-sm font-medium rounded bg-text-primary text-background">
                Get Started
              </button>
              <button className="px-5 py-2 text-sm font-medium rounded bg-accent text-white">
                Consolidate
              </button>
              <button className="px-5 py-2 text-sm font-medium rounded border border-border-strong text-text-primary bg-background">
                View Docs
              </button>
              <button className="px-5 py-2 text-sm font-medium rounded text-text-secondary hover:bg-surface">
                Cancel
              </button>
            </div>
            <p className="font-mono text-xs text-text-muted">
              Primary (black) · Accent (amber, memory actions) · Secondary ·
              Ghost
            </p>
          </div>

          {/* Form Inputs */}
          <div className="p-8 bg-surface border border-border rounded-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-5">
              Form Inputs
            </p>
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                Search memories
              </label>
              <input
                type="text"
                readOnly
                placeholder="What do you remember about Austin?"
                className="w-full text-sm px-3 py-2 bg-background border border-border rounded placeholder:text-text-muted text-text-primary focus:border-accent focus:ring-2 focus:ring-accent-muted outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                Namespace
              </label>
              <input
                type="text"
                readOnly
                defaultValue="personal-knowledge"
                className="w-full text-sm px-3 py-2 bg-background border border-border rounded text-text-primary focus:border-accent focus:ring-2 focus:ring-accent-muted outline-none"
              />
            </div>
          </div>

          {/* Card — Memory Entity */}
          <div className="p-8 bg-surface border border-border rounded-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-5">
              Card — Memory Entity
            </p>
            <div className="p-6 bg-background border border-border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[15px] font-semibold text-text-primary">
                  Location: Austin, TX
                </p>
                <span className="text-[10px] font-mono uppercase tracking-[0.04em] px-2 py-0.5 rounded bg-accent-muted text-accent">
                  Consolidated
                </span>
              </div>
              <p className="text-sm text-text-tertiary mb-2">
                Moved from NYC in Feb 2026. Lives in East Austin. Prefers warm
                weather.
              </p>
              <p className="font-mono text-[11px] text-text-muted">
                3 sources · valid_from: 2026-02-15 · confidence: 0.94
              </p>
            </div>
          </div>

          {/* Links & Text Styles */}
          <div className="p-8 bg-surface border border-border rounded-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-5">
              Links & Text Styles
            </p>
            <p className="text-sm leading-relaxed text-text-secondary mb-4">
              The{" "}
              <span className="text-text-primary underline underline-offset-2 decoration-1 decoration-accent">
                episodic stream
              </span>{" "}
              appends events in real-time. During{" "}
              <span className="text-text-primary underline underline-offset-2 decoration-1 decoration-accent">
                sleep consolidation
              </span>
              , the system extracts entities and builds{" "}
              <span className="text-text-primary underline underline-offset-2 decoration-1 decoration-accent">
                temporal knowledge graphs
              </span>
              .
            </p>
            <div className="flex gap-4 text-[13px]">
              <span className="font-semibold text-text-primary">
                Bold weight
              </span>
              <span className="text-text-secondary">Regular text</span>
              <span className="text-text-muted">Muted text</span>
              <span className="font-mono text-xs text-accent uppercase">
                Amber label
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────
   Section 4: Dashboard Mockup
   ──────────────────────────────────────────────────── */

const TIMELINE = [
  {
    time: "14:32",
    title: "Preference updated",
    desc: '"Prefers Python over JavaScript for backend" — supersedes prior belief',
    badge: "consolidated" as const,
  },
  {
    time: "14:28",
    title: "New entity: FastAPI",
    desc: "Extracted from conversation about backend architecture",
    badge: "consolidated" as const,
  },
  {
    time: "14:15",
    title: "Brain dump archived",
    desc: '"I moved from NYC to Austin last month" — 3 entities extracted',
    badge: "pending" as const,
  },
  {
    time: "13:47",
    title: "Contradiction resolved",
    desc: "Location: NYC → Austin (valid_until set on old edge)",
    badge: "consolidated" as const,
  },
] as const;

const ENTITIES = [
  { name: "Austin, TX", count: 12 },
  { name: "Python", count: 8 },
  { name: "FastAPI", count: 5 },
  { name: "Pinecone", count: 4 },
  { name: "LangChain", count: 3 },
] as const;

export function DashboardSection() {
  return (
    <section className="py-16 px-6 border-b border-border bg-surface">
      <div className="max-w-[1120px] mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-2">
          Fig. 5 — Dashboard
        </p>
        <h2 className="font-display text-4xl leading-[1.1] text-text-primary mb-4">
          The brain at a glance.
        </h2>
        <p className="text-base text-text-tertiary max-w-[560px] mb-12">
          Grid-disciplined layout for the data-heavy dashboard. Monospace
          labels, tabular numbers, hairline rules.
        </p>

        {/* Dashboard mockup */}
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="font-display italic text-lg text-accent">
                Mnemonic
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
                <span className="size-1.5 rounded-full bg-success" />
                MCP Connected · Pinecone · Gemini Flash
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-text-muted">
                v1.0
              </span>
              <div className="size-7 rounded-full bg-surface border border-border" />
            </div>
          </div>

          {/* Body */}
          <div className="grid md:grid-cols-[1fr_320px]">
            {/* Main */}
            <div className="p-6 border-r border-border">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Memories", value: "1,247", change: "+23 today" },
                  { label: "Entities", value: "89", change: "+5 consolidated" },
                  {
                    label: "Recall Rate",
                    value: "94.2%",
                    change: "+2.1% vs baseline",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 bg-surface border border-border rounded"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted mb-1">
                      {s.label}
                    </p>
                    <CountUp
                      target={s.value}
                      className="text-3xl font-semibold tabular-nums text-text-primary block"
                    />
                    <p className="font-mono text-[11px] text-accent mt-0.5">
                      {s.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted pb-2 mb-2 border-b border-border">
                Recent Activity
              </p>
              <div>
                {TIMELINE.map((item) => (
                  <div
                    key={item.time}
                    className="grid grid-cols-[80px_1fr] gap-4 py-3 border-b border-border last:border-b-0 items-start"
                  >
                    <span className="font-mono text-xs text-text-muted pt-0.5">
                      {item.time}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-0.5">
                        {item.title}
                      </p>
                      <p className="text-[13px] text-text-tertiary">
                        {item.desc}
                      </p>
                      <span
                        className={`inline-block mt-1 font-mono text-[10px] uppercase tracking-[0.04em] px-1.5 py-0.5 rounded ${
                          item.badge === "consolidated"
                            ? "bg-accent-muted text-accent"
                            : "bg-surface text-text-muted"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="p-6">
              {/* Entities */}
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted pb-2 mb-3 border-b border-border">
                Knowledge Entities
              </p>
              <ul className="mb-6">
                {ENTITIES.map((e) => (
                  <li
                    key={e.name}
                    className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                  >
                    <span className="text-sm text-text-primary">{e.name}</span>
                    <span className="font-mono text-xs tabular-nums text-text-muted">
                      {e.count}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Consolidation */}
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted pb-2 mb-3 border-b border-border">
                Consolidation Status
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-text-secondary">Processing queue</span>
                  <span className="font-mono text-xs text-text-muted">
                    2 pending
                  </span>
                </div>
                <div className="h-1 bg-surface rounded-full">
                  <div className="w-[78%] h-full bg-accent rounded-full" />
                </div>
              </div>
              <p className="font-mono text-[11px] text-text-muted">
                Last cycle: 2 min ago · Next: ~8 min
              </p>

              {/* Integrations */}
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted pb-2 mb-3 mt-6 border-b border-border">
                Integrations
              </p>
              {[
                { name: "Pinecone", connected: true },
                { name: "Google Gemini", connected: true },
              ].map((intg) => (
                <div
                  key={intg.name}
                  className="flex justify-between items-center py-1.5 text-[13px]"
                >
                  <span className="text-text-primary">{intg.name}</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-success">
                    <span className="size-1.5 rounded-full bg-success" />
                    Connected
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────
   Section 5: Editorial Layout
   ──────────────────────────────────────────────────── */

export function EditorialSection() {
  return (
    <section className="py-16 px-6 border-b border-border">
      <div className="max-w-[1120px] mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mb-2">
          Fig. 6 — Editorial Layout
        </p>
        <h2 className="font-display text-4xl leading-[1.1] text-text-primary mb-4">
          Marketing that reads like research.
        </h2>
        <p className="text-base text-text-tertiary max-w-[560px] mb-12">
          Asymmetric grid, figure annotations, pull quotes. The landing page
          looks like a scientific publication, not a SaaS template.
        </p>

        {/* Asymmetric grid */}
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-16 items-start py-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted mb-3">
              Fig. 6a — The consolidation problem
            </p>
            <h3 className="font-display text-5xl leading-[1.05] text-text-primary mb-6">
              Current memory systems fail because they treat recall as a read
              operation.
            </h3>
            <p className="text-base leading-relaxed text-text-secondary mb-6">
              Vector databases return stale facts at equal similarity scores.
              There is no temporal ordering, no contradiction resolution, no way
              to distinguish &ldquo;lived in NYC&rdquo; from &ldquo;lives in
              Austin.&rdquo; Every query returns everything it ever learned,
              weighted by embedding distance alone.
            </p>
            <p className="text-base leading-relaxed text-text-secondary mb-6">
              Mnemonic treats memory as a{" "}
              <em className="italic">biological process</em>. Raw events are
              appended instantly — under 10ms, no LLM call. A separate
              consolidation pipeline runs offline, extracting entities,
              resolving contradictions, and building{" "}
              <span className="text-text-primary underline underline-offset-2 decoration-1 decoration-accent">
                bitemporal knowledge graphs
              </span>{" "}
              where old facts are preserved, not overwritten.
            </p>
            <span className="text-sm text-text-primary underline underline-offset-2 decoration-1 decoration-accent">
              Read the architecture paper →
            </span>
          </div>

          {/* Code block */}
          <div className="p-8 bg-surface border border-border rounded-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted mb-3">
              Consolidation pipeline
            </p>
            <pre className="font-mono text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
              <span className="italic text-text-muted">
                # Phase 1: Episodic capture (&lt;10ms)
              </span>
              {"\n"}
              stream = EpisodicStream(){"\n"}
              stream.
              <span className="font-medium text-text-primary">append</span>
              (event, timestamp=now()){"\n\n"}
              <span className="italic text-text-muted">
                # Phase 2: Sleep consolidation (async)
              </span>
              {"\n"}
              entities = consolidator.
              <span className="font-medium text-text-primary">extract</span>
              (stream){"\n"}
              graph.
              <span className="font-medium text-text-primary">upsert</span>(
              {"\n"}
              {"  "}entity=
              <span className="text-accent">&quot;Location&quot;</span>,{"\n"}
              {"  "}value=
              <span className="text-accent">&quot;Austin, TX&quot;</span>,{"\n"}
              {"  "}valid_from=
              <span className="text-accent">&quot;2026-02-15&quot;</span>,{"\n"}
              {"  "}supersedes=
              <span className="text-accent">&quot;NYC&quot;</span>
              {"\n"}){"\n\n"}
              <span className="italic text-text-muted">
                # Phase 3: Compiled memory (0ms)
              </span>
              {"\n"}
              prompt = compiled.
              <span className="font-medium text-text-primary">inject</span>
              (system_prompt)
            </pre>
          </div>
        </div>

        {/* Pull quote */}
        <div className="border-t border-b border-border py-12 my-8 text-center">
          <blockquote className="font-display italic text-[32px] leading-[1.3] text-text-primary max-w-[640px] mx-auto mb-3">
            &ldquo;The best memory is the one you never have to think about
            retrieving.&rdquo;
          </blockquote>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">
            — Design principle [1]
          </p>
        </div>
      </div>
    </section>
  );
}
