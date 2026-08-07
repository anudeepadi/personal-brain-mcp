"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageSquare, Clock, User, X } from "lucide-react";

interface ChatHistoryItem {
  readonly id: string;
  readonly title: string;
  readonly preview: string;
  readonly timestamp: string;
  readonly messageCount: number;
}

const MOCK_HISTORY: readonly ChatHistoryItem[] = [
  {
    id: "chat_1",
    title: "Career transition plan",
    preview: "I've been thinking about moving into ML engineering...",
    timestamp: "2h ago",
    messageCount: 12,
  },
  {
    id: "chat_2",
    title: "Weekly review — March",
    preview: "Let me dump my thoughts from this week's meetings...",
    timestamp: "1d ago",
    messageCount: 8,
  },
  {
    id: "chat_3",
    title: "Reading notes: DDIA",
    preview: "Chapter 5 on replication was really interesting...",
    timestamp: "3d ago",
    messageCount: 24,
  },
  {
    id: "chat_4",
    title: "Project ideas",
    preview: "Memory infrastructure for AI agents...",
    timestamp: "1w ago",
    messageCount: 6,
  },
  {
    id: "chat_5",
    title: "Health & fitness goals",
    preview: "I want to track my running schedule and diet...",
    timestamp: "2w ago",
    messageCount: 15,
  },
] as const;

interface ChatSidebarProps {
  readonly activeChatId?: string;
  readonly onNewChat: () => void;
  readonly onSelectChat?: (chatId: string) => void;
}

export function ChatSidebar({
  activeChatId,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery
    ? MOCK_HISTORY.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.preview.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MOCK_HISTORY;

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius)] border border-border bg-background text-text-primary text-sm font-medium hover:bg-surface-raised transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <button
          onClick={() => setSearchOpen((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius)] text-text-tertiary text-sm hover:text-text-secondary hover:bg-background transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
      </div>

      {/* Search input (expandable) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden px-4"
          >
            <div className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                autoFocus
                className="w-full px-3 py-2 pr-8 rounded-[var(--radius)] bg-background border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {filtered.length === 0 && (
          <p className="text-xs text-text-tertiary text-center py-6">
            No conversations found
          </p>
        )}

        {filtered.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat?.(chat.id)}
              className={`w-full text-left px-3 py-3 rounded-[var(--radius)] transition-colors group ${
                isActive
                  ? "bg-background border border-border"
                  : "hover:bg-background border border-transparent"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <MessageSquare
                  className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                    isActive
                      ? "text-accent"
                      : "text-text-tertiary group-hover:text-text-secondary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm truncate ${
                      isActive
                        ? "text-text-primary font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {chat.title}
                  </p>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {chat.preview}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                      <Clock className="h-2.5 w-2.5" />
                      {chat.timestamp}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      {chat.messageCount} msgs
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* User footer */}
      <div className="shrink-0 px-4 py-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-full bg-accent flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">
              Your Brain
            </p>
            <p className="text-[10px] text-text-tertiary">
              {MOCK_HISTORY.length} conversations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
