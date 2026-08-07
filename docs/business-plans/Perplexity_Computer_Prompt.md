# Perplexity Computer Prompt — AI Memory Startup UI Competitive Scan

> **How to use:** Copy the prompt below into Perplexity Computer (requires Perplexity Max at $200/month). Computer will browse each website, take screenshots, analyze the UI patterns, and produce a competitive analysis report. Then it will build a differentiated prototype.

---

## THE PROMPT

```
I need you to do competitive UI/UX research on AI memory startups, then design a differentiated product prototype. This is a multi-step task.

## STEP 1: Visit and scan these websites

Browse each of these AI memory startup websites one by one. For each site, take screenshots of:
- The homepage / hero section
- Any product dashboard or app screenshots shown
- The pricing page
- Any demo or playground if available
- The documentation page design

Websites to scan:

1. https://mem0.ai — Mem0 (AI memory layer, $24M funded)
2. https://www.getzep.com — Zep (long-term memory with temporal knowledge graphs)
3. https://www.letta.com — Letta / MemGPT (stateful AI agents)
4. https://supermemory.ai — Supermemory (universal memory infrastructure)
5. https://www.langchain.com/langsmith — LangSmith (LLM observability / tracing)
6. https://www.pinecone.io — Pinecone (vector database console)
7. https://supabase.com — Supabase (reference for best-in-class dev tool UI)
8. https://vercel.com/dashboard — Vercel (reference for developer dashboard design)
9. https://linear.app — Linear (reference for keyboard-first UI design)
10. https://mykin.ai — Kin (personal AI with memory)

## STEP 2: Analyze each website's UI

For each website, document:

**Visual Design:**
- Color scheme (hex codes if possible)
- Dark mode vs light mode
- Typography choices
- Use of gradients, glassmorphism, or other 2025-2026 trends
- Overall aesthetic (minimal, dense, playful, corporate)

**Layout & Navigation:**
- Sidebar vs top nav vs hybrid
- Page structure and information hierarchy
- Card-based vs list-based vs table-based content
- Responsive patterns

**Key UI Components:**
- How they display data (tables, graphs, timelines, cards)
- Interactive elements (command palettes, search bars, filters)
- Code/API displays
- Status indicators and badges
- Empty states and onboarding flows

**Unique UI Innovations:**
- Anything that stands out as novel or exceptionally well-designed
- Features that no other competitor has
- Interaction patterns worth borrowing or improving on

**Weaknesses:**
- What feels clunky, confusing, or outdated
- Missing features visible in the UI
- Areas where the UX falls short

## STEP 3: Create a competitive UI comparison matrix

Create a detailed comparison table with all 10 products across these dimensions:
- Navigation pattern
- Color scheme
- Dark/light mode
- Graph visualization (yes/no, quality)
- Timeline view (yes/no)
- Memory explorer (yes/no)
- Developer playground (yes/no)
- Keyboard shortcuts / command palette
- Real-time updates
- Mobile responsiveness
- Onboarding quality
- Overall UI polish score (1-10)

## STEP 4: Identify the top 10 UI patterns to steal (ethically)

From everything you've scanned, identify the 10 best UI patterns across all products that we should incorporate into our design. For each pattern:
- Which product it came from
- Why it works
- How we can improve on it

## STEP 5: Design and build a prototype

Now, based on everything you've analyzed, build a fully functional HTML/CSS/JS prototype for a product called "Mnemonic" — a professional memory graph platform. The prototype must:

**Be visually differentiated from ALL scanned competitors by:**
- Using a unique color palette that none of them use (suggest one based on gaps in the market)
- Having a distinctive layout that feels fresh and modern
- Incorporating at least 3 UI innovations not seen in any competitor

**Include these pages (all functional with navigation):**

1. **Dashboard** — Stats cards, mini knowledge graph preview, activity feed, top connections
2. **Memory Graph** — Interactive node-link diagram showing people, companies, topics, decisions as connected nodes. Hover effects, filtering, legend.
3. **Timeline** — Vertical chronological feed of all interactions (meetings, emails, Slack, docs) with source icons, entity tags, and memory count per event.
4. **Memory Explorer** — Browse all memories with tier filters (Episodic / Semantic / Identity), search, and detail expansion.
5. **Relationships** — CRM-like contact cards showing interaction strength, last contact, key topics, sentiment.
6. **Integrations** — Grid of data sources (Gmail, Slack, Notion, Zoom) and AI tools (Claude MCP, ChatGPT MCP, Cursor MCP) with connect/disconnect states.
7. **Debugger** — Context window inspector showing which memories were selected for an AI query, token counts, relevance scores, tier breakdown.

**Technical requirements:**
- Single HTML file with embedded CSS and JS (no external dependencies except CDN links)
- Dark mode as default (following 2026 developer tool trends)
- Responsive design
- Smooth transitions and hover states
- Interactive graph using SVG or Canvas
- Working navigation between all pages
- Keyboard shortcut hint (Cmd+K) on search bar
- Use modern CSS (grid, flexbox, backdrop-filter for glassmorphism accents)

**Design direction:**
- Dark background (#0A0E17 range — deeper than GitHub's dark mode)
- Accent color: warm amber/gold (#F59E0B to #FBBF24 range) — NO startup uses warm gold as primary accent, they all use blue/purple
- Secondary accent: cool teal (#06B6D4)
- Glassmorphism panels with subtle backdrop-blur for cards
- Monospace font for data/metrics, sans-serif for navigation
- Graph nodes with glow effects on hover
- Subtle grid background pattern (like Linear's aesthetic)

Save the final HTML file as "mnemonic-prototype.html" and provide it as a downloadable file.

## STEP 6: Write a summary

End with a 500-word executive summary covering:
- What you found across all competitor UIs
- Where the market has design gaps
- How our prototype is differentiated
- What to build in the MVP vs what to save for later
```

---

## ALTERNATIVE: Shorter prompt if Computer has session limits

```
Visit these AI memory startup websites one by one, screenshot each homepage and any product UI shown, then analyze their design patterns:

1. mem0.ai
2. getzep.com
3. letta.com
4. supermemory.ai
5. pinecone.io
6. supabase.com

For each: document color scheme, navigation pattern, key UI components, and weaknesses.

Then build a single-file HTML prototype for "Mnemonic" — a professional memory graph platform with: dashboard, interactive knowledge graph, timeline, memory explorer, relationships view, integrations page, and debugger. Use dark mode with warm amber (#F59E0B) as the unique accent color instead of the blue/purple everyone else uses. Include glassmorphism panels, SVG graph with hover effects, and working page navigation.

Save as mnemonic-prototype.html.
```

---

## NOTES

- **Perplexity Computer** ($200/mo Max plan) can browse websites, take screenshots, analyze visual design, and generate code. It uses 19+ AI models and can create subagents for different parts of the task.
- The prompt is structured in sequential steps because Computer works best with clear, ordered instructions.
- If Computer hits context limits, break the task into two sessions: Steps 1-4 (research) in session 1, then paste the findings into session 2 with Step 5-6 (build).
- Computer can save files — the prototype will be downloadable as an HTML file.
