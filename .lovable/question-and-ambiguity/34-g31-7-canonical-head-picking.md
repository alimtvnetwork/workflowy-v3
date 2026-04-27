# Ambiguity #34 — G-31.7 canonical-head picking strategy

**Date:** 2026-04-27
**Task:** F-future-G31d — add G-31.7 canonical-heading normalisation sub-check

## The ambiguity

Each of the 4 G-31 scopes contains files using more than one related-section H2 variant (`## Related` vs `## Cross-References` vs `## See also`). The runner has historically accepted all three (in scope-priority order) for back-compat. F-future-G31d asks us to "pick one per scope" — but how?

Three options:

- **(A) Pick the dominant variant per scope** — observe the current distribution and crown the majority.
- **(B) Pick one canonical for the whole gate** (e.g. `## Related` everywhere) — uniform across all 4 scopes.
- **(C) Defer the decision and ship G-31.7 with no canonical declared** — only useful as scaffolding.

## Decision

Chose **Option A**. Rationale:

1. **Empirically grounded.** Surveyed all 4 scopes: workflows 11/12 use `## Related` (92 %), features 18/24 use `## Related` (75 %), endpoints 20/23 use `## Cross-References` (87 %), db-diagram 7/10 use `## Cross-References` (70 %). Two of the 4 scopes have a clear `## Related` majority; the other two have a clear `## Cross-References` majority. Forcing uniformity (B) would mean renaming ~27 files in two scopes — a much larger change with no semantic gain.

2. **Domain-appropriate vocabulary.** Workflow and feature pages cite *peer concepts* (truly related siblings → "Related" reads naturally). Endpoint and db-diagram pages cite *contracts the current page references* (more cross-cutting; "Cross-References" reads naturally). The current distribution reflects authors' instinctive vocabulary choice, not arbitrary drift.

3. **Smaller cleanup queue.** Option A surfaces only the 6 minority outliers (3 in features, 3 reduced from 6 because we counted `# See also` capitalisation variants too — only 3 actually drift). Option B would surface 24 files. Smaller queue = faster F-future-G31f drain.

4. **Permanent-WARN rationale.** Same as G-31.6 (islands): heading choice may legitimately vary for cross-domain pages (e.g. a feature page citing endpoints + DB schema may genuinely use `## Cross-References` rather than `## Related`). WARN + per-file exemption with rationale lets authors document the variance rather than the gate forcing uniformity.

## How to apply

- The 4 scope entries each declare `canonicalHead` matching their scope-majority.
- 4 new exemption Sets (`WORKFLOWS_HEAD_EXEMPT` / etc.) opt out individual files; each entry needs a one-line rationale (G-31.5 enforced).
- Reciprocity logic (`relatedHeads[]`) still accepts all variants for back-compat — G-31.7 is purely a prose-style advisory.

## Reversibility

If the project later adopts a single uniform heading, flip all 4 `canonicalHead` strings to the chosen variant and add the displaced files to `*_HEAD_EXEMPT` (or rename them in a sweep). The runner has no hidden state — `canonicalHead` is a per-scope field with no cross-scope coupling.
