# S03 — Fix 49 Broken Relative Links in `spec/*.md`

- **suggestionId:** S03
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Audit
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/` (only links inside folders 18+ are actionable)
- **status:** ✅ completed (2026-04-25 UTC+8)
- **priority:** Low

## Description
Cross-reference audit found 49 broken relative links: stale `03-coding-guidelines` paths, legacy `03-general/` and `01-app/` references, wrong `../` depth in `15-wp-plugin-how-to`, missing `.mmd` / PNG assets.

## Rationale
Broken links cause the implementing AI to follow dead paths, lose context, and hallucinate substitutes.

## Proposed Change
Fix every broken link **inside folders 18+** (the editable scope). Document any link rooted in 01–17 as a known limitation in `spec/18-spec-issues/`.

## Acceptance Criteria
- [ ] All broken links inside folders 18+ resolve.
- [ ] Remaining 01–17 links documented as known-stale in `spec/18-spec-issues/`.
- [ ] CI gate added (see S05) so future links can't break silently.

## Completion Notes
*(pending)*
