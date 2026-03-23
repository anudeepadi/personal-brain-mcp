"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plug,
  FileText,
  ChevronDown,
  Circle,
  Database,
  Cpu,
  MessageSquare,
} from "lucide-react";

interface AccordionProps {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly badge?: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
}

function AccordionSection({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-background transition-colors"
      >
        <span className="text-text-tertiary">{icon}</span>
        <span className="text-sm font-medium text-text-secondary flex-1">
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent-muted text-accent">
            {badge}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-text-tertiary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface IntegrationBadgeProps {
  readonly name: string;
  readonly icon: React.ReactNode;
  readonly status: "connected" | "available" | "offline";
}

function IntegrationBadge({ name, icon, status }: IntegrationBadgeProps) {
  const dotColor = {
    connected: "bg-success",
    available: "bg-accent",
    offline: "bg-border-strong",
  }[status];

  const statusLabel = {
    connected: "Connected",
    available: "Available",
    offline: "Offline",
  }[status];

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="text-text-tertiary">{icon}</span>
      <span className="text-xs text-text-secondary flex-1">{name}</span>
      <div className="flex items-center gap-1.5">
        <Circle className={`h-1.5 w-1.5 fill-current ${dotColor}`} />
        <span className="text-[10px] text-text-tertiary">{statusLabel}</span>
      </div>
    </div>
  );
}

interface ContextItemProps {
  readonly name: string;
  readonly type: string;
}

function ContextItem({ name, type }: ContextItemProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <FileText className="h-3 w-3 text-text-tertiary" />
      <span className="text-xs text-text-secondary flex-1 truncate">
        {name}
      </span>
      <span className="text-[10px] text-text-tertiary uppercase font-mono">
        {type}
      </span>
    </div>
  );
}

interface WidgetsSidebarProps {
  readonly compiledMemory: string;
}

export function WidgetsSidebar({ compiledMemory }: WidgetsSidebarProps) {
  const facts = compiledMemory
    ? compiledMemory
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) => line.length > 0 && line !== "No memories consolidated yet.",
        )
    : [];

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <h3 className="text-[11px] font-mono uppercase tracking-[0.08em] text-text-muted">
          Widgets
        </h3>
      </div>

      {/* Scrollable accordion sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Memory — active facts */}
        <AccordionSection
          title="Memory"
          icon={<Brain className="h-4 w-4" />}
          badge={facts.length > 0 ? `${facts.length}` : undefined}
          defaultOpen
        >
          {facts.length === 0 ? (
            <p className="text-xs text-text-tertiary italic">
              No active memories yet. Start chatting and consolidate to build
              your knowledge graph.
            </p>
          ) : (
            <div className="space-y-1.5">
              {facts.map((fact, i) => (
                <div
                  key={`${fact.slice(0, 20)}-${i}`}
                  className="flex items-start gap-2 py-1"
                >
                  <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AccordionSection>

        {/* Integrations */}
        <AccordionSection
          title="Integrations"
          icon={<Plug className="h-4 w-4" />}
          defaultOpen
        >
          <div className="space-y-0.5">
            <IntegrationBadge
              name="Pinecone"
              icon={<Database className="h-3.5 w-3.5" />}
              status="connected"
            />
            <IntegrationBadge
              name="Google Gemini"
              icon={<Cpu className="h-3.5 w-3.5" />}
              status="connected"
            />
            <IntegrationBadge
              name="Claude API"
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              status="available"
            />
          </div>
        </AccordionSection>

        {/* Context */}
        <AccordionSection
          title="Context"
          icon={<FileText className="h-4 w-4" />}
        >
          <div className="space-y-0.5">
            <ContextItem name="use-memory-engine.ts" type="hook" />
            <ContextItem name="chat-panel.tsx" type="component" />
            <ContextItem name="services.py" type="backend" />
            <ContextItem name="models.py" type="schema" />
          </div>
          <p className="text-[10px] text-text-tertiary mt-2">
            Files and components currently in use
          </p>
        </AccordionSection>
      </div>
    </div>
  );
}
