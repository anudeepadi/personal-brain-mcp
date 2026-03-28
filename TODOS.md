# TODOS

## P1 — Pre-Launch

### Fix stale README
- **What:** README references `cd client` and `cd server` from old repo structure
- **Why:** PH visitors and recruiters will try to set up locally. Broken README = credibility loss
- **Effort:** S (CC: ~5 min)
- **Depends on:** Nothing
- **Source:** /plan-ceo-review 2026-03-27, Codex outside voice finding #9

### Fix backend bugs (double-write, uninitialized services, fake pagination)
- **What:** /upsert calls both process_and_store and process_and_store_enhanced (double write). Services use global clients without _initialize_services(). Document listing uses "*" query hack with fake pagination.
- **Why:** Backend correctness before layering Phase 1A features on top
- **Effort:** M (CC: ~30 min)
- **Depends on:** Nothing. Blocks Phase 1A.
- **Source:** /plan-ceo-review 2026-03-27, Codex outside voice findings #1, #5

## P2 — Post-Launch Polish

### Mobile responsive layout for brain page
- **What:** Below 768px, stack panels vertically with a tab switcher (Chat / Memory) instead of side-by-side resizable panels
- **Why:** 30-40% of PH traffic may be mobile. Currently the 2-panel layout breaks on small screens.
- **Effort:** S (CC: ~20 min)
- **Depends on:** Phase 1B complete
- **Source:** /plan-ceo-review 2026-03-27, Section 11 (Design & UX)
