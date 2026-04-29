# Audit memo — Per-(gate, path) ledger Phase 3 (CI promotion)

**Date:** 2026-04-29
**Task:** #11 Phase-3 (closes per-(gate, path) trilogy)
**Gate:** `G-13-LEDGER-PER-GATE-PATH` — DOC-NORM → **CI**

## What changed

- New helpers in `30-check-at-citation-validity.mjs`:
  - `globToRegExp(glob)` — minimal POSIX-glob → RegExp converter (`**` → any path, `*` → any segment).
  - `LEDGER_GLOBS_BY_ENTRY` — Map<entry, RegExp[]> built once at load.
  - `isRedundancyExempt(entry, declaringFile)` — returns true iff (a) entry is in the in-source emergency Set, OR (b) entry has ≥1 ledger row whose `pathGlob` matches `declaringFile`.
- G-30.2 call site replaced `REDUNDANCY_ALLOWLIST.has(prefix)` with `isRedundancyExempt(prefix, file)`.
- All 41 ledger row globs tightened from `spec/01-features/**/*.md` and `spec/02-workflows/**/*.md` (which did not exist as folders) to the actual declaring files: `spec/31-app/01-features/97-acceptance-criteria.md` (35 rows), `spec/31-app/02-workflows/00-overview.md` (9 rows), `spec/31-app/{02-workflows,04-roadmap,06-endpoints,07-db-diagram}/97-acceptance-criteria.md` (4 rows), `spec/31-app/01-features/15-roles-and-permissions.md` (1 row), `spec/**/*.md` (2 frozen-dispatch rows).

## Verification

- Final state: `G-30.2 redundancy: 0 cleanup candidates 🎉`.
- Negative test: corrupting AT-INFO- row's pathGlob to `spec/99-nope/foo.md` → all 7 covered citations correctly re-surface as cleanup candidates. Restoring the row → back to 0.
- Full `00-run-all.mjs` sweep green (36 runners) after re-running G-35 inventory regen.

## Follow-ups (deferred)

- **Sibling migration:** `WORKFLOW_PROXY_ALLOWLIST` (`31-…mjs`) → ledger.
- **Sibling migration:** `DDL_UNIQUE_ALLOWLIST` (`32-…mjs`) → ledger.
- The `pathGlob` is currently a single column per row; if a row needs to span multiple discrete files, author multiple rows with the same `entry`. The schema's "no-overlap-info" rule would then surface duplicate `(entry, pathGlob)` pairs.
