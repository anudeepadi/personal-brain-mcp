// ── Chat input parsing ──────────────────────────────────────────────
// Detects /recall command prefix to toggle between chat and search modes.

export type ChatMode = "chat" | "recall";

export interface ChatInputResult {
  readonly mode: ChatMode;
  readonly query: string;
}

const RECALL_PREFIX = /^\/recall\b/i;

/**
 * Parse raw chat input to determine mode (chat vs. recall search).
 * "/recall <query>" triggers recall mode; everything else is chat.
 */
export function parseChatInput(input: string): ChatInputResult {
  const trimmed = input.trim();

  if (RECALL_PREFIX.test(trimmed)) {
    const query = trimmed.replace(RECALL_PREFIX, "").trim();
    return { mode: "recall", query };
  }

  return { mode: "chat", query: trimmed };
}
