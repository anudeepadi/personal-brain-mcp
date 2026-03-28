// ── Fallback simulation (used when backend is unreachable) ───────────
// Provides canned responses so the UI still feels responsive
// when the real backend cannot be reached.

export function simulateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (
    lower.includes("live") ||
    lower.includes("moved") ||
    lower.includes("city")
  ) {
    return "Location captured in your event stream. Hit 'Consolidate Now' in the Dashboard tab to promote this to your temporal graph.";
  }

  if (
    lower.includes("work") ||
    lower.includes("job") ||
    lower.includes("company")
  ) {
    return "Work info recorded. After consolidation, you'll see this as an employment edge in your knowledge graph with a valid_from timestamp.";
  }

  if (
    lower.includes("prefer") ||
    lower.includes("like") ||
    lower.includes("love")
  ) {
    return "Preference noted. Stored as a preference edge — if you change your mind later, consolidation will resolve the contradiction and mark the old edge valid_until.";
  }

  if (
    lower.includes("remember") ||
    lower.includes("what") ||
    lower.includes("recall")
  ) {
    return "Searching your memory graph... (In the live version, this queries your Pinecone index and returns semantically relevant facts with timestamps.)";
  }

  return "Thought captured in the event stream. Keep dumping — when ready, hit Consolidate to build your knowledge graph.";
}
