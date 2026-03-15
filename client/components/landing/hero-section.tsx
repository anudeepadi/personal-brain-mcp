"use client";

import Link from "next/link";

const METRICS = [
  { value: "<10ms", label: "ingestion latency" },
  { value: "5", label: "MCP resources" },
  { value: "10", label: "MCP tools" },
  { value: "MIT", label: "license" },
] as const;

const CODE_SNIPPET = `# 1. Install
pip install personal-brain-mcp

# 2. Configure Claude Desktop
# ~/Library/Application Support/Claude/
# claude_desktop_config.json

{
  "mcpServers": {
    "personal-brain": {
      "command": "personal-brain-mcp",
      "args": []
    }
  }
}

# 3. Restart Claude Desktop → done`;

export function HeroSection() {
  return (
    <section className="min-h-dvh bg-background flex items-center px-6 py-20">
      <div className="mx-auto max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-mono text-text-secondary">
              <span className="size-1.5 rounded-full bg-success inline-block" />
              Open Source · MCP Server · Claude Desktop
            </span>
          </div>

          <h1 className="font-display italic text-5xl leading-[1.05] text-text-primary text-balance sm:text-6xl md:text-7xl">
            AI Agents Forget.
            <br />
            <em className="not-italic text-accent">Mnemonic</em>{" "}
            Remembers.
          </h1>

          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-md">
            Persistent memory for Claude Desktop — semantic search over your
            documents and conversations, grounded answers with citations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link
              href="/brain"
              className="inline-flex items-center rounded-[var(--radius)] bg-text-primary px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              Setup in 60 seconds
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center rounded-[var(--radius)] border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              Documentation
            </Link>
          </div>

          {/* Metrics strip */}
          <div className="mt-10 pt-10 border-t border-border grid grid-cols-4 gap-6">
            {METRICS.map((m) => (
              <div key={m.value}>
                <span className="font-mono text-base font-semibold text-text-primary block leading-none">
                  {m.value}
                </span>
                <span className="text-[11px] text-text-tertiary mt-1 block leading-snug">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — code block */}
        <div className="hidden md:block">
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="size-2.5 rounded-full bg-danger/40" />
              <span className="size-2.5 rounded-full bg-border-strong" />
              <span className="size-2.5 rounded-full bg-success/40" />
              <span className="ml-2 text-xs text-text-tertiary font-mono flex-1">
                setup.sh
              </span>
              <span className="text-[10px] text-text-tertiary font-mono">
                python 3.8+
              </span>
            </div>

            {/* Code */}
            <pre className="p-6 text-xs leading-relaxed font-mono text-text-secondary overflow-x-auto">
              <code>
                {CODE_SNIPPET.split("\n").map((line, i) => {
                  const isComment = line.startsWith("#");
                  const isCmd =
                    line.startsWith("pip") || line.startsWith("python");
                  const isKey = /^\s+"[^"]+":/.test(line);
                  const isString = /^\s+"[^"]*"$/.test(line.trim());
                  return (
                    <span
                      key={i}
                      className={
                        isComment
                          ? "text-text-tertiary"
                          : isCmd
                            ? "text-accent font-medium"
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
        </div>
      </div>
    </section>
  );
}
