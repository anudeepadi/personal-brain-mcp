"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Upload } from "lucide-react";

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}

interface ChatPanelProps {
  readonly messages: readonly ChatMessage[];
  readonly onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <MessageSquare className="size-4 text-accent" />
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Brain Dump
            </h2>
            <p className="text-xs text-text-tertiary">
              Thoughts, questions, and uploads flow into your memory
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="size-10 text-border-strong mb-3" />
            <p className="text-sm text-text-tertiary">
              Start typing to dump thoughts into your brain...
            </p>
          </div>
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Dump a thought, ask a question, or upload a file..."
            rows={1}
            className="flex-1 resize-none rounded-[var(--radius)] border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/40 transition-colors"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 p-2.5 rounded-[var(--radius)] bg-accent text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
