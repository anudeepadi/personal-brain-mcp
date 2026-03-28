import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchChatStream } from "../api";

// ── Helpers ──────────────────────────────────────────────────────────

function createMockSSEResponse(chunks: readonly string[]): Response {
  const encoder = new TextEncoder();
  let index = 0;

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(`data: ${chunks[index]}\n\n`));
        index += 1;
      } else {
        controller.close();
      }
    },
  });

  return {
    ok: true,
    status: 200,
    body: stream,
    headers: new Headers({ "content-type": "text/event-stream" }),
  } as unknown as Response;
}

function createMockErrorResponse(status: number): Response {
  return {
    ok: false,
    status,
    body: null,
    headers: new Headers(),
  } as unknown as Response;
}

// ── Tests ────────────────────────────────────────────────────────────

describe("fetchChatStream", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends POST request to /api/chat with FormData", async () => {
    const mockResponse = createMockSSEResponse(["Hello"]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    await fetchChatStream("test query", "gemini");

    const fetchFn = vi.mocked(fetch);
    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, options] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);

    const formData = options?.body as FormData;
    expect(formData.get("query")).toBe("test query");
    expect(formData.get("model_provider")).toBe("gemini");
  });

  it("returns a stream result on success", async () => {
    const mockResponse = createMockSSEResponse(["Hello", " World"]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await fetchChatStream("test", "gemini");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stream).toBeDefined();
      expect(result.abort).toBeInstanceOf(Function);
    }
  });

  it("yields text chunks from SSE stream", async () => {
    const chunks = ["Hello", " there", " friend"];
    const mockResponse = createMockSSEResponse(chunks);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await fetchChatStream("test", "gemini");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const received: string[] = [];
    const reader = result.stream.getReader();

    let done = false;
    while (!done) {
      const read = await reader.read();
      done = read.done;
      if (read.value !== undefined) {
        received.push(read.value);
      }
    }

    expect(received).toEqual(chunks);
  });

  it("returns error result on HTTP failure", async () => {
    const mockResponse = createMockErrorResponse(500);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await fetchChatStream("test", "gemini");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SERVER_ERROR");
    }
  });

  it("returns error result on 429 rate limit", async () => {
    const mockResponse = createMockErrorResponse(429);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await fetchChatStream("test", "gemini");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RATE_LIMITED");
    }
  });

  it("returns network error on fetch exception", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")),
    );

    const result = await fetchChatStream("test", "gemini");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });

  it("provides an abort function that cancels the request", async () => {
    const mockResponse = createMockSSEResponse(["Hello"]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await fetchChatStream("test", "gemini");

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Abort should not throw
      expect(() => result.abort()).not.toThrow();
    }
  });

  it("handles SSE data: [DONE] sentinel", async () => {
    const encoder = new TextEncoder();
    let index = 0;
    const messages = ["Hello", "[DONE]"];

    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (index < messages.length) {
          controller.enqueue(
            encoder.encode(`data: ${messages[index]}\n\n`),
          );
          index += 1;
        } else {
          controller.close();
        }
      },
    });

    const mockResponse = {
      ok: true,
      status: 200,
      body: stream,
      headers: new Headers({ "content-type": "text/event-stream" }),
    } as unknown as Response;

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await fetchChatStream("test", "gemini");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const received: string[] = [];
    const reader = result.stream.getReader();

    let done = false;
    while (!done) {
      const read = await reader.read();
      done = read.done;
      if (read.value !== undefined) {
        received.push(read.value);
      }
    }

    // Should only contain "Hello", not "[DONE]"
    expect(received).toEqual(["Hello"]);
  });
});
