// ── Session stats tracker ───────────────────────────────────────────
// Pure data object (no React hooks) for tracking memory count,
// search count, and session duration.

export interface SessionStatsSnapshot {
  readonly memoryCount: number;
  readonly searchCount: number;
}

export interface SessionStats {
  getSnapshot(): SessionStatsSnapshot;
  incrementMemories(): SessionStatsSnapshot;
  incrementSearches(): SessionStatsSnapshot;
  getSessionMinutes(): number;
  getFormattedDuration(): string;
}

export function createSessionStats(): SessionStats {
  let memoryCount = 0;
  let searchCount = 0;
  const startTime = Date.now();

  function getSnapshot(): SessionStatsSnapshot {
    return { memoryCount, searchCount };
  }

  function incrementMemories(): SessionStatsSnapshot {
    memoryCount += 1;
    return { memoryCount, searchCount };
  }

  function incrementSearches(): SessionStatsSnapshot {
    searchCount += 1;
    return { memoryCount, searchCount };
  }

  function getSessionMinutes(): number {
    return Math.floor((Date.now() - startTime) / 60_000);
  }

  function getFormattedDuration(): string {
    return `${getSessionMinutes()}m`;
  }

  return {
    getSnapshot,
    incrementMemories,
    incrementSearches,
    getSessionMinutes,
    getFormattedDuration,
  };
}
