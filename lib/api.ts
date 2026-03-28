// ── Types ────────────────────────────────────────────────────────────

export interface ChatHistoryEntry {
  readonly role: string;
  readonly content: string;
}

export interface DocumentReference {
  readonly content: string;
  readonly document_id: string;
}

export interface ChatResponseData {
  readonly response: string;
  readonly references: readonly DocumentReference[];
  readonly confidenceScore: number;
  readonly modelUsed: string;
}

export interface MemoryStoreResultData {
  readonly memoryId: string;
  readonly chunksStored: number;
  readonly status: string;
}

export interface SearchResultItem {
  readonly content: string;
  readonly metadata: Record<string, unknown>;
  readonly relevanceScore: number;
  readonly documentId: string;
  readonly references: readonly DocumentReference[];
}

export interface ApiError {
  readonly code:
    | "RATE_LIMITED"
    | "SERVICE_UNAVAILABLE"
    | "SERVER_ERROR"
    | "NETWORK_ERROR";
  readonly status: number;
  readonly message: string;
}

export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiError };

// ── Type aliases for public API ──────────────────────────────────────

export type ChatResponse = ApiResult<ChatResponseData>;
export type MemoryStoreResult = ApiResult<MemoryStoreResultData>;
export type SearchResult = ApiResult<readonly SearchResultItem[]>;

// ── Error mapping ────────────────────────────────────────────────────

function mapHttpError(status: number): ApiError {
  if (status === 429) {
    return {
      code: "RATE_LIMITED",
      status,
      message: "AI is thinking... please retry in a moment.",
    };
  }
  if (status === 503) {
    return {
      code: "SERVICE_UNAVAILABLE",
      status,
      message: "Memory service is temporarily unavailable.",
    };
  }
  return {
    code: "SERVER_ERROR",
    status,
    message: "Something went wrong. Please try again.",
  };
}

function networkError(err: unknown): ApiError {
  return {
    code: "NETWORK_ERROR",
    status: 0,
    message:
      err instanceof Error ? err.message : "Network connection failed.",
  };
}

// ── API functions ────────────────────────────────────────────────────

/**
 * Send a chat message and get an AI response with citations.
 * POST /api/chat/enhanced
 */
export async function fetchChat(
  query: string,
  chatHistory: readonly ChatHistoryEntry[],
): Promise<ChatResponse> {
  try {
    const res = await fetch("/api/chat/enhanced", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        chat_history: chatHistory,
        include_references: true,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: mapHttpError(res.status) };
    }

    const json = await res.json();
    return {
      ok: true,
      data: {
        response: json.response,
        references: json.references ?? [],
        confidenceScore: json.confidence_score,
        modelUsed: json.model_used,
      },
    };
  } catch (err) {
    return { ok: false, error: networkError(err) };
  }
}

/**
 * Store a memory candidate in Pinecone.
 * POST /api/memories
 */
export async function storeMemory(
  content: string,
  sessionId: string,
  tags: readonly string[] = [],
): Promise<MemoryStoreResult> {
  try {
    const res = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        source: "chat",
        session_id: sessionId,
        tags: [...tags],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: mapHttpError(res.status) };
    }

    const json = await res.json();
    return {
      ok: true,
      data: {
        memoryId: json.memory_id,
        chunksStored: json.chunks_stored,
        status: json.status,
      },
    };
  } catch (err) {
    return { ok: false, error: networkError(err) };
  }
}

/**
 * Search memories semantically.
 * GET /api/search?q=...&top_k=N
 */
export async function searchMemories(
  query: string,
  topK: number = 5,
): Promise<SearchResult> {
  try {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    const res = await fetch(`/api/search?${params.toString()}`, {
      method: "GET",
    });

    if (!res.ok) {
      return { ok: false, error: mapHttpError(res.status) };
    }

    const json: readonly Record<string, unknown>[] = await res.json();
    const data: readonly SearchResultItem[] = json.map((item) => ({
      content: item.content as string,
      metadata: (item.metadata as Record<string, unknown>) ?? {},
      relevanceScore: item.relevance_score as number,
      documentId: item.document_id as string,
      references: (item.references as readonly DocumentReference[]) ?? [],
    }));

    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: networkError(err) };
  }
}
