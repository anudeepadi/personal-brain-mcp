"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex flex-col h-full bg-[#FEFCF8]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[#E8E4DE]">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-[#E8A04C]" />
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">Brain Dump</h2>
            <p className="text-xs text-[#6B6B6B]">
              Thoughts, questions, and uploads flow into your memory
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-[#E8E4DE] mb-3" />
            <p className="text-sm text-[#6B6B6B]">
              Start typing to dump thoughts into your brain...
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#E8A04C] text-white rounded-2xl rounded-br-md"
                    : "bg-white border border-[#E8E4DE] text-[#1A1A1A] rounded-2xl rounded-bl-md"
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
      <div className="shrink-0 px-6 py-4 border-t border-[#E8E4DE]">
        <div className="flex items-end gap-2">
          <button
            className="shrink-0 p-2.5 rounded-xl border border-[#E8E4DE] text-[#6B6B6B] hover:text-[#E8A04C] hover:border-[#E8A04C] transition-colors"
            aria-label="Upload file"
          >
            <Upload className="h-5 w-5" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Dump a thought, ask a question, or upload a file..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#E8E4DE] bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B]/50 focus:outline-none focus:border-[#E8A04C] transition-colors"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 p-2.5 rounded-xl bg-[#E8A04C] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4902f] transition-colors"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
