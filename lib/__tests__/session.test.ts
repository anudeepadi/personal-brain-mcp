import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSessionId } from "../session";

// ── Mock localStorage ────────────────────────────────────────────────

function createMockLocalStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe("getSessionId", () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "test-uuid-1234-5678-abcd"),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a new session ID when none exists", () => {
    const id = getSessionId();

    expect(id).toBe("test-uuid-1234-5678-abcd");
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "mnemonic_session_id",
      "test-uuid-1234-5678-abcd",
    );
  });

  it("returns existing session ID from localStorage", () => {
    (mockStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      "existing-session-id",
    );

    const id = getSessionId();

    expect(id).toBe("existing-session-id");
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it("returns the same ID on repeated calls", () => {
    const id1 = getSessionId();
    // After first call, localStorage has the value
    (mockStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(id1);
    const id2 = getSessionId();

    expect(id1).toBe(id2);
  });

  it("uses crypto.randomUUID() for ID generation", () => {
    getSessionId();

    expect(crypto.randomUUID).toHaveBeenCalledOnce();
  });
});
