import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSessionStats, type SessionStats } from "@/lib/use-session-stats";

describe("createSessionStats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with zero counts", () => {
    const stats = createSessionStats();
    expect(stats.getSnapshot().memoryCount).toBe(0);
    expect(stats.getSnapshot().searchCount).toBe(0);
  });

  it("increments memory count", () => {
    const stats = createSessionStats();
    const updated = stats.incrementMemories();
    expect(updated.memoryCount).toBe(1);

    const updated2 = stats.incrementMemories();
    expect(updated2.memoryCount).toBe(2);
  });

  it("increments search count", () => {
    const stats = createSessionStats();
    const updated = stats.incrementSearches();
    expect(updated.searchCount).toBe(1);
  });

  it("calculates session duration in minutes", () => {
    const stats = createSessionStats();

    // Advance 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(stats.getSessionMinutes()).toBe(5);

    // Advance 10 more minutes
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(stats.getSessionMinutes()).toBe(15);
  });

  it("formats duration correctly", () => {
    const stats = createSessionStats();

    vi.advanceTimersByTime(3 * 60 * 1000);
    expect(stats.getFormattedDuration()).toBe("3m");

    vi.advanceTimersByTime(27 * 60 * 1000);
    expect(stats.getFormattedDuration()).toBe("30m");
  });

  it("returns zero minutes at start", () => {
    const stats = createSessionStats();
    expect(stats.getSessionMinutes()).toBe(0);
    expect(stats.getFormattedDuration()).toBe("0m");
  });

  it("returns immutable snapshot", () => {
    const stats = createSessionStats();
    const snap1 = stats.getSnapshot();
    stats.incrementMemories();
    const snap2 = stats.getSnapshot();

    // Original snapshot should not be mutated
    expect(snap1.memoryCount).toBe(0);
    expect(snap2.memoryCount).toBe(1);
  });

  it("tracks both counts independently", () => {
    const stats = createSessionStats();
    stats.incrementMemories();
    stats.incrementMemories();
    stats.incrementSearches();

    const snap = stats.getSnapshot();
    expect(snap.memoryCount).toBe(2);
    expect(snap.searchCount).toBe(1);
  });
});
