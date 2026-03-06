"use client";

import { useState, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { ChatPanel, type ChatMessage } from "@/components/brain/chat-panel";
import { MemoryDashboard } from "@/components/brain/memory-dashboard";
import { useMemoryStore } from "@/lib/use-memory-store";

let msgIdCounter = 0;
function nextMsgId(): string {
  msgIdCounter += 1;
  return `msg_${msgIdCounter}`;
}

function simulateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("live") || lower.includes("moved") || lower.includes("city")) {
    return "I've captured that location info in your event stream. You can hit 'Consolidate Now' on the right panel to update your memory graph with this fact.";
  }
  if (lower.includes("work") || lower.includes("job") || lower.includes("company")) {
    return "Got it -- work info recorded. After consolidation, you'll see this as an edge in your temporal graph connecting you to the entity.";
  }
  if (lower.includes("prefer") || lower.includes("like") || lower.includes("love")) {
    return "Preference noted! This kind of fact gets stored as a preference edge. If you later change your mind, consolidation will handle the contradiction.";
  }
  return "Thought captured in the event stream. Keep dumping thoughts -- when you're ready, consolidate to build your knowledge graph.";
}

export default function BrainPage() {
  const memory = useMemoryStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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

      // Simulated assistant response
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

  return (
    <div className="h-[calc(100vh-4rem)]">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={30}>
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
        </Panel>

        <PanelResizeHandle className="w-[3px] bg-gradient-to-b from-[#E8A04C] to-[#818CF8] hover:w-[5px] transition-all duration-200 cursor-col-resize" />

        <Panel defaultSize={50} minSize={30}>
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
        </Panel>
      </PanelGroup>
    </div>
  );
}
