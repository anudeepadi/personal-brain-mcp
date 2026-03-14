"use client";

import { ExternalLink, Github, Star } from "lucide-react";

interface Paper {
  readonly title: string;
  readonly authors: string;
  readonly year: string;
  readonly contribution: string;
  readonly url: string;
}

const PAPERS: readonly Paper[] = [
  {
    title: "Generative Agents: Interactive Simulacra of Human Behavior",
    authors: "Park et al.",
    year: "2023",
    contribution:
      "Memory stream + reflection architecture for believable agent behavior.",
    url: "https://arxiv.org/abs/2304.03442",
  },
  {
    title: "MemGPT: Towards LLMs as Operating Systems",
    authors: "Packer et al.",
    year: "2023",
    contribution:
      "Virtual context management with tiered memory and self-editing.",
    url: "https://arxiv.org/abs/2310.08560",
  },
  {
    title: "Cognitive Architectures for Language Agents (CoALA)",
    authors: "Sumers et al.",
    year: "2023",
    contribution:
      "Taxonomy of memory types and decision procedures for language agents.",
    url: "https://arxiv.org/abs/2309.02427",
  },
  {
    title: "HippoRAG: Neurobiologically Inspired Long-Term Memory for LLMs",
    authors: "Gutierrez et al.",
    year: "2024",
    contribution:
      "Hippocampal-inspired indexing for better multi-hop retrieval.",
    url: "https://arxiv.org/abs/2405.14831",
  },
  {
    title: "From Local to Global: A Graph RAG Approach",
    authors: "Edge et al.",
    year: "2024",
    contribution:
      "Community-based summarization over knowledge graphs for global queries.",
    url: "https://arxiv.org/abs/2404.16130",
  },
  {
    title: "A-Mem: Agentic Memory for LLM Agents",
    authors: "Xu et al.",
    year: "2025",
    contribution:
      "Self-organizing memory with Zettelkasten indexing and dynamic updates.",
    url: "https://arxiv.org/abs/2502.12345",
  },
] as const;

export function AcademicSection() {
  return (
    <>
      {/* Literature Cards */}
      <section className="bg-background py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-balance text-4xl font-semibold text-text-primary mb-4 md:text-5xl">
              Standing on Giants
            </h2>
            <p className="text-lg text-text-secondary max-w-xl">
              Key papers that shaped our architecture.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PAPERS.map((paper) => (
              <a
                key={paper.title}
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-[var(--radius)] border border-border bg-surface p-5 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono text-accent">
                    {paper.year}
                  </span>
                  <ExternalLink className="size-3.5 text-text-tertiary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1 leading-snug">
                  {paper.title}
                </h3>
                <p className="text-xs text-text-secondary mb-2">
                  {paper.authors}
                </p>
                <p className="text-xs text-text-tertiary leading-relaxed">
                  {paper.contribution}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="bg-surface border-t border-border py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display italic text-balance text-4xl text-text-primary mb-4">
            Get Involved
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Mnemonic is open source, built as part of the Personal Brain MCP
            project.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/anudeepadi/personal-brain-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-text-primary px-6 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              <Github className="size-4" />
              View on GitHub
            </a>
            <a
              href="https://github.com/anudeepadi/personal-brain-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              <Star className="size-4" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
