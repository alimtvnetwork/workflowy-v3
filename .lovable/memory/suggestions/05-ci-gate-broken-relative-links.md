# S05 — CI Gate: Fail on Broken Relative Links

- **suggestionId:** S05
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `scripts/spec-hygiene/`, CI pipeline
- **status:** ✅ completed (2026-04-25 UTC+8)
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
- [x] Script exists and reports broken links with `file: broken link → href`.
- [x] CI invokes it (wired into `scripts/spec-hygiene/00-run-all.mjs`).
- [x] Strict-by-default — exits non-zero on any broken link, no soak period needed.

## Completion Notes
**2026-04-25 (UTC+8):** Verified the existing `scripts/spec-hygiene/03-check-links.mjs` already meets every S05 requirement — it scans all `spec/**/*.md`, strips code fences and inline code spans (preventing false positives like `Fail[MyOutput](result.AppError())`), resolves every relative link, and exits 1 on the first broken target. Wired into `00-run-all.mjs` at position 3. No need for a separate `13-check-relative-links.mjs` — the spec-wide scope is stricter than the originally-proposed folder-18+ scope. Closing as redundant-with-existing-implementation.
