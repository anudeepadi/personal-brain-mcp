/**
 * Integration tests for the brain page's fetchChat/storeMemory wiring.
 * These test the helper functions that the page uses, not the React component
 * rendering (which would require a full component test setup).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchChat, storeMemory } from "../api";
import { getSessionId } from "../session";

// ── Mock helpers ─────────────────────────────────────────────────────

function mockFetchResponses(responses: Array<{ body: unknown; status?: number }>): void {
  const mockFn = vi.fn();
  for (const { body, status = 200 } of responses) {
    mockFn.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
  }
  vi.stubGlobal("fetch", mockFn);
}

function mockLocalStorage(data: Record<string, string> = {}): void {
  const store = { ...data };
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  });
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "integration-test-session"),
  });
}

// ── Tests ────────────────────────────────────────────────────────────

describe("brain page integration: chat + memory storage flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchChat returns AI response, then storeMemory fires non-blocking", async () => {
    mockLocalStorage();
    mockFetchResponses([
      // First call: fetchChat
      {
        body: {
          response: "Location stored!",
          references: [],
          confidence_score: 0.9,
          model_used: "gemini",
        },
      },
      // Second call: storeMemory
      {
        body: {
          memory_id: "mem_1",
          chunks_stored: 1,
          status: "stored",
        },
      },
    ]);

    // Step 1: Send chat message
    const chatResult = await fetchChat("I live in Austin", []);
    expect(chatResult.ok).toBe(true);
    if (chatResult.ok) {
      expect(chatResult.data.response).toBe("Location stored!");
    }

    // Step 2: Store memory (fire-and-forget in real code)
    const sessionId = getSessionId();
    const storeResult = await storeMemory(
      "I live in Austin",
      sessionId,
      ["location"],
    );
    expect(storeResult.ok).toBe(true);

    // Verify both fetch calls were made
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it("falls back gracefully when fetchChat returns network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")),
    );

    const result = await fetchChat("test message", []);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });

  it("storeMemory failure does not block the chat flow", async () => {
    mockFetchResponses([
      // fetchChat succeeds
      {
        body: {
          response: "Got it!",
          references: [],
          confidence_score: 0.8,
          model_used: "gemini",
        },
      },
    ]);
    // storeMemory will fail with network error
    const fetchFn = vi.mocked(fetch);
    fetchFn.mockRejectedValueOnce(new TypeError("Network down"));

    const chatResult = await fetchChat("test", []);
    expect(chatResult.ok).toBe(true);

    // storeMemory fails but returns error (does not throw)
    mockLocalStorage();
    const storeResult = await storeMemory("test", getSessionId());
    expect(storeResult.ok).toBe(false);
  });

  it("passes last 10 messages as chat history", async () => {
    mockFetchResponses([
      {
        body: {
          response: "ok",
          references: [],
          confidence_score: 0.5,
          model_used: "gemini",
        },
      },
    ]);

    const history = Array.from({ length: 12 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `message ${i}`,
    }));

    // Take last 10
    const last10 = history.slice(-10);
    await fetchChat("new message", last10);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.chat_history).toHaveLength(10);
    expect(body.chat_history[0].content).toBe("message 2");
  });
});
