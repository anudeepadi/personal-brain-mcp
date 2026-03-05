# Subconscious UI Design Document

**Date:** 2026-03-05
**Status:** Approved
**Audience:** End-user Personal Brain + Research Demo Showcase

---

## 1. Overview

Build a polished UI for **Subconscious (submem)** — an async dual-process AI memory engine. The UI serves dual purposes:

1. **End-user Personal Brain** — Users dump thoughts, chat with their knowledge, and see memories forming
2. **Research Demo Showcase** — Interactive demonstrations of the dual-process architecture for paper/arXiv submission

### Design Philosophy: Split Personality

The visual theme mirrors the architecture:
- **Light/Warm** = System 1 (Waking) — conscious interaction, brain dumps, chat
- **Dark/Futuristic** = System 2 (Sleep) — consolidation, temporal graphs, architecture

---

## 2. Tech Stack

Leveraging the existing `frontend-next/` setup:
- **Next.js 16** + **React 19**
- **Tailwind CSS 4** (dark/light theming via CSS custom properties)
- **Radix UI** (dialogs, dropdowns, tabs, selects)
- **Framer Motion** (page transitions, scroll animations, component animations)
- **Lucide React** (iconography)
- **D3.js / react-force-graph** (temporal graph visualization — new dependency)
- **Backend:** Existing FastAPI with Pinecone/LangChain

---

## 3. Information Architecture & Routing

```
/                    Landing (cinematic scroll)
                       Hero + Value Prop (light)
                       Architecture Diagram (light to dark transition)
                       Moving Problem Teaser (dark)
                       Comparison Table (dark)
                       CTA: "Try the Brain" / "Run the Demo"

/brain               Chat + Memory Dashboard (side-by-side split)
                       Left Panel (light): Brain dump input, chat, file upload
                       Right Panel (dark): Event stream, temporal graph, compiled memory

/demo                The Moving Problem (dark)
                       Guided Mode: pre-scripted scenario with Play/Step controls
                       Freestyle Mode: unlocked after guided completion
                       Scoreboard: Subconscious vs mem0 vs vector-only

/architecture        How It Works (dark to light gradient)
                       Animated System 1 to System 2 pipeline
                       Benchmark charts
                       Academic references + comparison table
```

**Navigation:** Minimal top bar. Logo left, page links center, theme indicator (sun/moon) right. On `/brain`, the nav bar itself splits: left half light, right half dark.

---

## 4. Page Designs

### 4.1 Landing Page (`/`)

The scroll is a story: "Your AI has amnesia. Here's the cure."

**Panel 1 — Hero (Light/Warm)**
- Headline: "Subconscious"
- Subtitle: "Memory that consolidates, not just accumulates"
- One-liner: "A dual-process memory engine for AI agents — fast append at runtime, intelligent consolidation offline"
- Two CTAs: "Try the Brain" and "Watch the Demo"
- Background: subtle animated particles (thoughts being captured)

**Panel 2 — The Problem (Light transitioning to dark)**
- Three failure cards:
  - "The Goldfish" — Vector DBs return stale facts (animated overlapping cards)
  - "The Bottleneck" — Graph extraction blocks critical path (loading spinner on chat bubble)
  - "The Forgetter" — Agents forget to manage memory (fading text)
- Background darkens as user scrolls

**Panel 3 — Architecture Diagram (Dark)**
- The dual-process diagram rendered as animated SVG
- Events flow in real-time: blips enter Event Stream, batch through Sleep Consolidator, emerge as graph nodes and compiled memory
- Interactive hover tooltips on each component

**Panel 4 — Comparison Table (Dark)**
- Subconscious vs mem0 vs SuperMemory vs Zep vs MemGPT
- Columns: Ingestion Latency, Contradiction Resolution, Async Consolidation, Local-First, Open Source
- Subconscious row highlighted

**Panel 5 — CTA (Dark to light fade)**
- "See it in action" links to `/demo`
- "Build your brain" links to `/brain`

### 4.2 Brain Dump + Memory Dashboard (`/brain`)

Side-by-side split screen. Left = conscious mind. Right = subconscious processing.

**Left Panel — "Waking" (Light/Warm)**
- Chat input at bottom: large text area, placeholder "Dump a thought, ask a question, or upload a file..."
- Message feed above: scrollable chat history (user messages right-aligned warm accent, AI responses left-aligned neutral)
- Quick actions bar: Upload File (PDF/image/audio), Import Chat (Claude/ChatGPT), voice input
- Tags/context bar at top: active tags, session label, editable title
- Aesthetic: cream/off-white, soft shadows, rounded cards, Inter font

**Right Panel — "Sleeping" (Dark)**

Three stacked sections:

*Top: Event Stream (~40% height)*
- Real-time scrolling log of appended events
- Each event: timestamp, type icon (chat/upload/thought), one-line preview
- Green pulse dot on new events, fading to dim
- Counter: "247 events today"

*Middle: Temporal Graph (~35% height)*
- Force-directed graph (D3 or react-force-graph)
- Nodes = entities, edges = relationships with temporal labels
- Consolidation: new nodes/edges animate in with glow
- Contradictions flash red, resolve with valid_until timestamps
- Click node to see history tooltip

*Bottom: Compiled Memory (~25% height)*
- Live preview of compiled_memory.md
- Monospace font, dark card, syntax highlighting
- Last consolidation timestamp + next scheduled run
- Badge: "3 contradictions resolved in last cycle"

**Divider**
- Draggable vertical divider between panels
- Gradient: warm on left edge, cool/dark on right
- Label: "conscious | subconscious"

**Interaction Flow:**
1. User types thought in left panel
2. Immediately appears in Event Stream on right (green pulse)
3. After accumulation (or "Consolidate Now" button), Sleep Consolidator runs
4. Graph animates new nodes/edges, compiled memory updates, contradiction badge updates
5. AI response in left panel cites from both event stream and compiled memory

### 4.3 The Moving Problem Demo (`/demo`)

Full dark theme. The research showcase.

**Layout:**
- Center stage: timeline visualization running left-to-right
- Below timeline: three competing memory states side by side

**Guided Mode (default):**

Pre-scripted scenario:
```
Fact 1 (t=0): "I live in Austin, Texas"
Fact 2 (t=1): "I work at Google as a software engineer"
Fact 3 (t=2): "I just moved to New York City"              (contradicts Fact 1)
Fact 4 (t=3): "I switched to Anthropic last month"          (contradicts Fact 2)
Fact 5 (t=4): "Actually still in Austin, move fell through" (reversal of Fact 3)
```

Controls: Play, Step, Reset, progress dots

On each step:
1. Fact card slides onto timeline
2. Event Stream appends instantly (<10ms counter)
3. Sleep Consolidator animates (spinning glow)
4. Three result panels update:
   - Left: Vector-Only (mem0-style) — returns ALL facts, red warnings
   - Center: Sync Graph (Zep-style) — correct but shows 800ms+ latency
   - Right: Subconscious — correct, <10ms ingestion, green checkmarks, valid_until edges

**Freestyle Mode (unlocks after guided completes):**
- Banner: "Now try your own contradictions"
- Text input + "Inject Fact" button
- Same three-panel comparison on custom input
- Difficulty selector: Simple / Medium / Hard

**Scoreboard (bottom):**
```
                    Ingestion Latency    Contradictions Resolved    Temporal Trail
Vector-Only         <10ms               0/3                        No
Sync Graph          800ms+              2/3                        Partial
Subconscious        <10ms               3/3                        Yes
```

### 4.4 Architecture / How It Works (`/architecture`)

Dark at top, gradient to light at bottom.

**Section A — Pipeline Animation (Dark, full-width)**
- Large interactive diagram animating full data flow:
  1. Chat bubble input at top
  2. System 1 arrow: event shoots to Event Stream (<10ms badge, no LLM call)
  3. Events accumulate in stream
  4. System 2 awakens: consolidator glows, LLM call badge (Claude Sonnet)
  5. Extraction: lines pull entities/edges into Temporal Graph
  6. Contradiction detection: red flash, valid_until resolution animation
  7. Compilation: graph compresses into compiled_memory.md, streams to system prompt
  8. Loop complete: arrow back to top with updated ground truth
- Scrubbable timeline or auto-play

**Section B — Benchmarks (Dark)**
Three chart cards:
- Latency Distribution: Subconscious (~5ms) vs Zep (~800ms) vs Cognee (~1200ms)
- Contradiction Resolution Accuracy: 0/3, 2/3, 3/3 grouped bar chart
- Retrieval Precision over Sessions: line chart, 50+ sessions
- Label: "Simulated benchmark -- real evaluation in progress"

**Section C — Academic Context (Dark to light gradient)**
- Literature cards: six papers from lit review as clickable cards (title, authors, one-line, arXiv link)
- Positioning diagram: X = latency, Y = memory fidelity. Existing systems plotted, Subconscious in top-left
- Expanded comparison table with additional columns

**Section D — Get Involved (Light)**
- GitHub link, paper preprint placeholder, "Star on GitHub" button
- "Built as part of the Personal Brain MCP project"
- Contact / citation info

---

## 5. Design Tokens

### Light Theme (System 1 / Waking)
- Background: #FEFCF8 (warm off-white)
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B6B6B
- Accent: #E8A04C (warm amber)
- Accent Secondary: #4A90D9 (calm blue)
- Border: #E8E4DE

### Dark Theme (System 2 / Sleep)
- Background: #0A0E1A (deep navy)
- Surface: #111827
- Text Primary: #E5E7EB
- Text Secondary: #9CA3AF
- Accent: #818CF8 (indigo glow)
- Accent Secondary: #34D399 (emerald for success)
- Danger: #F87171 (for contradictions)
- Border: #1F2937

### Shared
- Font Family: Inter (body), Fragment Mono (code/compiled memory)
- Border Radius: 12px (cards), 8px (buttons), 6px (inputs)
- Transition Duration: 300ms default, 600ms for theme shifts

---

## 6. Competitive Differentiation

| Product | Category | Same as Subconscious? |
|---|---|---|
| Mem.ai | Personal note-taking for humans | No. Consumer productivity, no agent memory |
| MemSync.ai | Cross-app personal data sync | No. Personalization passport, no consolidation |
| mem0.ai | Vector DB wrapper for agent memory | Closest competitor. Lacks temporal contradiction resolution |
| SuperMemory | Hybrid Memory+RAG infrastructure | Close in scope. Closed-source, synchronous extraction |

Subconscious differentiator: Async dual-process architecture (System 1 fast append + System 2 offline consolidation) with temporal contradiction resolution.

---

## 7. Key New Dependencies

- `d3` or `@react-force-graph/2d` — temporal graph visualization
- `recharts` — benchmark charts
- No other new dependencies needed; existing stack covers everything else
