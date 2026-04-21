# S04 — CI Gate: Require `00-overview.md` + `99-consistency-report.md`

- **suggestionId:** S04
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `scripts/spec-hygiene/`, CI pipeline
- **status:** ✅ completed (2026-04-21)
- **priority:** Medium

## Description
Add a CI script that fails the build if any `spec/` folder (numbered ≥18) is missing either `00-overview.md` or `99-consistency-report.md`.

## Rationale
Today these can be deleted by accident and nothing flags it until a manual audit runs.

## Proposed Change
- New script `scripts/spec-hygiene/12-check-required-files.mjs`.
- Wire into `scripts/spec-hygiene/00-run-all.mjs`.
- Document in `spec/18-spec-issues/` (folder 01 is READ-ONLY).

## Acceptance Criteria
- [x] Script exists and exits non-zero on missing files.
- [x] CI workflow invokes it (added to `00-run-all.mjs`).
- [x] Documented in `spec/18-spec-issues/04-required-files-gate.md`.

## Completion Notes
- **2026-04-21:** Implemented `scripts/spec-hygiene/12-check-required-files.mjs` (recursive walk of folders ≥18; requires both `00-overview.md` and `99-consistency-report.md`).
- First sweep surfaced **11 missing consistency reports** under `spec/32-ui-design/06-workflowy-ui/` (parent + 10 phase subfolders). All 11 stub reports authored.
- Wired into `scripts/spec-hygiene/00-run-all.mjs`.
- Documented in `spec/18-spec-issues/04-required-files-gate.md`.
- Verified end-to-end: gate exits 0.
