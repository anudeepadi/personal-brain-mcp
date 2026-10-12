# ContextX public demo — design

The subject is provenance: a question, the exact words that matched, and the line in a
named source file they came from. The page runs the same word-overlap ranking as
`examples/offline_walkthrough.py`, in the browser, over two synthetic notes.

## Directions

1. **Evidence ledger.** Each source is a filed sheet: filename strip, byte count, chunk
   label, and a numbered line gutter. Results are citation slips that point to a
   ledger line. Mono for source and citations, system sans for prose. Brand Mist/Ink,
   Indigo for structure, Lime for matched words (the brand's "retrieval signal").
2. **Marginalia.** A single printed page; the query sits in the margin and matched
   words are pencil-underlined, with footnote-style citations. Warm and readable, but
   the margin layout collapses awkwardly on phones and hides that there are two files.
3. **Catalog drawer.** Library index cards per source with a lookup slip. Familiar,
   but card stacks drift toward the generic "second brain" look and weaken line-level
   provenance.

## Choice: Evidence ledger

It makes the citation the visual unit: every result names a file, chunk and line, and
that line is one keyboard activation away in the source pane. It stacks cleanly on a
phone (query → results → sources) and keeps the two files visibly separate.

## Rules

- Native controls only: form + search input + submit, buttons, anchor links to lines,
  `textarea` for editing. Visible `:focus-visible` rings; results announced politely.
- Show counts of matched words, never scores or confidence. No generated answers.
- Zero-overlap sources are hidden, so a query with no shared words shows an empty
  state. (The Python fixture would still return its top-k; this is stated on the page.)
- Editable note is capped at 1,000 characters so it stays one chunk, matching the
  production splitter's chunk size.
- No network: no fonts, images or scripts from elsewhere; CSP sets `connect-src 'none'`.
- Motion: smooth scroll and highlight fade only without `prefers-reduced-motion`.
