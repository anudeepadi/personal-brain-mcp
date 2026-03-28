import { describe, it, expect } from "vitest";
import { parseChatInput, type ChatInputResult } from "@/lib/chat-mode";

describe("parseChatInput", () => {
  it("detects /recall command and extracts query", () => {
    const result = parseChatInput("/recall Austin Texas");
    expect(result.mode).toBe("recall");
    expect(result.query).toBe("Austin Texas");
  });

  it("handles /recall with extra whitespace", () => {
    const result = parseChatInput("/recall   lots of spaces  ");
    expect(result.mode).toBe("recall");
    expect(result.query).toBe("lots of spaces");
  });

  it("treats regular messages as chat mode", () => {
    const result = parseChatInput("I live in Austin");
    expect(result.mode).toBe("chat");
    expect(result.query).toBe("I live in Austin");
  });

  it("handles /recall with no query as empty recall", () => {
    const result = parseChatInput("/recall");
    expect(result.mode).toBe("recall");
    expect(result.query).toBe("");
  });

  it("treats /recall not at start as regular chat", () => {
    const result = parseChatInput("please /recall something");
    expect(result.mode).toBe("chat");
    expect(result.query).toBe("please /recall something");
  });

  it("is case-insensitive for /recall command", () => {
    const result = parseChatInput("/RECALL my data");
    expect(result.mode).toBe("recall");
    expect(result.query).toBe("my data");
  });

  it("returns the original content for chat mode", () => {
    const content = "I prefer dark mode for coding";
    const result = parseChatInput(content);
    expect(result.mode).toBe("chat");
    expect(result.query).toBe(content);
  });
});
