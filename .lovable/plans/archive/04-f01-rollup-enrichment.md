# Active Plans

> **Updated:** 2026-04-25 (UTC+8) · **Status:** 1 active plan

---

## 04 — F-01 Rollup Enrichment (P0, recovers +10)

**Goal:** Close audit finding F-01 by upgrading three top-level rollups (`spec/31-app/00-overview.md`, `spec/31-app/01-features/00-overview.md`, `spec/32-ui-design/00-overview.md`) and the two scaffold acceptance-criteria files (`spec/31-app/97-acceptance-criteria.md`, `spec/32-ui-design/97-acceptance-criteria.md`) from "TOC + boilerplate" to "implementation-grade rollups" so a mediocre AI landing on the rollup can implement without hallucinating generic web-app patterns.

**Root cause:** Leaves are dense and canonical, but a navigating AI hits a TOC-only rollup first and never sees load-bearing rules until it drills several levels deep. The rollup must surface mission, MVP scope, recursive-tree contract, must-read sequence, and concrete acceptance criteria with stable IDs.

**Steps**
1. Enrich `spec/31-app/00-overview.md` — Mission, Load-Bearing Rules, MVP scope, Implementation Ground Truth, Must-Read Sequence.
2. Enrich `spec/31-app/01-features/00-overview.md` — Feature dependency graph, MVP vs deferred matrix, must-read sequence.
3. Enrich `spec/32-ui-design/00-overview.md` — UI mission, recursive-tree rendering contract, design-token SSOT pointer, must-read sequence.
4. Populate `spec/31-app/97-acceptance-criteria.md` — `AT-APP-01..25` derived from features 01–15.
5. Populate `spec/32-ui-design/97-acceptance-criteria.md` — `AT-UIDESIGN-01..25` derived from architecture/state/design-system/editor/quality.
6. Bump version 0.32.0 → 0.33.0, run hygiene, archive plan on success.

**Success criteria**
- Each enriched rollup answers "what is this app + what must I implement first?" without further reads.
- Both AT files have ≥20 concrete, stable-ID, source-traced criteria.
- All 18 hygiene checks pass.
- Re-audit projects `Frontend Ui` 65% → ≥85%, overall 75 → ≥85.

**Out of scope:** F-02 (CI/CD), F-03 (PowerShell/CLI), F-04 (code blocks). Tracked separately.

---

## Historical plans

All historical plans are in `.lovable/plans/archive/`:

| Plan | Outcome |
|------|---------|
| `01-restructure-31-app-and-32-ui-design.md` | ✅ Executed — `21-app/`, `24-app-design-system-and-ui/` removed; canonical trees are `31-app/` and `32-ui-design/`. |
| `02-spec-hygiene-fixes.md` | ✅ Executed — All 18 audit issues (I-01 … I-18) closed. |
| `03-workflowy-spec-consolidation.md` | ✅ Executed — All 10 phases done; blockers B1/B2/B3/D1 resolved. |

---

## What's still live

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit
- ~~**S003** backend runtime decision~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite)
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- F-02, F-03, F-04 audit findings (next plans after this one)
- 22 AT stubs across remaining domains (non-blocking)
