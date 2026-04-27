# Drain Audit: F-future-G31e — Features-Island Cleanup

**Date:** 2026-04-27
**Task:** F-future-G31e — drain the 14 G-31.6 per-scope island advisories from task #38
**Outcome:** `FEATURES_ISLAND_EXEMPT` 5 → 0; `ENDPOINTS_ISLAND_EXEMPT` 9 → 9 (unchanged, audit-confirmed correct)

## What was actually wrong

Task #38 reported 14 per-scope islands and "drained" them by adding allow-list entries. But for the 5 features-scope islands, the underlying cause was **not** that they had no peers — it was that their `## N. Cross-references` (numbered, lowercase) heading was invisible to G-31's `extractRelatedSection()` substring matcher (which checks for `## Related` / `## Cross-References` / `## See also` exact-cased).

Each `*b` addendum already had:
- a parent (07b↔07-board-view, 08b↔08-share-dialog, 11b↔11-trash-view, 12b↔12-multi-select, 13b↔13-templates) that cited it in prose, and
- its own cross-references block listing peers,

but neither side counted as a G-31 link because the heading wasn't canonical.

## Resolution

1. **Renamed all 5 addendum headings** `## N. Cross-references` → `## Related` (G-31.7 features-scope canonical).
2. **Empty `FEATURES_ISLAND_EXEMPT`** — peer links now naturally exist; no exemption needed.
3. **Added 5 reciprocal back-links** to the 5 parent features (07-board-view, 08-share-dialog, 11-trash-view, 12-multi-select, 13-templates) so addendum→parent forward links are reciprocated.
4. **Added 1 sister back-link** in 13b ↔ 11b (intra-addendum cross-link that was already mutual in prose).
5. **Allow-listed 7 asymmetric-by-design** addendum→peer references in `FEATURES_EXEMPT` with rationale comments — these are cross-domain context cites where back-linking would bloat the peer page (e.g. `09b-mirror-peer-group-model.md`, `15-roles-and-permissions.md`).

## Endpoints decision (unchanged)

Audited all 9 endpoint islands (`03-layout-structure`, `04-page-content-area`, `05-interactions`, `06-item-context-menu`, `07-board-view`, `10-today-view`, `12-multi-select`, `13-templates`, `15-search`). Each one's natural cross-references genuinely point **out-of-scope** (to features/ or db-diagram/, plus `mem://`), not to sibling endpoints. Forcing peer links would be artificial. The original allow-list rationale stands; `ENDPOINTS_ISLAND_EXEMPT` correctly retains 9 entries.

## Net change to allow-list inventory

| List | Before | After | Δ |
|------|-------:|------:|--:|
| `FEATURES_ISLAND_EXEMPT` | 5 | 0 | -5 |
| `FEATURES_EXEMPT`        | 0 | 7 | +7 |
| `ENDPOINTS_ISLAND_EXEMPT`| 9 | 9 |  0 |
| **Total**                | 14 | 16 | +2 |

Net +2 entries, but qualitatively this is a healthier shape:
- The new `FEATURES_EXEMPT` entries describe **directed asymmetric links** with a clear rationale (cross-domain context cite), which is the kind of carve-out G-31's exemption mechanism was designed for.
- The retired `FEATURES_ISLAND_EXEMPT` entries described **bare files**, which is a coarser opt-out (silences any future reciprocity gap on that file too).

## Verification

- `node scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs` → exit 0
  - G-31.2 features: 113 cross-sibling links, 7 asymmetric-by-design (allow-listed), 0 unreciprocated.
  - G-31.6 features: 0 islands, 0 exempted.
  - G-31.5: 12 lists, all entries rationaled.
- `node scripts/spec-hygiene/00-run-all.mjs` → 6 pre-existing failures unchanged (numbering / headers / xrefs / features / contracts / enum-sync), no new regressions from G-29 onward.

## Allow-list inventory report regenerated

G-35 detected drift on the next CI run (entry counts shifted), regenerated `26-allow-list-inventory.md` to reflect the new state.

## Decision log

- **Heading rename strategy chosen** over preserving numbered headings + extending G-31's regex: rename is one-shot and aligns with G-31.7 canonical-heading goal; regex extension would permanently legitimise an inconsistent heading style.
- **Per-pair `FEATURES_EXEMPT` allow-list chosen** over bulk `FEATURES_ISLAND_EXEMPT` exemptions: directed-pair format gives reviewers visibility into which specific links are asymmetric-by-design.
- **Endpoint islands not touched**: their cross-domain rationale is genuinely correct; converting to peer-links would be artificial.
