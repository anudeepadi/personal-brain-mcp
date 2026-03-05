# Subconscious UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished 4-page UI for the Subconscious dual-process memory engine, serving as both an end-user Personal Brain and a research demo showcase.

**Architecture:** Next.js 16 App Router with 4 routes (/, /brain, /demo, /architecture). Dual-theme system: light/warm for System 1 (waking/chat), dark/futuristic for System 2 (sleep/consolidation). Split-screen layout on /brain with draggable divider. Simulated memory engine for demo purposes (no real backend integration in Phase 1).

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Radix UI, Framer Motion, Lucide React, D3.js (graph viz), Recharts (benchmarks)

**Design Doc:** `docs/plans/2026-03-05-subconscious-ui-design.md`

---

## Phase 0: Foundation (Theme, Layout, Dependencies)

### Task 1: Install New Dependencies

**Files:**
- Modify: `frontend-next/package.json`

**Step 1: Install graph visualization and chart dependencies**

Run: `cd frontend-next && npm install d3 @types/d3 recharts react-resizable-panels`

Note: `react-resizable-panels` provides an accessible, performant split-panel layout for the /brain page.

**Step 2: Verify installation**

Run: `cd frontend-next && npm ls d3 recharts react-resizable-panels`
Expected: All three packages listed

**Step 3: Commit**

```bash
git add frontend-next/package.json frontend-next/package-lock.json
git commit -m "chore: add d3, recharts, react-resizable-panels dependencies"
```

---

### Task 2: Dual-Theme CSS System

**Files:**
- Modify: `frontend-next/app/globals.css`
- Modify: `frontend-next/tailwind.config.ts`

**Step 1: Replace globals.css with dual-theme CSS variables**

Replace the existing content of `frontend-next/app/globals.css`. The new file defines:
- `:root` variables for System 1 (Waking/Light): warm off-white (#FEFCF8), amber accents
- `.dark` variables for System 2 (Sleep/Dark): deep navy (#0A0E1A), indigo/emerald accents
- Utility classes: `gradient-text`, `glass`, `glow-indigo`, `glow-green`, `glow-red`, `pulse-dot`
- Custom scrollbar styling for both themes
- Float and pulse-green keyframe animations

Design tokens from design doc section 5.

**Step 2: Commit**

```bash
git add frontend-next/app/globals.css frontend-next/tailwind.config.ts
git commit -m "feat: implement dual-theme CSS system (waking/sleep)"
```

---

### Task 3: Shared Navigation Component

**Files:**
- Create: `frontend-next/components/navigation.tsx`

**Step 1: Create the split-theme navigation bar**

A fixed top nav that adapts its theme based on current route:
- `/` and `/brain` use light theme (warm amber accents, dark text)
- `/demo` and `/architecture` use dark theme (indigo accents, light text)
- On `/brain`, the nav visually splits at the center
- Logo: Brain icon + "Subconscious" text
- Desktop: centered page links (Home, Brain, Demo, How It Works) + theme indicator (Sun/Moon with "Waking"/"Sleep" label)
- Mobile: hamburger menu with animated dropdown
- Uses `usePathname()` for route detection, Framer Motion for mobile menu animation

**Step 2: Commit**

```bash
git add frontend-next/components/navigation.tsx
git commit -m "feat: add split-theme navigation component"
```

---

### Task 4: Update Root Layout

**Files:**
- Modify: `frontend-next/app/layout.tsx`

**Step 1: Update layout to include Navigation and configure fonts**

- Import Inter (body) and JetBrains Mono (code) from next/font/google
- Set CSS variables `--font-inter` and `--font-mono`
- Update metadata: title="Subconscious - Dual-Process Memory for AI Agents"
- Include `<Navigation />` above `{children}`
- Add `pt-16` to main for nav offset

**Step 2: Commit**

```bash
git add frontend-next/app/layout.tsx
git commit -m "feat: update root layout with navigation and fonts"
```

---

## Phase 1: Landing Page (/)

### Task 5: Landing Page - Hero Section

**Files:**
- Create: `frontend-next/components/landing/hero-section.tsx`

**Step 1: Create the hero section component**

Light/warm background. Contains:
- 20 animated particle dots (Framer Motion, random positions, floating upward)
- Brain icon centered
- "Subconscious" headline (text-6xl to text-8xl)
- Subtitle: "Memory that consolidates, not just accumulates."
- One-liner paragraph about dual-process
- Two CTA buttons: "Try the Brain" (link to /brain, amber bg) and "Watch the Demo" (link to /demo, outline)
- Staggered entrance animations (opacity + y translate)

**Step 2: Commit**

```bash
git add frontend-next/components/landing/hero-section.tsx
git commit -m "feat: add landing hero section component"
```

---

### Task 6: Landing Page - Problem Cards Section

**Files:**
- Create: `frontend-next/components/landing/problem-section.tsx`

**Step 1: Create the three problem cards with scroll-driven background transition**

Uses `useScroll` + `useTransform` from Framer Motion to interpolate background color from light (#FEFCF8) through transition to dark (#0A0E1A) as user scrolls.

Three cards in a 3-column grid:
1. "The Goldfish" (Fish icon, amber) - Vector staleness problem
2. "The Bottleneck" (Hourglass icon, blue) - Sync graph latency
3. "The Forgetter" (BrainCog icon, indigo) - Active management fallacy

Cards appear with staggered `whileInView` animations. Glass/blur background effect on cards.

**Step 2: Commit**

```bash
git add frontend-next/components/landing/problem-section.tsx
git commit -m "feat: add problem cards section with scroll-driven theme transition"
```

---

### Task 7: Landing Page - Architecture Diagram Section

**Files:**
- Create: `frontend-next/components/landing/architecture-section.tsx`

**Step 1: Create the animated architecture diagram**

Dark background section. Four stages displayed in alternating left/right layout with a vertical connecting gradient line:
1. Event Stream (Zap icon, green) - "<10ms, Append-Only"
2. Sleep Consolidator (Moon icon, indigo) - "Background, Async"
3. Temporal Graph (Network icon, indigo) - "Bitemporal, Episodic"
4. Compiled Memory (FileText icon, green) - "System Prompt, Always Current"

Each stage has: icon with animated glow box-shadow, label, sublabel (mono font), description.
Connecting line animates scaleY from 0 to 1. Stages animate in with x-offset (alternating sides).
All triggered by `useInView`.

**Step 2: Commit**

```bash
git add frontend-next/components/landing/architecture-section.tsx
git commit -m "feat: add animated architecture diagram section"
```

---

### Task 8: Landing Page - Comparison Table Section

**Files:**
- Create: `frontend-next/components/landing/comparison-section.tsx`

**Step 1: Create the comparison table**

Dark background. Table with 5 rows (Subconscious, mem0, SuperMemory, Zep/Graphiti, MemGPT/Letta) and 5 columns (Ingestion Latency, Contradiction Resolution, Async Consolidation, Local-First, Open Source).

- Subconscious row highlighted with left border accent and "ours" badge
- CellIcon component renders Check (green), X (red), or Minus (gray) based on value
- Latency column shows monospace text
- Animated entrance with `whileInView`
- Rounded container with subtle border

**Step 2: Commit**

```bash
git add frontend-next/components/landing/comparison-section.tsx
git commit -m "feat: add competitive comparison table section"
```

---

### Task 9: Landing Page - CTA Section + Assemble Page

**Files:**
- Create: `frontend-next/components/landing/cta-section.tsx`
- Modify: `frontend-next/app/page.tsx` (full rewrite)

**Step 1: Create CTA section**

Dark gradient background. "See it in action." headline. Two buttons: "Run the Demo" (indigo) and "Build Your Brain" (outline). Animated entrance.

**Step 2: Rewrite app/page.tsx to assemble all landing sections**

Server component (no "use client"). Imports and renders in order:
1. HeroSection
2. ProblemSection
3. ArchitectureSection
4. ComparisonSection
5. CTASection

**Step 3: Commit**

```bash
git add frontend-next/components/landing/cta-section.tsx frontend-next/app/page.tsx
git commit -m "feat: assemble landing page with all sections"
```

---

## Phase 2: Brain Page (/brain)

### Task 10: Memory Engine Core Logic

**Files:**
- Create: `frontend-next/lib/use-memory-engine.ts`
- Create: `frontend-next/lib/__tests__/use-memory-engine.test.ts`
- Create: `frontend-next/vitest.config.ts`

**Step 1: Install test dependencies**

Run: `cd frontend-next && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`

**Step 2: Create vitest.config.ts**

Configure with jsdom environment, react plugin, and `@` path alias.

**Step 3: Write failing tests**

Tests for `createMemoryEngine()`:
- Appends events to stream
- Detects contradictions during consolidation
- Resolves contradictions with valid_until
- Generates compiled memory markdown
- Builds graph nodes from events

**Step 4: Run tests - should FAIL**

Run: `cd frontend-next && npx vitest run lib/__tests__/use-memory-engine.test.ts`

**Step 5: Implement createMemoryEngine()**

Pure function (no React) that returns an engine object with:
- `appendEvent(content, type)` - appends to event array, returns event
- `consolidate()` - runs regex-based fact extraction over unconsolidated events, detects contradictions by matching existing active edges, invalidates old nodes/edges with valid_until, returns ConsolidationResult
- `getEvents()` - returns readonly event array
- `getGraph()` - returns {nodes, edges}
- `getCompiledMemory()` - returns markdown string
- `reset()` - clears all state

Fact patterns: location (live in/moved to), employer (work at/switched to), role, preference.
Contradiction resolution: when a new fact matches same field as existing active edge, set valid_until on old node+edge.
Compiled memory: lists active facts by field, then superseded facts with timestamps.

All data structures are immutable (create new arrays, never mutate).

**Step 6: Run tests - should PASS**

Run: `cd frontend-next && npx vitest run lib/__tests__/use-memory-engine.test.ts`

**Step 7: Commit**

```bash
git add frontend-next/lib/use-memory-engine.ts frontend-next/lib/__tests__/use-memory-engine.test.ts frontend-next/vitest.config.ts frontend-next/package.json frontend-next/package-lock.json
git commit -m "feat: implement memory engine with contradiction resolution and tests"
```

---

### Task 11: React Hook Wrapper for Memory Engine

**Files:**
- Create: `frontend-next/lib/use-memory-store.ts`

**Step 1: Create useMemoryStore hook**

Wraps `createMemoryEngine` in a React hook with `useState` + `useRef`:
- `engineRef` holds the engine instance
- State tracks: events, nodes, edges, compiledMemory, lastConsolidation, isConsolidating, eventCount
- `appendEvent` updates engine and syncs state
- `consolidate` sets isConsolidating=true, waits 1.5s (visual delay), runs engine.consolidate(), syncs all state
- `reset` clears engine and state
- All callbacks wrapped in `useCallback`

**Step 2: Commit**

```bash
git add frontend-next/lib/use-memory-store.ts
git commit -m "feat: add React hook wrapper for memory engine state"
```

---

### Task 12: Brain Page - Chat Panel (Left/Light)

**Files:**
- Create: `frontend-next/components/brain/chat-panel.tsx`

**Step 1: Create the light-themed chat panel**

Props: `onSendMessage(content)`, `messages[]`
- Header: MessageSquare icon + "Brain Dump" title + description
- Message feed: scrollable, auto-scrolls to bottom. User messages right-aligned (amber bg, white text, rounded-br-md). Assistant messages left-aligned (white bg, border, rounded-bl-md). AnimatePresence for entrance animations.
- Empty state: centered icon + hint text
- Input area: Upload button (outline icon), Textarea (Enter to send, Shift+Enter for newline), Send button (amber, disabled when empty)
- All colors use light theme tokens

**Step 2: Commit**

```bash
git add frontend-next/components/brain/chat-panel.tsx
git commit -m "feat: add light-themed chat panel for brain page"
```

---

### Task 13: Brain Page - Memory Dashboard (Right/Dark)

**Files:**
- Create: `frontend-next/components/brain/event-stream.tsx`
- Create: `frontend-next/components/brain/temporal-graph.tsx`
- Create: `frontend-next/components/brain/compiled-memory.tsx`
- Create: `frontend-next/components/brain/memory-dashboard.tsx`

**Step 1: Create EventStream component**

Dark themed. Shows last 20 events as small cards with:
- Type icon (MessageSquare/Upload/Lightbulb), green pulse dot that fades
- Content preview (truncated), timestamp + "<10ms" label
- Counter badge at top: "X events"
- AnimatePresence for new event entrance (slide from right)

**Step 2: Create TemporalGraph component**

Canvas-based graph visualization:
- "You" node centered (indigo circle)
- Entity nodes positioned in a circle around center
- Active nodes: green, with label below
- Superseded nodes: red/faded, with "[superseded]" label
- Edges: active = indigo solid line, superseded = red dashed line
- Edge labels (relation type) at midpoint
- "consolidating..." indicator with glow animation when isConsolidating=true
- Redraws on nodes/edges change via useEffect

**Step 3: Create CompiledMemory component**

Dark themed code preview:
- Header: FileText icon + "compiled_memory.md" + resolved count badge + "Consolidate Now" button
- Body: `<pre>` with monospace font showing the markdown content
- Consolidate button: RefreshCw icon, spins when consolidating, disabled during consolidation
- Empty state placeholder

**Step 4: Create MemoryDashboard component**

Combines all three in a vertical stack:
- EventStream: 40% height, border-b
- TemporalGraph: 35% height, border-b
- CompiledMemory: 25% height
- All on dark background

**Step 5: Commit**

```bash
git add frontend-next/components/brain/
git commit -m "feat: add memory dashboard components (event stream, graph, compiled memory)"
```

---

### Task 14: Brain Page - Assemble Split Layout

**Files:**
- Create: `frontend-next/app/brain/page.tsx`

**Step 1: Create the brain page with resizable split panels**

Uses `react-resizable-panels` (PanelGroup, Panel, PanelResizeHandle):
- Direction: horizontal
- Left panel (50% default, 30% min): ChatPanel (light)
- Resize handle: 2px wide, gradient from warm to dark, wider on hover
- Right panel (50% default, 30% min): MemoryDashboard (dark)

Page state:
- `useMemoryStore()` for memory engine
- `messages` state for chat display
- `handleSendMessage`: adds user message, calls `memory.appendEvent`, generates simulated assistant response after 500ms
- `handleConsolidate`: calls `memory.consolidate()`

Full height: `h-[calc(100vh-4rem)]` to account for nav.

**Step 2: Commit**

```bash
git add frontend-next/app/brain/page.tsx
git commit -m "feat: assemble brain page with split-panel layout"
```

---

## Phase 3: Demo Page (/demo)

### Task 15: Moving Problem Demo - State Machine

**Files:**
- Create: `frontend-next/lib/demo-scenario.ts`
- Create: `frontend-next/lib/__tests__/demo-scenario.test.ts`

**Step 1: Write failing tests**

Tests for `createDemoScenario()`:
- Starts at step 0, not complete
- Advances through all 5 guided facts
- Vector-only returns all facts without resolution
- Subconscious resolves contradictions correctly
- Resets cleanly

**Step 2: Run tests - should FAIL**

**Step 3: Implement createDemoScenario()**

5 guided facts (Austin, Google, NYC contradicts Austin, Anthropic contradicts Google, Austin reversal).

Three competitor simulations:
- **Vector-only**: stores all facts, resolves nothing, <10ms latency
- **Sync Graph**: resolves simple contradictions but misses reversals, 800ms+ latency, partial temporal trail
- **Subconscious**: resolves all with full temporal trail (valid_until timestamps), <10ms latency

Functions: advance(), injectCustomFact(content), getCompetitorResults(), getStep(), isComplete(), getInjectedFacts(), reset()

**Step 4: Run tests - should PASS**

**Step 5: Commit**

```bash
git add frontend-next/lib/demo-scenario.ts frontend-next/lib/__tests__/demo-scenario.test.ts
git commit -m "feat: implement Moving Problem demo state machine with tests"
```

---

### Task 16: Demo Page - UI Components

**Files:**
- Create: `frontend-next/components/demo/timeline.tsx`
- Create: `frontend-next/components/demo/competitor-panel.tsx`
- Create: `frontend-next/components/demo/scoreboard.tsx`
- Create: `frontend-next/components/demo/freestyle-input.tsx`

**Step 1: Create Timeline component**

Horizontal timeline showing injected facts as cards. Each card shows: step number, fact text, contradiction badge (if applicable). Active step highlighted. Cards animate in from right.

**Step 2: Create CompetitorPanel component**

Three side-by-side panels showing memory state for each competitor:
- Vector-Only (left): red header, lists all facts, no resolution indicator
- Sync Graph (center): yellow header, shows current facts + latency counter
- Subconscious (right): green header, shows current facts + temporal trail with valid_until

**Step 3: Create Scoreboard component**

Summary table with three rows (Vector-Only, Sync Graph, Subconscious) and three columns (Ingestion Latency, Contradictions Resolved, Temporal Trail Intact). Uses Check/X/Minus icons.

**Step 4: Create FreestyleInput component**

Text input + "Inject Fact" button. Difficulty selector (Simple/Medium/Hard). Locked state with "Complete the guided demo to unlock" message.

**Step 5: Commit**

```bash
git add frontend-next/components/demo/
git commit -m "feat: add demo page UI components (timeline, competitors, scoreboard, freestyle)"
```

---

### Task 17: Demo Page - Assemble

**Files:**
- Create: `frontend-next/app/demo/page.tsx`

**Step 1: Create the demo page**

Full dark theme wrapper. State: mode ("guided"|"freestyle"), scenario (createDemoScenario), autoPlaying flag.

Layout:
1. Header: "The Moving Problem" title + description
2. Controls bar: Play (auto-advances with 2s intervals), Step (single advance), Reset. Progress dots.
3. Timeline component
4. Competitor panels (3-column grid)
5. Scoreboard (appears after completion)
6. Freestyle input (unlocks after guided completion with banner animation)

Play button starts interval that calls advance() every 2s, stops when complete.
On completion: banner slides in, freestyle unlocks, scoreboard fades in.

**Step 2: Commit**

```bash
git add frontend-next/app/demo/page.tsx
git commit -m "feat: assemble Moving Problem demo page with guided + freestyle modes"
```

---

## Phase 4: Architecture Page (/architecture)

### Task 18: Architecture Page - Pipeline Animation

**Files:**
- Create: `frontend-next/components/architecture/pipeline-animation.tsx`

**Step 1: Create the animated pipeline walkthrough**

Full-width dark section. 8-step animation matching the design doc:
1. Chat bubble input
2. System 1 arrow with <10ms badge
3. Events accumulate in stream
4. System 2 awakens with glow
5. Entity/edge extraction lines
6. Contradiction detection flash
7. Compilation to compiled_memory.md
8. Loop back to agent

Each step triggered by scroll position using Framer Motion's `useScroll` + `useTransform`. Visual: large centered diagram with animated SVG paths, glowing nodes, flowing particles.

**Step 2: Commit**

```bash
git add frontend-next/components/architecture/pipeline-animation.tsx
git commit -m "feat: add animated pipeline walkthrough component"
```

---

### Task 19: Architecture Page - Benchmark Charts

**Files:**
- Create: `frontend-next/components/architecture/benchmark-charts.tsx`

**Step 1: Create three benchmark chart cards using Recharts**

Three cards in a row:
1. **Latency Distribution** (BarChart): Subconscious ~5ms, Zep ~800ms, Cognee ~1200ms
2. **Contradiction Resolution** (BarChart grouped): Vector-Only 0/3, Sync Graph 2/3, Subconscious 3/3
3. **Retrieval Precision** (LineChart): X=sessions (0-50), Y=precision. Subconscious flat ~0.92, others degrade

All with dark theme styling (dark bg, light text, colored bars/lines matching brand).
Disclaimer label: "Simulated benchmark - real evaluation in progress"

**Step 2: Commit**

```bash
git add frontend-next/components/architecture/benchmark-charts.tsx
git commit -m "feat: add benchmark chart cards with simulated data"
```

---

### Task 20: Architecture Page - Academic Context + Assemble

**Files:**
- Create: `frontend-next/components/architecture/academic-section.tsx`
- Create: `frontend-next/app/architecture/page.tsx`

**Step 1: Create academic context section**

Two sub-sections:
1. **Literature Cards**: 3x2 grid of paper cards. Each: title, authors, year, one-line contribution, arXiv link. Papers: Generative Agents, MemGPT, CoALA, HippoRAG, Graph RAG, A-Mem/SCM.
2. **Get Involved**: Light section at bottom. GitHub link, paper preprint placeholder, "Star on GitHub" button.

**Step 2: Create architecture page assembling all sections**

Wraps content in dark theme. Renders:
1. PipelineAnimation
2. BenchmarkCharts
3. AcademicSection (includes Get Involved)

**Step 3: Commit**

```bash
git add frontend-next/components/architecture/ frontend-next/app/architecture/page.tsx
git commit -m "feat: assemble architecture page with pipeline, benchmarks, and academic context"
```

---

## Phase 5: Polish and Integration

### Task 21: Verify Full Build

**Step 1: Install all dependencies and build**

Run: `cd frontend-next && npm install && npm run build`
Expected: Build succeeds with no errors.

**Step 2: Run all tests**

Run: `cd frontend-next && npx vitest run`
Expected: All tests pass.

**Step 3: Manual smoke test**

Start the dev server in tmux: `tmux new-session -d -s dev "cd frontend-next && npx next dev"`

Visit each page: /, /brain, /demo, /architecture. Verify:
- Landing scroll transitions from light to dark
- Brain page split-panel works, events appear, consolidation runs
- Demo guided mode plays through all 5 facts
- Architecture page animations trigger on scroll

**Step 4: Commit any fixes, then final commit**

```bash
git add -A && git commit -m "chore: polish and verify full Subconscious UI build"
```

---

## Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|-----------------|
| 0: Foundation | 1-4 | Theme system, navigation, layout |
| 1: Landing | 5-9 | Cinematic scroll with 5 sections |
| 2: Brain | 10-14 | Split-screen chat + memory dashboard |
| 3: Demo | 15-17 | Moving Problem interactive demo |
| 4: Architecture | 18-20 | Pipeline animation + benchmarks |
| 5: Polish | 21 | Build verification + smoke test |

**Total: 21 tasks across 5 phases.**
