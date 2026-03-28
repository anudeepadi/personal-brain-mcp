const SESSION_KEY = "mnemonic_session_id";

/**
 * Returns existing session ID from localStorage, or creates a new one.
 * Uses crypto.randomUUID() for generation.
 */
export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, newId);
  return newId;
}
