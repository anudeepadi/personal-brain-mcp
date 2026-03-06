"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, SkipForward, RotateCcw, Pause } from "lucide-react";
import { createDemoScenario, type DemoFact, type CompetitorResult } from "@/lib/demo-scenario";
import { Timeline } from "@/components/demo/timeline";
import { CompetitorPanel } from "@/components/demo/competitor-panel";
import { Scoreboard } from "@/components/demo/scoreboard";
import { FreestyleInput } from "@/components/demo/freestyle-input";

export default function DemoPage() {
  const scenarioRef = useRef(createDemoScenario());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [facts, setFacts] = useState<readonly DemoFact[]>([]);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [results, setResults] = useState<readonly CompetitorResult[]>([]);

  const syncState = useCallback(() => {
    const s = scenarioRef.current;
    setFacts(s.getInjectedFacts());
    setStep(s.getStep());
    setComplete(s.isComplete());
    setResults(s.getCompetitorResults());
  }, []);

  const handleAdvance = useCallback(() => {
    const s = scenarioRef.current;
    if (s.isComplete()) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setAutoPlaying(false);
      }
      return;
    }
    s.advance();
    syncState();
  }, [syncState]);

  const handlePlay = useCallback(() => {
    if (autoPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAutoPlaying(false);
      return;
    }

    setAutoPlaying(true);
    handleAdvance(); // immediate first step
    intervalRef.current = setInterval(() => {
      const s = scenarioRef.current;
      if (s.isComplete()) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setAutoPlaying(false);
        return;
      }
      s.advance();
      syncState();
    }, 2000);
  }, [autoPlaying, handleAdvance, syncState]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAutoPlaying(false);
    scenarioRef.current.reset();
    syncState();
  }, [syncState]);

  const handleInjectFact = useCallback(
    (content: string) => {
      scenarioRef.current.injectCustomFact(content);
      syncState();
    },
    [syncState],
  );

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalSteps = 5;
  const progressDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Moving Problem</h1>
          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
            Watch how different memory systems handle contradictory facts.
            Five facts, three competitors, one clear winner.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePlay}
            disabled={complete && !autoPlaying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#818CF8] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#6366F1] transition-colors"
          >
            {autoPlaying ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Play
              </>
            )}
          </button>

          <button
            onClick={handleAdvance}
            disabled={complete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1F2937] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#818CF8] hover:text-[#818CF8] transition-colors"
          >
            <SkipForward className="h-4 w-4" /> Step
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1F2937] text-sm font-semibold hover:border-[#F87171] hover:text-[#F87171] transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 ml-4">
            {progressDots.map((d) => (
              <div
                key={d}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  d <= step ? "bg-[#818CF8]" : "bg-[#1F2937]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <Timeline facts={facts} currentStep={step} />
        </div>

        {/* Competitor Panels */}
        <div className="mb-8">
          <CompetitorPanel results={results} />
        </div>

        {/* Completion banner */}
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 p-4 rounded-xl border border-[#34D399]/30 bg-[#34D399]/5"
          >
            <p className="text-sm text-[#34D399] font-semibold">
              Demo complete! Subconscious resolved all 3 contradictions with full temporal trail.
            </p>
          </motion.div>
        )}

        {/* Scoreboard */}
        <div className="mb-8">
          <Scoreboard results={results} visible={complete} />
        </div>

        {/* Freestyle */}
        <FreestyleInput unlocked={complete} onInjectFact={handleInjectFact} />
      </div>
    </div>
  );
}
