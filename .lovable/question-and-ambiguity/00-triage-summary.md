# Ambiguity Triage Summary — 2026-04-27 (updated 2026-04-28)

> **2026-04-28 status update (P72):** All 3 soft-confirms are now **✅ Ratified by ADR-0024** — no longer "default-accept", reversal requires a superseding ADR:
> - **#01** (audit dimension scope) → `G-24-AUDIT-SCORE-FROZEN`
> - **#03** (DDL singular vs spec plural) → `G-24-DDL-SINGULAR-LOCKED` (triple-locked with ADR-0001 + ADR-0006)
> - **#17** (Favorites endpoint vs table) → `G-24-FAVORITES-TABLE-ONLY`
>
> P37 had promoted them into spec text; P72/ADR-0024 makes them load-bearing.
> The hard-confirm (#02, AT-MGP-/AT-MPG-) was previously resolved → `AT-MPG-`.


**Reviewer:** AI (mode-review pass following NO-QUESTIONS-MODE expiry)
**Source:** 48 numbered notes in `.lovable/question-and-ambiguity/` (memory previously said 35 — undercount; actual is 48 because some prefixes were reused: `20`, `23`, `29`, `32`, `35`, `42` each appear twice).

## Classification

| Class | Count | Action |
|---|--:|---|
| ✅ **Self-resolved** — inferred decision documented + sound + already shipped | 44 | None. Archive in place. |
| 🟡 **Soft-confirm** — chose conservative default; user could override but cost of inaction is low | 3 | Surface to user; default = accept. |
| 🔴 **Hard-confirm** — material naming/scope decision with broad blast radius if reversed | 1 | Surface to user explicitly. |

## 🔴 Hard-confirm queue (1)

### #02 — Acceptance-test prefix `AT-MGP-` vs `AT-MPG-`

- **Where:** `spec/31-app/01-features/09b-mirror-peer-group-model.md` v1.0.0
- **Inferred:** kept `AT-MGP-` (typo of "Mirror Peer Group" → "MGP")
- **Risk if wrong:** every downstream contract-map row, AT-table reference, and `06-endpoints/16-endpoint-at-matrix.md` row that cites `AT-MGP-NN` would need a global rename + v-bump. Currently 5 ATs × multiple call-sites ≈ 15 edits.
- **Recommended user action:** confirm `AT-MGP-` is fine OR say "rename to AT-MPG-" → I do the global pass.

## ✅ Ratified by ADR-0024 (formerly 🟡 Soft-confirm queue, 3)

> Per ADR-0024 §D4, the three entries below — originally classified as
> 🟡 Soft-confirm under the expired NO-QUESTIONS-MODE — are now load-bearing
> ratified decisions. Reversal requires a superseding ADR. Per-item 🟡
> markers below are retained for historical fidelity only; this banner
> and the ADR are authoritative.

### #01 — Audit 100/100 score: should B1–B4 addendums add a new dimension?

- **Inferred:** No — added a "Related spec-completeness work (post-100)" footnote; score untouched.
- **Cost of override:** 1 audit-file revision (recompute composite). Low.
- **Default:** accept inferred decision.

### #03 — DDL singular `Item`/`Title` vs spec plural `Items`/`Content`

- **Inferred:** Option A — DDL stays singular; spec aliases bridge the terms.
- **Cost of override:** Option B (rename DDL to plural + add `Title` virtual column) = touches every SQL file, every migration, every endpoint that names the table. **Large blast radius.**
- **Default:** accept inferred decision (Option A is cheaper and reversible).

### #17 — Favorites endpoint-vs-table contradiction

- **Inferred:** Added §4.12 Favorites slice; left the endpoint-overview line alone.
- **Cost of override:** Edit 1 sentence in `06-endpoints/03-layout-structure.md` to say "Favorites lives at table-level, no shell endpoint owns it." Trivial.
- **Default:** accept inferred decision; user can request the 1-line edit if the contradiction bothers them.

## ✅ Self-resolved (44)

The remaining 44 notes document architectural/CI-gate decisions with explicit
rationale and reversibility paths. Notable themes:

- **G-30 / G-31 / G-32 / G-34 / G-36 / G-37 gate design** (~25 notes) — every
  threshold, severity choice, and exemption-list policy was inferred from
  observed data and recorded with reversal instructions.
- **Spec-vs-DDL bridging** (~5 notes) — alias-table pattern adopted; canonical SSOT location decided.
- **Cross-reference asymmetries** (~6 notes) — case-by-case allow-list vs rename judgements; per-file rationale comments enforce the intent.
- **Drain audits** (~4 notes) — F-future-G31e and similar cleanup tasks audited prior auto-resolutions and corrected where shallow.
- **Naming / numbering migrations** (~4 notes) — file-rename collision resolutions recorded.

None of these 44 require user input; all are reversible by deleting the
corresponding allow-list entry or re-running the gate.

## Recommendation

1. **Resolve #02 only** as a hard ask (1 yes/no question).
2. Mark #01, #03, #17 as "default-accept unless objected".
3. Archive the folder in place — useful as a decision-log audit trail. Do
   **not** delete; the file-by-file rationale is invaluable for future
   maintainers.
4. Update `mem://constraints/no-questions-mode` to reflect actual count (48,
   not 35) and link this triage summary as the post-mortem.
