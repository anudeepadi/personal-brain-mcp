import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchChat, storeMemory, searchMemories } from "../api";

// ── Helpers ──────────────────────────────────────────────────────────

function mockFetchResponse(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

function mockFetchFailure(status: number, body?: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok: false,
      status,
      json: () => Promise.resolve(body ?? { detail: "error" }),
    }),
  );
}

function mockFetchNetworkError(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")),
  );
}

// ── Tests ────────────────────────────────────────────────────────────

describe("fetchChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends correct request to /api/chat/enhanced", async () => {
    const responseBody = {
      response: "Hello!",
      references: [],
      confidence_score: 0.95,
      model_used: "gemini",
    };
    mockFetchResponse(responseBody);

    const result = await fetchChat("Hi there", []);

    const fetchFn = vi.mocked(fetch);
    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, options] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/chat/enhanced");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(options?.body as string)).toEqual({
      query: "Hi there",
      chat_history: [],
      include_references: true,
    });
  });

  it("returns typed ChatResponse on success", async () => {
    mockFetchResponse({
      response: "Memory stored.",
      references: [{ content: "ref1", document_id: "d1" }],
      confidence_score: 0.88,
      model_used: "gemini",
    });

    const result = await fetchChat("test query", []);

    expect(result).toEqual({
      ok: true,
      data: {
        response: "Memory stored.",
        references: [{ content: "ref1", document_id: "d1" }],
        confidenceScore: 0.88,
        modelUsed: "gemini",
      },
    });
  });

  it("passes chat_history from argument", async () => {
    mockFetchResponse({
      response: "ok",
      references: [],
      confidence_score: 0.5,
      model_used: "gemini",
    });

    const history = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi" },
    ];
    await fetchChat("follow-up", history);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.chat_history).toEqual(history);
  });

  it("returns error result on 429 (rate limit)", async () => {
    mockFetchFailure(429, { detail: "Rate limit exceeded" });

    const result = await fetchChat("test", []);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RATE_LIMITED");
      expect(result.error.status).toBe(429);
    }
  });

  it("returns error result on 503 (service unavailable)", async () => {
    mockFetchFailure(503);

    const result = await fetchChat("test", []);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SERVICE_UNAVAILABLE");
    }
  });

  it("returns error result on 500 (server error)", async () => {
    mockFetchFailure(500);

    const result = await fetchChat("test", []);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SERVER_ERROR");
    }
  });

  it("returns network error on fetch failure", async () => {
    mockFetchNetworkError();

    const result = await fetchChat("test", []);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });
});

describe("storeMemory", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends correct request to /api/memories", async () => {
    mockFetchResponse({
      memory_id: "mem_123",
      chunks_stored: 1,
      status: "stored",
    });

    await storeMemory("I live in Austin", "session_abc", ["location"]);

    const fetchFn = vi.mocked(fetch);
    const [url, options] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/memories");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(options?.body as string)).toEqual({
      content: "I live in Austin",
      source: "chat",
      session_id: "session_abc",
      tags: ["location"],
    });
  });

  it("returns typed MemoryStoreResult on success", async () => {
    mockFetchResponse({
      memory_id: "mem_456",
      chunks_stored: 2,
      status: "stored",
    });

    const result = await storeMemory("facts", "sess_1");

    expect(result).toEqual({
      ok: true,
      data: {
        memoryId: "mem_456",
        chunksStored: 2,
        status: "stored",
      },
    });
  });

  it("defaults tags to empty array when not provided", async () => {
    mockFetchResponse({
      memory_id: "mem_789",
      chunks_stored: 1,
      status: "stored",
    });

    await storeMemory("data", "sess_2");

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.tags).toEqual([]);
  });

  it("handles server error gracefully", async () => {
    mockFetchFailure(500);

    const result = await storeMemory("data", "sess_3");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SERVER_ERROR");
    }
  });

  it("handles network error gracefully", async () => {
    mockFetchNetworkError();

    const result = await storeMemory("data", "sess_4");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });
});

describe("searchMemories", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends correct GET request with query params", async () => {
    mockFetchResponse([]);

    await searchMemories("Austin");

    const fetchFn = vi.mocked(fetch);
    const [url, options] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/search?q=Austin&top_k=5");
    expect(options?.method).toBe("GET");
  });

  it("uses custom topK when provided", async () => {
    mockFetchResponse([]);

    await searchMemories("test", 10);

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/search?q=test&top_k=10");
  });

  it("returns typed SearchResult array on success", async () => {
    mockFetchResponse([
      {
        content: "I live in Austin",
        metadata: { source: "chat" },
        relevance_score: 0.92,
        document_id: "doc_1",
        references: [],
      },
    ]);

    const result = await searchMemories("Austin");

    expect(result).toEqual({
      ok: true,
      data: [
        {
          content: "I live in Austin",
          metadata: { source: "chat" },
          relevanceScore: 0.92,
          documentId: "doc_1",
          references: [],
        },
      ],
    });
  });

  it("handles empty results", async () => {
    mockFetchResponse([]);

    const result = await searchMemories("nonexistent");

    expect(result).toEqual({ ok: true, data: [] });
  });

  it("handles server error", async () => {
    mockFetchFailure(500);

    const result = await searchMemories("test");

    expect(result.ok).toBe(false);
  });

  it("handles network error", async () => {
    mockFetchNetworkError();

    const result = await searchMemories("test");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });

  it("encodes special characters in query", async () => {
    mockFetchResponse([]);

    await searchMemories("hello world & more");

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/search?q=hello+world+%26+more&top_k=5");
  });
});
