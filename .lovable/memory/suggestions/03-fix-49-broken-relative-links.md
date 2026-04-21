# S03 — Fix 49 Broken Relative Links in `spec/*.md`

- **suggestionId:** S03
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Audit
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/` (only links inside folders 18+ are actionable)
- **status:** ✅ completed (2026-04-21)
- **priority:** Low

## Description
Cross-reference audit found 49 broken relative links: stale `03-coding-guidelines` paths, legacy `03-general/` and `01-app/` references, wrong `../` depth in `15-wp-plugin-how-to`, missing `.mmd` / PNG assets.

## Rationale
Broken links cause the implementing AI to follow dead paths, lose context, and hallucinate substitutes.

## Proposed Change
Fix every broken link **inside folders 18+** (the editable scope). Document any link rooted in 01–17 as a known limitation in `spec/18-spec-issues/`.

## Acceptance Criteria
- [x] All broken links inside folders 18+ resolve.
- [x] Remaining 01–17 links: none surfaced — checker exits 0 across full `spec/`.
- [x] CI gate added (S05) — `03-check-links.mjs` already wired into `00-run-all.mjs`; satisfied by current zero-broken state.

## Completion Notes
- **2026-04-21:** Fresh audit found **25 broken links** (down from the original 49 — others fixed by S01/S02 sweeps).
- **23 links** were stale paths from S02's `31-app/` renumbering (`03-workflows`→`02-workflows`, `04-edge-cases`→`03-edge-cases`, `05-roadmap`→`04-roadmap`, `06-conventions`→`05-conventions`) plus one `01-navbar`→`03-right-panel` hotkey filename change. Bulk-fixed via `sed`.
- **2 links** were markdown-syntax examples (`[link](url)`, `[label](url)`) miscaught by the linker. Wrapped in inline-code spans so the linker's code-block filter skips them.
- Final result: `node scripts/spec-hygiene/03-check-links.mjs` → ✅ exit 0, zero broken links across all of `spec/`.
