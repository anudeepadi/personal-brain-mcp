"use client";

const STEPS = [
  {
    number: "01",
    label: "Install",
    sublabel: "python 3.8+ · pip",
    code: `pip install personal-brain-mcp

# Installs:
# - FastMCP server
# - LangChain + Pinecone client
# - Google Generative AI SDK
# - PyPDF2, SpeechRecognition`,
  },
  {
    number: "02",
    label: "Configure",
    sublabel: "claude desktop · json",
    code: `// claude_desktop_config.json
// ~/Library/Application Support/Claude/
{
  "mcpServers": {
    "personal-brain": {
      "command": "personal-brain-mcp",
      "args": []
    }
  }
}`,
  },
  {
    number: "03",
    label: "Use",
    sublabel: "in any conversation",
    code: `You: "What did we decide about
      the DB schema last month?"

Claude: [searches 1,247 documents]
"On Feb 12, you decided to use
 PostgreSQL. Relevant context:
 [1] schema-notes.md · line 34
 [2] meeting-2024-02-12.txt"`,
  },
] as const;

export function QuickStartSection() {
  return (
    <section
      className="border-y border-border py-24 px-6"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-[11px] text-accent uppercase tracking-[0.08em] mb-3">
              Fig. 2 — Quick Start
            </p>
            <h2 className="font-display italic text-3xl text-text-primary">
              Memory in 60 seconds.
            </h2>
          </div>
          <p className="hidden md:block font-mono text-[11px] text-text-muted pb-1">
            requires: python 3.8+ · pip · claude desktop
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
          {STEPS.map((step, i) => (
            <div key={step.number} className="bg-background flex flex-col">
              {/* Step header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-tertiary">
                    {step.number}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {step.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {step.sublabel}
                </span>
              </div>

              {/* Code block */}
              <div className="flex-1 p-6">
                <pre className="font-mono text-[11px] leading-relaxed text-text-secondary bg-surface rounded-[var(--radius)] border border-border p-4 overflow-x-auto whitespace-pre-wrap h-full min-h-[140px]">
                  <code>
                    {step.code.split("\n").map((line, j) => {
                      const isComment =
                        line.trim().startsWith("#") ||
                        line.trim().startsWith("//");
                      const isKey = /^\s+"[^"]+":/.test(line);
                      const isString =
                        line.trim().startsWith('"') &&
                        line.trim().endsWith('"');
                      const isPrompt =
                        line.startsWith("You:") || line.startsWith("Claude:");
                      return (
                        <span
                          key={j}
                          className={
                            isComment
                              ? "text-text-tertiary"
                              : isPrompt
                                ? "text-text-primary font-medium"
                                : isKey
                                  ? "text-text-primary"
                                  : isString
                                    ? "text-success"
                                    : ""
                          }
                        >
                          {line}
                          {"\n"}
                        </span>
                      );
                    })}
                  </code>
                </pre>
              </div>

              {/* Step indicator */}
              <div className="px-6 pb-4 flex items-center gap-2">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className={`h-px flex-1 ${dot <= i ? "bg-accent" : "bg-border"}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
