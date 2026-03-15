"use client";

import { useState, useCallback } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ChatPanel, type ChatMessage } from "@/components/brain/chat-panel";
import { MemoryDashboard } from "@/components/brain/memory-dashboard";
import { ChatSidebar } from "@/components/brain/chat-sidebar";
import { WidgetsSidebar } from "@/components/brain/widgets-sidebar";
import { useMemoryStore } from "@/lib/use-memory-store";

let msgIdCounter = 0;
function nextMsgId(): string {
  msgIdCounter += 1;
  return `msg_${msgIdCounter}`;
}

function simulateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (
    lower.includes("live") ||
    lower.includes("moved") ||
    lower.includes("city")
  ) {
    return "I've captured that location info in your event stream. You can hit 'Consolidate Now' on the right panel to update your memory graph with this fact.";
  }
  if (
    lower.includes("work") ||
    lower.includes("job") ||
    lower.includes("company")
  ) {
    return "Got it — work info recorded. After consolidation, you'll see this as an edge in your temporal graph connecting you to the entity.";
  }
  if (
    lower.includes("prefer") ||
    lower.includes("like") ||
    lower.includes("love")
  ) {
    return "Preference noted! This kind of fact gets stored as a preference edge. If you later change your mind, consolidation will handle the contradiction.";
  }
  return "Thought captured in the event stream. Keep dumping thoughts — when you're ready, consolidate to build your knowledge graph.";
}

type RightTab = "widgets" | "dashboard";

export default function BrainPage() {
  const memory = useMemoryStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rightTab, setRightTab] = useState<RightTab>("widgets");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSendMessage = useCallback(
    (content: string) => {
      const userMsg: ChatMessage = {
        id: nextMsgId(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      memory.appendEvent(content, "chat");

      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: nextMsgId(),
          role: "assistant",
          content: simulateResponse(content),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 500);
    },
    [memory],
  );

  const handleConsolidate = useCallback(() => {
    memory.consolidate();
  }, [memory]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    memory.reset();
  }, [memory]);

  const eventCount = memory.events.length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* MCP status bar */}
      <div className="shrink-0 h-8 bg-surface border-b border-border flex items-center px-4 gap-3">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="font-mono text-[10px] text-text-tertiary">
            MCP Connected
          </span>
        </span>
        <span className="text-border-strong text-[10px]">·</span>
        <span className="font-mono text-[10px] text-text-tertiary">
          Pinecone
        </span>
        <span className="text-border-strong text-[10px]">·</span>
        <span className="font-mono text-[10px] text-text-tertiary">
          Gemini Flash
        </span>
        <span className="text-border-strong text-[10px]">·</span>
        <span className="font-mono text-[10px] text-text-tertiary">
          {eventCount} event{eventCount !== 1 ? "s" : ""} in stream
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          {/* Left sidebar — chat history */}
          {!sidebarCollapsed && (
            <>
              <Panel defaultSize={18} minSize={14} maxSize={25}>
                <ChatSidebar
                  onNewChat={handleNewChat}
                  onSelectChat={() => {
                    /* mock — no-op for now */
                  }}
                />
              </Panel>
              <Separator className="w-px bg-border hover:w-[2px] hover:bg-accent/40 transition-all duration-200 cursor-col-resize" />
            </>
          )}

          {/* Center — chat panel */}
          <Panel defaultSize={sidebarCollapsed ? 60 : 47} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Collapse toggle */}
              <div className="shrink-0 h-0 relative">
                <button
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  className="absolute top-3 left-2 z-10 w-6 h-6 rounded border border-border flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-surface transition-colors text-xs md:hidden"
                  aria-label={
                    sidebarCollapsed ? "Show sidebar" : "Hide sidebar"
                  }
                >
                  {sidebarCollapsed ? "›" : "‹"}
                </button>
              </div>
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </div>
          </Panel>

          <Separator className="w-px bg-border hover:w-[2px] hover:bg-accent/40 transition-all duration-200 cursor-col-resize" />

          {/* Right area — tabs: Widgets | Dashboard */}
          <Panel defaultSize={sidebarCollapsed ? 40 : 35} minSize={25}>
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
      className={`flex-1 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
        active
          ? "text-accent border-b-2 border-accent bg-background"
          : "text-text-tertiary hover:text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}
