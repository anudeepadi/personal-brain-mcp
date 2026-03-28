"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ChatPanel, type ChatMessage } from "@/components/brain/chat-panel";
import { MemoryDashboard } from "@/components/brain/memory-dashboard";
import { WidgetsSidebar } from "@/components/brain/widgets-sidebar";
import { StatusBar } from "@/components/brain/status-bar";
import { MemoryToast } from "@/components/ui/memory-toast";
import { useMemoryStore } from "@/lib/use-memory-store";
import {
  fetchChat,
  fetchChatStream,
  storeMemory,
  searchMemories,
} from "@/lib/api";
import type { SearchResultItem } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { parseChatInput, type ChatMode } from "@/lib/chat-mode";
import { createSessionStats, type SessionStats } from "@/lib/use-session-stats";
import { simulateResponse } from "@/lib/simulate-response";

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
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("chat");
  const [recallResults, setRecallResults] = useState<
    readonly SearchResultItem[] | null
  >(null);
  const [toastContent, setToastContent] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Session stats — stable ref across renders
  const statsRef = useRef<SessionStats>(createSessionStats());
  const [memoryCount, setMemoryCount] = useState(0);
  const [searchCount, setSearchCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState("0m");

  // Last user message for retry
  const lastUserMessageRef = useRef<string>("");

  // Session timer — updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(statsRef.current.getFormattedDuration());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const showMemoryToast = useCallback((content: string) => {
    setToastContent(content);
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleStoreMemory = useCallback(
    async (content: string) => {
      const result = await storeMemory(content, getSessionId());
      if (result.ok) {
        const snap = statsRef.current.incrementMemories();
        setMemoryCount(snap.memoryCount);
        showMemoryToast(content);
      }
    },
    [showMemoryToast],
  );

  const handleStreamChat = useCallback(
    async (content: string) => {
      setIsTyping(true);

      // Try streaming first
      const streamResult = await fetchChatStream(content);

      if (streamResult.ok) {
        setIsOffline(false);

        // Create a placeholder assistant message that updates as chunks arrive
        const assistantId = crypto.randomUUID();
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);

        // Read chunks progressively
        const reader = streamResult.stream.getReader();
        let accumulated = "";
        let streamDone = false;

        try {
          while (!streamDone) {
            const { done, value } = await reader.read();
            streamDone = done;
            if (value !== undefined) {
              accumulated += value;
              const currentContent = accumulated;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: currentContent }
                    : m,
                ),
              );
            }
          }

          // Mark streaming complete
          const finalContent = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: finalContent, isStreaming: false }
                : m,
            ),
          );
        } catch {
          // Stream interrupted
          const partialContent = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: partialContent || "Response interrupted.",
                    isStreaming: false,
                    interrupted: true,
                  }
                : m,
            ),
          );
        }

        handleStoreMemory(content);
        return;
      }

      // Fallback to non-streaming enhanced chat
      const history = buildChatHistory(messages);
      const result = await fetchChat(content, history);

      setIsTyping(false);

      if (result.ok) {
        setIsOffline(false);
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        handleStoreMemory(content);
      } else if (result.error.code === "NETWORK_ERROR") {
        setIsOffline(true);
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: simulateResponse(content),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: simulateResponse(content),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    },
    [messages, handleStoreMemory],
  );

  const handleRecallSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setRecallResults([]);
      return;
    }

    const snap = statsRef.current.incrementSearches();
    setSearchCount(snap.searchCount);

    const result = await searchMemories(query);
    if (result.ok) {
      setRecallResults(result.data);
    } else {
      setRecallResults([]);
    }
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      const parsed = parseChatInput(content);

      if (parsed.mode === "recall") {
        setChatMode("recall");
        handleRecallSearch(parsed.query);
        return;
      }

      // Reset recall state when sending a chat message
      setChatMode("chat");
      setRecallResults(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      memory.appendEvent(content, "chat");
      lastUserMessageRef.current = content;

      handleStreamChat(content);
    },
    [memory, handleStreamChat, handleRecallSearch],
  );

  const handleRetry = useCallback(() => {
    const lastMsg = lastUserMessageRef.current;
    if (!lastMsg) return;

    // Remove the interrupted assistant message
    setMessages((prev) => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].interrupted) {
        return prev.slice(0, lastIndex);
      }
      return prev;
    });

    handleStreamChat(lastMsg);
  }, [handleStreamChat]);

  const handleConsolidate = useCallback(() => {
    memory.consolidate();
  }, [memory]);

  const handleToggleMode = useCallback((mode: ChatMode) => {
    setChatMode(mode);
    if (mode === "chat") {
      setRecallResults(null);
    }
  }, []);

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

      {/* MCP status bar */}
      <StatusBar
        memoryCount={memoryCount}
        searchCount={searchCount}
        sessionDuration={sessionDuration}
      />

      {/* 2-panel layout: Chat | Widgets+Dashboard */}
      <div className="flex-1 min-h-0">
        <Group orientation="horizontal" className="h-full">
          {/* Left — chat */}
          <Panel defaultSize={62} minSize={40}>
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              recallResults={recallResults}
              chatMode={chatMode}
              onSendMessage={handleSendMessage}
              onRetry={handleRetry}
              onToggleMode={handleToggleMode}
            />
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

      {/* Memory toast */}
      {toastContent !== null && (
        <MemoryToast
          content={toastContent}
          visible={toastVisible}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}

// ── Tab Button ──────────────────────────────────────────────────────

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
