# Lovable Suggestions Tracker

> **Convention:** All suggestions tracked in this single file. Update status when completed. Move completed entries to `completed/` folder.
> **Updated:** 2026-04-25 (UTC+8) — A-08 closed (Vitest + 19 tests for pure helpers)

---

## Active Suggestions

### S003 — Resolve Backend Runtime Strategy
- **Created:** 2026-03-18
- **Source:** Lovable
- **Affected:** Architecture (all backend modules)
- **Description:** Specs describe split SQLite backend with filesystem access, but Lovable only runs frontend code.
- **Rationale:** Without resolution, auth, data persistence, file uploads, and multi-user features are impossible.
- **Proposed Change:** Choose one: (a) Lovable Cloud, (b) WordPress backend, (c) browser SQLite (sql.js), (d) frontend-only with localStorage.
- **Acceptance Criteria:** Clear decision documented. Plan.md and specs updated to reflect chosen approach.
- **Status:** open — **BLOCKS IMPLEMENTATION** of auth, data layer, and all persistence features
- **User action required:** Yes — must choose backend strategy (memory hint: leaning WordPress)

### A-04 — Enum-sync hygiene check (ItemType drift guard)
- **Created:** 2026-04-25
- **Source:** Audit (this round)
- **Description:** `src/types/index.ts` `ItemType` literal union and `spec/20-enums-index.md` §3.5 are hand-maintained twins.
- **Proposed Change:** Add `scripts/spec-hygiene/13-check-enums-in-sync.mjs`; wire into `00-run-all.mjs`.
- **Status:** open — non-blocking, prevents silent drift

### A-05 — Tailwind token-sync hygiene check
- **Created:** 2026-04-25
- **Source:** Audit (this round)
- **Description:** Components reference Tailwind classes (`text-h1`, `mb-md`, `bg-background`) without compile-time validation against `index.css` `@theme` block.
- **Proposed Change:** Hygiene check that parses `@theme` and asserts every Tailwind class used in `src/**` resolves.
- **Status:** open — non-blocking

### A-11 — Encode `MAX_ITEMS_PER_VIEW = 250`
- **Created:** 2026-04-25
- **Source:** Audit (this round)
- **Description:** Core memory rule "250-item limit per view" exists in spec text but no constant in `lib/constants.ts`.
- **Proposed Change:** Export the constant; reference from virtualization spec when authored.
- **Status:** open — trivial fix

---

## Closed Suggestions (this sweep — 2026-04-25)

### S001 — Reconcile Legacy Docs with Current Specs → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** The `docs/` folder no longer exists. Verified via `ls docs/`. Migrated into `spec/` during 2026-03 → 2026-04 restructure.

### S002 — Rename Spec Columns to PascalCase → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** Target files `spec/03-BACKEND.spec.md` and `spec/04-SYSTEM-ARCHITECTURE.spec.md` no longer exist. Current database specs already enforce PascalCase as standard.

### S005-original — Run Backend Failure Analysis → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** Original referenced specs no longer exist. Closing as superseded; new gap analysis to be run against whichever backend stack is chosen via S003.

> Note: "S005" in `05-ci-gate-broken-relative-links.md` is a different item (closed alongside S03).

---

## Completed Suggestions

> Completed suggestions are moved to `.lovable/memory/suggestions/completed/` as individual files.

### A-08 — Vitest setup + tests for pure helpers
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** Added `vitest@3.2.4`, `@testing-library/react@16.3.2`, `@testing-library/jest-dom@6.9.1`, `jsdom@25.0.1`. Created `vitest.config.ts`, `src/test/setup.ts`. Added `test` / `test:watch` scripts. Wrote 19 tests covering `matches()`, `formatCombo()`, `getHotkey()`, registry shape, `asItemId()`, `asOwnerId()` — all passing in 3.7s. Closes audit finding A-08; partly mitigates A-02 (registry now snapshot-locked).

### SC001 — Frontend Spec Gap Analysis (26 gaps)
- **Completed:** 2026-03-18
- **Description:** Identified and fixed 26 frontend spec gaps across 4 severity levels.
- **Result:** Sections §6A–§6F added to `spec/02-FRONTEND.spec.md`. Score: 100/100.
- **File:** `completed/SC001-frontend-gap-analysis.md`

### S004 — Add Versioning to Spec Files
- **Completed:** 2026-03-31
- **Result:** Each spec file has a Version header.

### S02 — Fix 5 Audit Findings in spec/ 31–36
- **Completed:** 2026-04-21
- **File:** `02-fix-spec-31-36-audit-findings.md`

### S03 — Fix 49 Broken Relative Links
- **Completed:** 2026-04-25
- **File:** `03-fix-49-broken-relative-links.md`
- **Result:** Independent re-scan of 1,248 files found 0 broken links out of 2,622 real links.

### S04 — CI Gate: Required Files
- **Completed:** 2026-04-21
- **File:** `04-ci-gate-overview-and-consistency.md`
- **Result:** `scripts/spec-hygiene/12-check-required-files.mjs` wired into `00-run-all.mjs`.

### S05 — CI Gate: Broken Relative Links
- **Completed:** 2026-04-25
- **File:** `05-ci-gate-broken-relative-links.md`
- **Result:** Existing `03-check-links.mjs` already meets every requirement; closed as redundant-with-existing-implementation.

### S06 — Move Parallel Spec Folders
- **Completed:** 2026-04-23
- **File:** `06-move-parallel-spec-folders.md`
