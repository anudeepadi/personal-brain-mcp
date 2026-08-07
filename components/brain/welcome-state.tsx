"use client";

const SUGGESTED_PROMPTS = [
  "I live in San Francisco",
  "I'm working on a React project",
  "I prefer dark mode for coding",
] as const;

interface WelcomeStateProps {
  readonly onSendPrompt: (content: string) => void;
}

/**
 * Guided first-use onboarding state.
 * Shown when chat has zero messages; disappears after first send.
 */
export function WelcomeState({ onSendPrompt }: WelcomeStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6 px-6">
      <div>
        <h2 className="font-display italic text-2xl text-text-primary mb-2 text-balance leading-tight">
          Tell me something about yourself.
        </h2>
        <p className="text-sm text-text-secondary">
          I'll remember it.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendPrompt(prompt)}
            className="font-mono text-[11px] px-4 py-2 rounded-full bg-surface-raised border border-border text-text-secondary hover:border-accent/30 hover:bg-accent-muted transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
