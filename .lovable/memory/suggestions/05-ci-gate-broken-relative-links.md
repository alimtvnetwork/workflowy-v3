# S05 — CI Gate: Fail on Broken Relative Links

- **suggestionId:** S05
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `scripts/spec-hygiene/`, CI pipeline
- **status:** open
- **priority:** Medium

## Description
Run the cross-reference audit in CI and fail on any broken relative link inside folders 18+.

## Rationale
Pairs with S03 — once the existing 49 links are fixed, this gate prevents regression.

## Proposed Change
- New script `scripts/spec-hygiene/13-check-relative-links.mjs` (folders 18+ only).
- Wire into `00-run-all.mjs`.
- Strict mode opt-in via env: `SPEC_LINKS_STRICT=1`.

## Acceptance Criteria
- [ ] Script exists and reports broken links with file:line:link.
- [ ] CI invokes it after S03 is complete.
- [ ] Strict mode default after a 1-week soak period.

## Completion Notes
*(pending — depends on S03)*
