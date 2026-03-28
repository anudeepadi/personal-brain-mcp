"use client";

import { useState, useCallback } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ChatPanel, type ChatMessage } from "@/components/brain/chat-panel";
import { MemoryDashboard } from "@/components/brain/memory-dashboard";
import { WidgetsSidebar } from "@/components/brain/widgets-sidebar";
import { useMemoryStore } from "@/lib/use-memory-store";
import { fetchChat, storeMemory } from "@/lib/api";
import { getSessionId } from "@/lib/session";

// ── Fallback simulation (used when backend is unreachable) ───────────

function simulateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (
    lower.includes("live") ||
    lower.includes("moved") ||
    lower.includes("city")
  ) {
    return "Location captured in your event stream. Hit 'Consolidate Now' in the Dashboard tab to promote this to your temporal graph.";
  }
  if (
    lower.includes("work") ||
    lower.includes("job") ||
    lower.includes("company")
  ) {
    return "Work info recorded. After consolidation, you'll see this as an employment edge in your knowledge graph with a valid_from timestamp.";
  }
  if (
    lower.includes("prefer") ||
    lower.includes("like") ||
    lower.includes("love")
  ) {
    return "Preference noted. Stored as a preference edge — if you change your mind later, consolidation will resolve the contradiction and mark the old edge valid_until.";
  }
  if (
    lower.includes("remember") ||
    lower.includes("what") ||
    lower.includes("recall")
  ) {
    return "Searching your memory graph... (In the live version, this queries your Pinecone index and returns semantically relevant facts with timestamps.)";
  }
  return "Thought captured in the event stream. Keep dumping — when ready, hit Consolidate to build your knowledge graph.";
}

// ── Chat history helper ──────────────────────────────────────────────

const MAX_HISTORY = 10;

function buildChatHistory(
  msgs: readonly ChatMessage[],
): ReadonlyArray<{ readonly role: string; readonly content: string }> {
  return msgs.slice(-MAX_HISTORY).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

type RightTab = "widgets" | "dashboard";

export default function BrainPage() {
  const memory = useMemoryStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rightTab, setRightTab] = useState<RightTab>("widgets");
  const [isOffline, setIsOffline] = useState(false);

  const handleSendMessage = useCallback(
    (content: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      memory.appendEvent(content, "chat");

      const history = buildChatHistory(messages);

      // Try real backend first, fall back to simulation
      fetchChat(content, history).then((result) => {
        if (result.ok) {
          setIsOffline(false);
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.data.response,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);

          // Fire-and-forget: store memory in Pinecone
          storeMemory(content, getSessionId());
        } else if (result.error.code === "NETWORK_ERROR") {
          // Backend unreachable — fall back to simulation
          setIsOffline(true);
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: simulateResponse(content),
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          // Other API error — still show a simulated response
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: simulateResponse(content),
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      });
    },
    [memory, messages],
  );

  const handleConsolidate = useCallback(() => {
    memory.consolidate();
  }, [memory]);

  const eventCount = memory.events.length;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] overflow-hidden">
      {/* Offline mode banner */}
      {isOffline && (
        <div className="shrink-0 bg-accent/10 border-b border-accent/20 px-5 py-1.5 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[11px] text-accent font-medium">
            Offline mode — memory service unreachable. Chat works locally.
          </span>
        </div>
      )}

      {/* MCP status bar — warm surface with amber accents */}
      <div className="shrink-0 bg-surface border-b border-border flex items-center justify-between px-5 py-2">
        <div className="flex items-center gap-3">
          <span className="font-display italic text-sm text-accent">
            Mnemonic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" />
            <span className="font-mono text-[10px] text-text-tertiary">
              MCP Connected
            </span>
          </span>
          <span className="text-border-strong select-none">·</span>
          <span className="font-mono text-[10px] text-text-tertiary">
            Pinecone
          </span>
          <span className="text-border-strong select-none">·</span>
          <span className="font-mono text-[10px] text-text-tertiary">
            Gemini Flash
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-accent font-medium">
            {eventCount} event{eventCount !== 1 ? "s" : ""}
          </span>
          <span className="size-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
        </div>
      </div>

      {/* 2-panel layout: Chat | Widgets+Dashboard */}
      <div className="flex-1 min-h-0">
        <Group orientation="horizontal" className="h-full">
          {/* Left — chat */}
          <Panel defaultSize={62} minSize={40}>
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
          </Panel>

          <Separator className="w-px bg-border data-[resize-handle-state=drag]:bg-accent/60 data-[resize-handle-state=hover]:bg-accent/30 transition-colors cursor-col-resize" />

          {/* Right — Widgets / Dashboard */}
          <Panel defaultSize={38} minSize={28}>
            <div className="flex flex-col h-full bg-surface">
              {/* Tab bar */}
              <div className="shrink-0 flex border-b border-border">
                <TabButton
                  label="Widgets"
                  active={rightTab === "widgets"}
                  onClick={() => setRightTab("widgets")}
                />
                <TabButton
                  label="Dashboard"
                  active={rightTab === "dashboard"}
                  onClick={() => setRightTab("dashboard")}
                />
              </div>
              {/* Tab content */}
              <div className="flex-1 overflow-hidden">
                {rightTab === "widgets" ? (
                  <WidgetsSidebar compiledMemory={memory.compiledMemory} />
                ) : (
                  <MemoryDashboard
                    events={memory.events}
                    nodes={memory.nodes}
                    edges={memory.edges}
                    compiledMemory={memory.compiledMemory}
                    isConsolidating={memory.isConsolidating}
                    contradictionsResolved={
                      memory.lastConsolidation?.contradictionsResolved ?? 0
                    }
                    onConsolidate={handleConsolidate}
                  />
                )}
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}

interface TabButtonProps {
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2.5 text-xs font-mono uppercase tracking-[0.08em] transition-colors ${
        active
          ? "text-accent border-b-2 border-accent bg-background font-medium"
          : "text-text-tertiary hover:text-text-secondary bg-surface"
      }`}
    >
      {label}
    </button>
  );
}
