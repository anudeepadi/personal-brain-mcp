"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, SkipForward, RotateCcw, Pause } from "lucide-react";
import {
  createDemoScenario,
  type DemoFact,
  type CompetitorResult,
} from "@/lib/demo-scenario";
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
    handleAdvance();
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalSteps = 5;
  const progressDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-3">
            // DEMO
          </p>
          <h1 className="text-3xl font-semibold text-text-primary mb-3">
            The Moving Problem
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Watch how different memory systems handle contradictory facts. Five
            facts, three competitors, one clear winner.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button
            onClick={handlePlay}
            disabled={complete && !autoPlaying}
            className="flex items-center gap-2 px-5 py-2 rounded-[var(--radius)] bg-accent text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
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
            className="flex items-center gap-2 px-5 py-2 rounded-[var(--radius)] border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent hover:text-accent transition-colors"
          >
            <SkipForward className="h-4 w-4" /> Step
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2 rounded-[var(--radius)] border border-border text-sm font-medium hover:border-danger hover:text-danger transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 ml-2">
            {progressDots.map((d) => (
              <div
                key={d}
                className={`w-2 h-2 rounded-full transition-colors ${
                  d <= step ? "bg-accent" : "bg-border-strong"
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
            className="text-center mb-8 p-4 rounded-[var(--radius)] border border-success/30 bg-success/5"
          >
            <p className="text-sm text-success font-medium">
              Demo complete! Mnemonic resolved all 3 contradictions with full
              temporal trail.
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
