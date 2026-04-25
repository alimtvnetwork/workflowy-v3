# Lovable Suggestions Tracker

> **Convention:** All suggestions tracked in this single file. Update status when completed. Move completed entries to `completed/` folder.
> **Updated:** 2026-04-25 (UTC+8) — A-12 closed (top-level AT rollups for `31-app/` & `32-ui-design/` curated)

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

### A-04 — Enum-sync hygiene check (ItemType drift guard) → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Added `scripts/spec-hygiene/15-check-enums-in-sync.mjs` (extensible `ENUMS` table). Wired into `00-run-all.mjs`. Verified positive ✅ on 12-case `ItemType` and negative ❌ on a synthetic `phantom` case (exit 1). Adding new tracked enums = one row in the script's `ENUMS` array.

### A-05 — Tailwind token-sync hygiene check → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Added `scripts/spec-hygiene/16-check-tailwind-tokens.mjs`. Parses `@theme` block (39 colors / 12 spacing / 8 font-size / 3 radius), then scans 24 source files and asserts every token-bound utility (`bg-*`, `text-*`, `m*-*`, `rounded-*`, etc.) resolves. Built-in Tailwind utilities and arbitrary `[…]` values are correctly ignored. Wired into `00-run-all.mjs`. Negative-test verified (synthetic `text-h99` caught with exit 1).

### A-11 — Encode `MAX_ITEMS_PER_VIEW = 250` → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Constant added to `src/lib/constants.ts` with SSOT cross-link to `mem://architecture/data-model` and `spec/31-app/01-features/04-page-content-area.md`. Other constants now annotated with spec refs too.

### A-12 — Curate top-level AT rollups for App + UI Design → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Replaced placeholder scaffolds in `spec/31-app/97-acceptance-criteria.md` and `spec/32-ui-design/97-acceptance-criteria.md` with real, traceable criteria. App rollup: 23 criteria (AT-APP-01..23) across 5 subsections. UI Design rollup: 28 criteria (AT-UIDESIGN-01..28) across 6 subsections. Every criterion cites a source spec file or named SSOT and is verifiable today (by reading) or post-implementation (by automated test). All 18 hygiene checks still pass; 28/28 Vitest tests still pass. 83 leaf-level AT scaffolds remain for future curation.

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

### A-04 — Enum-sync hygiene check
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** New `15-check-enums-in-sync.mjs` parses `spec/20-enums-index.md` row + `src/types/index.ts` literal union for each tracked enum and fails on any drift. Wired into `00-run-all.mjs`. Negative-test verified.

### A-06 — Wire AppLayout into routes
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** `App.tsx` now wraps `<Home>` and `<NotFound>` in `<AppLayout>` via React Router `<Outlet />`. AppLayout provides `min-h-screen` background/foreground tokens; ready for Navbar + Sidebar slots in P1.3. Build clean, 19/19 tests still pass.

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
