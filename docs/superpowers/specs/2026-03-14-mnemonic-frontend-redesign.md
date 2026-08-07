# Mnemonic Frontend Redesign Spec
**Date:** 2026-03-14  
**Status:** Approved

## Direction
Precision tool — clean, technical, confident. Light theme. Reference: Linear, Raycast, Vercel.

## Audience
Dual: developers integrating the API/MCP + power users of Claude wanting persistent memory.

## Design System

### Colors
```
--background:   #ffffff
--surface:      #f7f7f5
--surface-2:    #f0f0ed
--border:       #e4e4e0
--border-dark:  #c8c8c2
--text-primary: #0a0a0a
--text-muted:   #6b6b6b
--text-subtle:  #9b9b9b
--accent:       #0057FF
--accent-dim:   #e8efff
--danger:       #dc2626
--success:      #16a34a
```

### Typography
- Display H1: Instrument Serif, italic, 400
- Headings H2–H4: Geist, 600
- Body/UI: Geist, 400–500
- Code/data/metrics: Geist Mono, 400–500

### Rules
- Blue #0057FF only on: primary CTAs, active states, links, focus rings
- No gradients on solid backgrounds
- No card shadows — hairline borders only
- Border radius: 6px cards, 4px badges, pill for tags
- Motion: ease-out, 200ms transitions, 400ms page enters

## Landing Page

### Navbar
- White bg, 1px bottom border on scroll
- Wordmark left (Geist 600), nav links center, black "Get started" CTA right
- Active link: blue underline dot

### Hero
- Left-aligned, full-width split
- Headline: Instrument Serif italic mixed with Geist — "The memory Claude was born without."
- Right: Three.js node graph, blue nodes on white
- CTAs: blue "Get started free" + ghost "View docs"

### Problem (3 columns)
- Geist Mono large numbers 01 · 02 · 03
- Geist 600 short headers
- One sentence descriptions, muted text

### Architecture
- Horizontal pipeline with labeled boxes and connecting arrows

### Comparison table
- Hairline-bordered, blue checkmarks

### CTA section
- Full-width, centered, serif italic headline, one button

## Brain Dashboard

### Layout
- 3 columns: sidebar (240px, surface), main (flex, white), right panel (280px, surface)
- Sidebar: chat history, active item = 4px blue left border + accent-dim bg
- Main: user messages right-aligned in surface bubble, assistant left-aligned prose
- Input: 1px border, blue focus ring
- Right panel: tabs (Memory / Stats), Geist Mono metrics

## Scope
1. globals.css — new design tokens
2. tailwind.config.ts — new theme
3. layout.tsx — Instrument Serif + Geist fonts
4. navigation.tsx — light nav
5. All landing page components
6. Brain dashboard (brain/page.tsx + components)
7. Demo and architecture pages — token update only (no structural change)
