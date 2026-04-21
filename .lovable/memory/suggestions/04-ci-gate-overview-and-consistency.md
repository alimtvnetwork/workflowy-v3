# S04 — CI Gate: Require `00-overview.md` + `99-consistency-report.md`

- **suggestionId:** S04
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `scripts/spec-hygiene/`, CI pipeline
- **status:** open
- **priority:** Medium

## Description
Add a CI script that fails the build if any `spec/` folder (numbered ≥18) is missing either `00-overview.md` or `99-consistency-report.md`.

## Rationale
Today these can be deleted by accident and nothing flags it until a manual audit runs.

## Proposed Change
- New script `scripts/spec-hygiene/12-check-required-files.mjs`.
- Wire into `scripts/spec-hygiene/00-run-all.mjs`.
- Document in `spec/01-spec-authoring-guide/`.

## Acceptance Criteria
- [ ] Script exists and exits non-zero on missing files.
- [ ] CI workflow invokes it.
- [ ] Documented in spec-authoring guide.

## Completion Notes
*(pending)*
