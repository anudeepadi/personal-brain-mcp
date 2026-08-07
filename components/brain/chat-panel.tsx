"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Upload, Search } from "lucide-react";
import { WelcomeState } from "./welcome-state";
import { TypingIndicator } from "./typing-indicator";
import { RecallResults } from "./recall-results";
import { parseChatInput, type ChatMode } from "@/lib/chat-mode";
import type { SearchResultItem } from "@/lib/api";

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
  readonly isStreaming?: boolean;
  readonly interrupted?: boolean;
}

interface ChatPanelProps {
  readonly messages: readonly ChatMessage[];
  readonly isTyping: boolean;
  readonly recallResults: readonly SearchResultItem[] | null;
  readonly chatMode: ChatMode;
  readonly onSendMessage: (content: string) => void;
  readonly onRetry?: () => void;
  readonly onToggleMode: (mode: ChatMode) => void;
}

export function ChatPanel({
  messages,
  isTyping,
  recallResults,
  chatMode,
  onSendMessage,
  onRetry,
  onToggleMode,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, recallResults]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    // Auto-detect /recall prefix
    const parsed = parseChatInput(value);
    if (parsed.mode !== chatMode) {
      onToggleMode(parsed.mode);
    }
  }

  const isRecallMode = chatMode === "recall";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
              {isRecallMode ? (
                <Search className="size-4 text-accent" />
              ) : (
                <MessageSquare className="size-4 text-accent" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {isRecallMode ? "Memory Recall" : "Brain Dump"}
              </h2>
              <p className="text-[11px] font-mono text-text-muted">
                {isRecallMode
                  ? "Search your memory graph"
                  : "Thoughts, questions, and uploads flow into your memory"}
              </p>
            </div>
          </div>
          {/* Mode indicator */}
          <ModeIndicator mode={chatMode} onToggle={onToggleMode} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !recallResults && (
          <WelcomeState onSendPrompt={onSendMessage} />
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed rounded-[var(--radius)] ${
                  msg.role === "user"
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-text-primary"
                }`}
              >
                {msg.content}
                {msg.interrupted && (
                  <button
                    onClick={onRetry}
                    className="block mt-2 text-[11px] font-mono text-accent underline hover:text-accent-hover transition-colors"
                  >
                    Response interrupted. Tap to retry.
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        {recallResults !== null && (
          <RecallResults results={recallResults} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-6 py-4 border-t border-border">
        <div className="flex items-end gap-2">
          <button
            className="shrink-0 p-2.5 rounded-[var(--radius)] border border-border text-text-tertiary hover:text-accent hover:border-accent/30 transition-colors"
            aria-label="Upload file"
          >
            <Upload className="size-4" />
          </button>

          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecallMode
                ? "/recall search your memories..."
                : "Dump a thought, ask a question, or upload a file..."
            }
            rows={1}
            className="flex-1 resize-none rounded-[var(--radius)] border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-colors"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 p-2.5 rounded-[var(--radius)] bg-accent text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
            aria-label={isRecallMode ? "Search memories" : "Send message"}
          >
            {isRecallMode ? (
              <Search className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mode Indicator ──────────────────────────────────────────────────

interface ModeIndicatorProps {
  readonly mode: ChatMode;
  readonly onToggle: (mode: ChatMode) => void;
}

function ModeIndicator({ mode, onToggle }: ModeIndicatorProps) {
  return (
    <div className="flex items-center gap-1 bg-surface border border-border rounded-full p-0.5">
      <button
        onClick={() => onToggle("chat")}
        className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.05em] transition-colors ${
          mode === "chat"
            ? "bg-background text-accent font-medium shadow-sm"
            : "text-text-tertiary hover:text-text-secondary"
        }`}
      >
        Chat
      </button>
      <button
        onClick={() => onToggle("recall")}
        className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.05em] transition-colors ${
          mode === "recall"
            ? "bg-background text-accent font-medium shadow-sm"
            : "text-text-tertiary hover:text-text-secondary"
        }`}
      >
        Recall
      </button>
    </div>
  );
}
