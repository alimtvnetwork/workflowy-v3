# Lovable Suggestions Tracker

> **Convention:** All suggestions tracked in this single file. Update status when completed. Move completed entries to `completed/` folder.
> **Updated:** 2026-04-25 (UTC+8) — sweep closed all stale legacy items (S001, S002, S005-original)

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

---

## Closed Suggestions (this sweep — 2026-04-25)

### S001 — Reconcile Legacy Docs with Current Specs → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** The `docs/` folder no longer exists in the repository. Verified via `ls docs/` → "No such file or directory". The legacy content was either deleted or migrated into `spec/` during the 2026-03 → 2026-04 restructure. No further action needed.

### S002 — Rename Spec Columns to PascalCase → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** Target files `spec/03-BACKEND.spec.md` and `spec/04-SYSTEM-ARCHITECTURE.spec.md` no longer exist (replaced by `spec/04-database-conventions/` and `spec/05-split-db-architecture/`). Current database specs already enforce PascalCase as the standard with documented exceptions for WordPress core tables (`wp_posts`) and migration filenames. The underlying concern is fully resolved by the restructure.

### S005-original — Run Backend Failure Analysis → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** Was blocked by S003 (still open). The original "backend specs" it referenced (`03-BACKEND.spec.md`, `04-SYSTEM-ARCHITECTURE.spec.md`) no longer exist. When S003 is resolved, a fresh gap analysis should be run against whichever backend stack is chosen — not against the obsolete file paths. Closing as superseded.

> Note: "S005" in the per-file suggestion folder (`05-ci-gate-broken-relative-links.md`) is a different item — that one was closed 2026-04-25 alongside S03. The numbering collision is historical; the per-file suggestions in `02-…md` through `06-…md` are the canonical SSOT.

---

## Completed Suggestions

> Completed suggestions are moved to `.lovable/memory/suggestions/completed/` as individual files.

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
