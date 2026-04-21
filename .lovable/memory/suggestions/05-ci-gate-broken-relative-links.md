# S05 — CI Gate: Fail on Broken Relative Links

- **suggestionId:** S05
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `scripts/spec-hygiene/`, CI pipeline
- **status:** ✅ completed (2026-04-21)
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
- [x] Script exists and reports broken links with file:line:link.
- [x] CI invokes it after S03 is complete.
- [x] Strict mode default after a 1-week soak period.

## Completion Notes
- **2026-04-21:** Existing `scripts/spec-hygiene/03-check-links.mjs` already implements the gate's intent — it scans all `spec/**/*.md` for broken relative links and exits 1 on any failure. It is **already wired** into `scripts/spec-hygiene/00-run-all.mjs`.
- The proposed scope-narrowing (folders 18+ only) and the dedicated `13-` filename were part of the S03/S05 split when 01–17 still had broken links. Now that S03 left **zero** broken links across the entire `spec/` tree, the existing global gate is stricter than the proposed 18+ gate. No new script needed.
- Strict mode is the default of `03-check-links.mjs` (non-zero exit on any broken link) — no env opt-in required.
- Verified: `node scripts/spec-hygiene/03-check-links.mjs` → ✅ exit 0; full `00-run-all.mjs` runs this on every CI run.
