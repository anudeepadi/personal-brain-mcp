"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";

interface Paper {
  title: string;
  authors: string;
  year: string;
  contribution: string;
  url: string;
}

const PAPERS: readonly Paper[] = [
  {
    title: "Generative Agents: Interactive Simulacra of Human Behavior",
    authors: "Park et al.",
    year: "2023",
    contribution: "Memory stream + reflection architecture for believable agent behavior.",
    url: "https://arxiv.org/abs/2304.03442",
  },
  {
    title: "MemGPT: Towards LLMs as Operating Systems",
    authors: "Packer et al.",
    year: "2023",
    contribution: "Virtual context management with tiered memory and self-editing.",
    url: "https://arxiv.org/abs/2310.08560",
  },
  {
    title: "Cognitive Architectures for Language Agents (CoALA)",
    authors: "Sumers et al.",
    year: "2023",
    contribution: "Taxonomy of memory types and decision procedures for language agents.",
    url: "https://arxiv.org/abs/2309.02427",
  },
  {
    title: "HippoRAG: Neurobiologically Inspired Long-Term Memory for LLMs",
    authors: "Gutierrez et al.",
    year: "2024",
    contribution: "Hippocampal-inspired indexing for better multi-hop retrieval.",
    url: "https://arxiv.org/abs/2405.14831",
  },
  {
    title: "From Local to Global: A Graph RAG Approach",
    authors: "Edge et al.",
    year: "2024",
    contribution: "Community-based summarization over knowledge graphs for global queries.",
    url: "https://arxiv.org/abs/2404.16130",
  },
  {
    title: "A-Mem: Agentic Memory for LLM Agents",
    authors: "Xu et al.",
    year: "2025",
    contribution: "Self-organizing memory with Zettelkasten indexing and dynamic updates.",
    url: "https://arxiv.org/abs/2502.12345",
  },
] as const;

export function AcademicSection() {
  return (
    <>
      {/* Literature Cards */}
      <section className="bg-[#0A0E1A] py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-[#E5E7EB] mb-4"
          >
            Standing on Giants
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-center text-[#9CA3AF] mb-16"
          >
            Key papers that shaped our architecture.
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAPERS.map((paper, i) => (
              <motion.a
                key={paper.title}
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group block rounded-xl border border-[#1F2937] bg-[#111827] p-5 hover:border-[#818CF8]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono text-[#818CF8]">
                    {paper.year}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#6B7280] group-hover:text-[#818CF8] transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-[#E5E7EB] mb-1 leading-snug">
                  {paper.title}
                </h3>
                <p className="text-xs text-[#9CA3AF] mb-2">{paper.authors}</p>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {paper.contribution}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="bg-gradient-to-b from-[#0A0E1A] to-[#FEFCF8] py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Get Involved</h2>
          <p className="text-lg text-[#6B6B6B] mb-8">
            Subconscious is open source, built as part of the Personal Brain MCP project.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/anudeepadi/personal-brain-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1A1A] text-white font-semibold text-sm hover:bg-[#333] transition-colors"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
            <a
              href="https://github.com/anudeepadi/personal-brain-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#E8E4DE] text-[#1A1A1A] font-semibold text-sm hover:border-[#E8A04C] hover:text-[#E8A04C] transition-colors"
            >
              <Star className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
