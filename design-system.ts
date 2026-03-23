/**
 * Mnemonic Design System
 * ─────────────────────────────────────────────────
 * Monochrome + amber. Editorial/Magazine aesthetic.
 * Instrument Serif (display) + Geist (body) + Geist Mono (data/code).
 *
 * Created: 2026-03-21 via /design-consultation
 * Research: Pinecone, Mem0, Weaviate, Qdrant — all converge on
 * sans-serif + blue/green/purple. Mnemonic breaks from this with
 * serif display type and a monochrome palette.
 */

// ── Color Tokens ──────────────────────────────────────────────────

export const colors = {
  accent: {
    DEFAULT: '#b45309',  // Amber — "memory activated"
    hover: '#92400e',
    muted: 'rgba(180, 83, 9, 0.08)',
    subtle: 'rgba(180, 83, 9, 0.15)',
  },

  // Warm stone scale (NOT cold corporate grays)
  light: {
    background: '#ffffff',
    surface: '#fafaf9',
    raised: '#f5f5f4',
    inset: '#e7e5e4',
    textPrimary: '#0c0a09',
    textSecondary: '#44403c',
    textTertiary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    borderStrong: '#d6d3d1',
  },

  dark: {
    background: '#0c0a09',
    surface: '#1c1917',
    raised: '#292524',
    inset: '#44403c',
    textPrimary: '#fafaf9',
    textSecondary: '#d6d3d1',
    textTertiary: '#a8a29e',
    textMuted: '#78716c',
    border: '#292524',
    borderStrong: '#44403c',
    accent: '#d97706',       // Brightened for dark mode contrast
    accentHover: '#f59e0b',
    accentMuted: 'rgba(217, 119, 6, 0.12)',
    accentSubtle: 'rgba(217, 119, 6, 0.2)',
  },

  semantic: {
    success: { light: '#15803d', dark: '#22c55e' },
    warning: { light: '#a16207', dark: '#eab308' },
    error:   { light: '#b91c1c', dark: '#ef4444' },
    // Info uses text color (monochrome system — no dedicated info color)
  },
} as const

// ── Typography ────────────────────────────────────────────────────

export const typography = {
  fonts: {
    display: 'Instrument Serif',   // Hero/display headings — key differentiator
    sans: 'Geist',                 // Body/UI text
    mono: 'Geist Mono',           // Data tables, code, labels
  },

  cssVariables: {
    display: '--font-display',
    sans: '--font-sans',
    mono: '--font-mono',
  },

  // Loading: next/font/google for Instrument Serif, next/font built-in for Geist
  scale: {
    xs:   { size: '12px', rem: '0.75rem' },
    sm:   { size: '14px', rem: '0.875rem' },
    base: { size: '16px', rem: '1rem' },
    lg:   { size: '20px', rem: '1.25rem' },
    xl:   { size: '24px', rem: '1.5rem' },
    '2xl': { size: '30px', rem: '1.875rem' },
    '3xl': { size: '36px', rem: '2.25rem' },
    '4xl': { size: '48px', rem: '3rem' },
    '5xl': { size: '60px', rem: '3.75rem' },
  },

  lineHeight: {
    body: 1.5,
    display: 1.1,
    tight: 1.05,
  },
} as const

// ── Spacing ───────────────────────────────────────────────────────

export const spacing = {
  base: 4,  // 4px base unit
  scale: {
    '2xs': '2px',
    xs:    '4px',
    sm:    '8px',
    md:    '16px',
    lg:    '24px',
    xl:    '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  density: 'comfortable',  // Not SaaS-cramped, not wasteful
} as const

// ── Layout ────────────────────────────────────────────────────────

export const layout = {
  approach: 'hybrid',  // Editorial for landing, grid for dashboard
  maxWidth: '1120px',
  grid: {
    desktop: 12,
    tablet: 8,
    mobile: 1,
  },
  borderRadius: {
    sm:   '4px',   // Inputs, chips, small controls
    md:   '8px',   // Cards, panels, code blocks
    lg:   '12px',  // Modals, popovers, large containers
    full: '9999px', // Avatars, badges, pills
  },
} as const

// ── Motion ────────────────────────────────────────────────────────

export const motion = {
  approach: 'intentional',  // Meaningful state transitions, not decorative
  easing: {
    enter: 'ease-out',
    exit: 'ease-in',
    move: 'ease-in-out',
  },
  duration: {
    micro:  '75ms',    // Toggles, focus rings
    short:  '150ms',   // Buttons, hover states, tab switches
    medium: '300ms',   // Card entrances, panel slides
    long:   '500ms',   // Page transitions, loading states
  },
} as const

// ── Editorial Conventions ─────────────────────────────────────────
// These distinguish Mnemonic from generic SaaS products:
//
// - Figure annotations: "Fig. N —" labels in Geist Mono, uppercase, muted
// - Monospace labels: Section headers, metadata at 11px, uppercase, 0.05-0.08em spacing
// - Pull quotes: Instrument Serif italic, hairline rules top and bottom
// - Citation-style references: [1], [2] notation where appropriate
// - Hairline rules: 1px borders (NOT shadows) for section separation
// - Links: Black + underline (editorial). Amber on hover. NEVER blue.
// - Primary buttons: Black fill. Amber reserved for memory-specific actions.

// ── Color Usage Rules ─────────────────────────────────────────────
//
// AMBER appears when:
//   - Memory is active (consolidation progress, recall triggered)
//   - Notifications / badges (new memories consolidated)
//   - Emphasis (key terms, selected items, focus rings)
//   - Memory-specific buttons (Consolidate, Recall, Archive)
//
// AMBER never appears for:
//   - Generic links (use black + underline)
//   - Primary buttons (use black fill)
//   - Navigation (use text colors)
//   - Backgrounds (except as muted/subtle tints for badges)

// ── Anti-Patterns (NEVER do this) ─────────────────────────────────
//
// - Purple/violet gradients
// - 3-column feature grid with icons in colored circles
// - Centered everything with uniform spacing
// - Uniform bubbly border-radius on all elements
// - Gradient buttons
// - Generic stock-photo hero sections
// - Blue links
// - Multiple accent colors (amber is the ONLY color)

// ── Decisions Log ─────────────────────────────────────────────────
//
// 2026-03-21 | Initial design system | /design-consultation
//   Researched Pinecone, Mem0, Weaviate, Qdrant. All converge on
//   sans-serif + blue/green/purple. Mnemonic breaks from this.
//
// 2026-03-21 | Monochrome + amber (Risk A)
//   Maximum editorial restraint. Amber = "memory activated."
//   Sidesteps the blue/green/purple competition entirely.
//
// 2026-03-21 | Kept Instrument Serif + Geist
//   Validated as strongest differentiators in AI infra space.
//   No other competitor uses a serif display font.
//
// 2026-03-21 | Editorial/Magazine aesthetic
//   Product rooted in cognitive science (sleep consolidation).
//   Design reads like research publication, not SaaS template.
//
// 2026-03-21 | Warm stone neutrals
//   Warm grays over cold corporate grays to reinforce
//   human/biological positioning. Tailwind stone scale.
