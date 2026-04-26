# AI Readiness Report — Post-A-27 Audit

> **Generated:** 2026-04-26 (UTC+8)
> **Triggered by:** polish #5 (option-b end-to-end audit, post-A-27 handoff lock)
> **Spec scope:** 1268 markdown files across 25 top-level domain folders
> **Total acceptance criteria IDs:** 1720 unique `AT-*` references
> **Headline:** ✅ **94/100** — handoff-ready with 4 small follow-ups (1 code defect blocked by spec-only mode, 2 phantom AT-stubs, 1 enum-source-link gap). All 4 are small and actionable.

---

## 1. Coverage scorecard

| Dimension | Score | Detail |
|-----------|-------|--------|
| Required-files (`00-overview` + `99-consistency-report`) | 100/100 | 142/142 editable folders pass `12-check-required-files.mjs` |
| Acceptance-criteria coverage | 99/100 | 116/118 folders have curated `97-acceptance-criteria.md`; 2 fresh phantom-stubs (see F-AUD27-02) |
| Cross-references | 100/100 | 260 overviews + checklists scan clean (`09-check-xrefs.mjs`) |
| Auto-TOC sentinels | 100/100 | 8 updated, 134 already in sync |
| Tailwind-token enforcement (src/) | 100/100 | 25 files scanned; all token references resolve |
| Enum sync (spec ↔ TS) | 50/100 | **1 drift on `ItemType`** (see F-AUD27-01) |
| Spec hygiene runner overall | 17/18 checks pass | Only `15-check-enums-in-sync.mjs` fails |

---

## 2. Findings

### F-AUD27-01 — `ItemType` drift between spec SSOT and `src/types/index.ts` (HIGH)

- **Symptom:** `node scripts/spec-hygiene/15-check-enums-in-sync.mjs` fails:
  ```
  ❌ enum-sync drift on ItemType:
     spec has but TS missing: dashboard
     TS has but spec missing: mirror
  ```
- **Root cause:** Round-3 AUDIT-03 (recorded 2026-04-26 in `spec/20-enums-index.md` and `spec/18-spec-issues/07-audit-03-dashboard-taxonomy.md`) corrected the canonical 12-value `ItemType` list — swapped `mirror` → `dashboard` because mirrors are `Mirrors` table rows, not turn-into targets — but `src/types/index.ts` still has the pre-AUDIT-03 list (line 44 has `mirror`; doc-comment line 30 says "`dashboard` is a VIEW, not an item type").
- **Spec is correct.** TS file is stale.
- **Required fix (TS, ~3 lines, blocked by spec-only mode):**
  - `src/types/index.ts` line 30: invert the doc-comment — `dashboard` IS an item type, `mirror` is intentionally NOT (mirrors are `Mirrors` rows).
  - `src/types/index.ts` line 44: change `| "mirror"` to `| "dashboard"`.
  - Bump `package.json` minor version.
- **Authorization:** Cannot fix until user lifts `mem://constraints/spec-only-mode`. Recorded as the **first task** to run after `exit spec-only`, before P1.1 Bootstrap.

### F-AUD27-02 — 2 phantom AT-stubs created in already-curated folders (MEDIUM)

- **Symptom:** `13-generate-at-stubs.mjs` created two new scaffold files:
  - `spec/31-app/02-workflows/97-acceptance-criteria.md` (v0.1.0 stub)
  - `spec/31-app/04-roadmap/97-acceptance-criteria.md` (v0.1.0 stub)
- **Root cause:** Both folders were already covered by **canonical `AT-APP-NN`** rollups (workflow ATs were folded into `AT-APP-43..57` in polish #2 / A-26 wave-2 fold). The generator doesn't know about that mapping — it just sees a folder with topic files and no `97-acceptance-criteria.md` and creates a stub.
- **Required fix (spec-only-friendly):** Replace each new stub with a **dispatch index** that points at the canonical `AT-APP-NN` rollup (same pattern as `spec/08-docs-viewer-ui/02-features/97-acceptance-criteria.md`). Folded into polish #5 below.

### F-AUD27-03 — 2 directories without `00-overview.md` (LOW — both expected)

- **Symptom:** `12-check-required-files.mjs` allows them, but a manual scan shows:
  - `spec/03-error-manage/03-error-code-registry/01-registry/` — 6 numbered topic files, no overview
  - `spec/32-ui-design/06-workflowy-ui/02-search/_archive-v1/` — leading-underscore archive folder
- **Root cause:** The first is genuinely missing an overview; the second is intentionally archived (leading-underscore convention) and excluded from required-files via the script's allow-list.
- **Required fix:** Either add `00-overview.md` to `01-registry/` (1 small file, in-scope for spec-only) OR document the exclusion in the parent's overview. Folded into polish #5.

### F-AUD27-04 — Acceptance-coverage runner reports "2 warning(s)" (LOW)

- **Symptom:** `08-check-acceptance-coverage.mjs` exits OK but with 2 warnings.
- **Root cause:** Same 2 folders as F-AUD27-02 (now flagged twice by different scripts — workflows + roadmap had no `97-acceptance-criteria.md` until the generator ran).
- **Required fix:** Resolved by F-AUD27-02 fix.

---

## 3. What's confirmed solid

| Area | Evidence |
|------|----------|
| Backend runtime decision | WordPress plugin (PHP + SQLite); `mem://constraints/backend-runtime-deferred` closed S003 on 2026-04-25 |
| Spec consolidation | `spec/31-app/` + `spec/32-ui-design/` are the canonical app trees (Plan 01) |
| Workflow → canonical fold | All 15 `AT-WF-*` IDs folded into `AT-APP-43..57` (polish #2 / A-26) |
| Implementation phases | `spec/31-app/04-roadmap/01-implementation-phases.md` v1.1.0 + `03-implementation-checklist.md` (A-27, 64 atomic pre-flight checks) |
| Hygiene infrastructure | 18 scripts wired through `00-run-all.mjs`; `04-generate-index.mjs` produced a 1268-file index |
| Round-3 audits | All 6 closed (Plans 04–08 + AUDIT-01); residuals R-1 (pseudocode casing) and R-2 (enum-source link) closed in re-audit pass |
| Hard prohibitions | `.lovable/strictly-avoid.md` is consolidated and exhaustive |
| Test infrastructure | Vitest + RTL + jsdom installed (A-08); `<ToastProvider>` wired (A-07); `<AppLayout>` wired (A-06) |

---

## 4. Recommended next actions

| Priority | Action | Blocked by |
|----------|--------|------------|
| **1** | **`exit spec-only`** then immediately fix `src/types/index.ts` (F-AUD27-01) — 3-line edit | `mem://constraints/spec-only-mode` |
| 2 | Polish #5: replace 2 phantom AT-stubs with dispatch indexes (F-AUD27-02) — spec-only-safe | none |
| 3 | Polish #5b: add `00-overview.md` to `spec/03-error-manage/03-error-code-registry/01-registry/` OR document exclusion (F-AUD27-03) — spec-only-safe | none |
| 4 | After F-AUD27-01 fix: re-run hygiene; expect 18/18 pass; bump score to 100/100 | F-AUD27-01 |

---

## 5. Process compliance

- [x] No `src/` files were modified during this audit (spec-only mode honoured)
- [x] No `spec/` 01–17 read-only folders modified (only the new report file in `.lovable/reports/`)
- [x] No `.release/` touched
- [x] Malaysia UTC+8 timestamps used
- [x] Findings cross-link to the source-of-truth files

---

## 6. Cross-references

- `.lovable/plans/00-active.md` — Active plan (will be updated to record A-28 audit)
- `.lovable/memory/suggestions/suggestions-tracker.md` — Tracker (will record A-28)
- `spec/20-enums-index.md` — Enum SSOT (correct on `ItemType`)
- `spec/18-spec-issues/07-audit-03-dashboard-taxonomy.md` — AUDIT-03 ruling
- `spec/31-app/04-roadmap/03-implementation-checklist.md` — A-27 pre-flight gate
- `src/types/index.ts` — Stale TS enum (F-AUD27-01)
- `scripts/spec-hygiene/00-run-all.mjs` — Runner that surfaced findings

---

*Generated 2026-04-26 (polish #5, option-b). Score: **94/100**. Restoring to 100/100 requires lifting spec-only mode and applying the F-AUD27-01 TS fix; the other 3 findings are spec-only-safe and folded into the next polish iteration below.*
