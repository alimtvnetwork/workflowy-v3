# Lovable Suggestions Tracker

> **Convention:** All suggestions tracked in this single file. Update status when completed. Move completed entries to `completed/` folder.
> **Updated:** 2026-03-18 (session 4)

---

## Active Suggestions

### S001 — Reconcile Legacy Docs with Current Specs
- **Created:** 2026-03-18
- **Source:** Lovable
- **Affected:** `docs/` folder
- **Description:** The `docs/` folder contains outdated specs that conflict with the current SQLite architecture in `spec/`.
- **Rationale:** New developers or AI models reading `docs/03-BACKEND.md` will get contradictory information.
- **Proposed Change:** Add a prominent deprecation notice at the top of each `docs/` file pointing to the `spec/` folder as the source of truth.
- **Acceptance Criteria:** No reader can mistake `docs/` content for current architecture.
- **Status:** open

### S002 — Rename Spec Columns to PascalCase
- **Created:** 2026-03-18
- **Source:** Lovable
- **Affected:** `spec/03-BACKEND.spec.md`, `spec/04-SYSTEM-ARCHITECTURE.spec.md`
- **Description:** Coding guidelines require PascalCase for all custom DB columns (`NodeId`, `ParentId`, `CreatedAt`), but spec files use snake_case (`node_id`, `parent_id`, `created_at`).
- **Rationale:** Spec and guidelines are contradictory. AI will be confused about naming.
- **Proposed Change:** Update all column names in backend/architecture spec files to PascalCase.
- **Acceptance Criteria:** Every column reference in specs uses PascalCase.
- **Status:** open

### S003 — Resolve Backend Runtime Strategy
- **Created:** 2026-03-18
- **Source:** Lovable
- **Affected:** Architecture (all backend modules)
- **Description:** Specs describe split SQLite backend with filesystem access, but Lovable only runs frontend code.
- **Rationale:** Without resolution, auth, data persistence, file uploads, and multi-user features are impossible.
- **Proposed Change:** Choose one: (a) Cloud-hosted backend, (b) browser SQLite (sql.js), (c) frontend-only with localStorage.
- **Acceptance Criteria:** Clear decision documented. Plan.md and specs updated to reflect chosen approach.
- **Status:** open — **BLOCKS IMPLEMENTATION** of auth, data layer, and all persistence features
- **User action required:** Yes — must choose backend strategy

### S004 — Add Versioning to Spec Files
- **Created:** 2026-03-18
- **Completed:** 2026-03-31
- **Source:** Lovable
- **Affected:** All spec files
- **Description:** Specs have no version numbers or changelogs, making it impossible to track changes between reviews.
- **Proposed Change:** Add `Version` and `Last Updated` headers to each spec file.
- **Acceptance Criteria:** Each spec file has a version header.
- **Status:** completed

### S005 — Run Backend Failure Analysis
- **Created:** 2026-03-18
- **Source:** Lovable
- **Affected:** `spec/03-BACKEND.spec.md`, `spec/04-SYSTEM-ARCHITECTURE.spec.md`
- **Description:** Frontend failure analysis (26 gaps, all fixed) is complete. Backend specs have NOT been analyzed for gaps yet.
- **Rationale:** Backend specs likely have similar ambiguities that would cause AI implementation failures.
- **Proposed Change:** Perform same-style gap analysis on backend specs after S003 is resolved.
- **Acceptance Criteria:** Backend gap analysis report created, all identified gaps fixed.
- **Status:** open — blocked by S003

---

## Completed Suggestions

> Completed suggestions are moved to `.lovable/memory/suggestions/completed/` as individual files.

### SC001 — Frontend Spec Gap Analysis (26 gaps)
- **Completed:** 2026-03-18
- **Description:** Identified and fixed 26 frontend spec gaps across 4 severity levels.
- **Result:** Sections §6A–§6F added to `spec/02-FRONTEND.spec.md`. Score: 100/100.
- **File:** `completed/SC001-frontend-gap-analysis.md`
