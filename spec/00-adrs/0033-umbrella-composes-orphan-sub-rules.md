# ADR-0033: Umbrella Gates Compose Orphan Sub-Rule Tokens

## Status

`Accepted` — 2026-04-30

## Context

`scripts/spec-hygiene/76-check-orphan-gate-ids.mjs` (introduced by F-SCOPE-41 closure) surfaced **63 cited-but-unregistered `G-…` sub-rule tokens** across 12 corpus-proven umbrella chains (e.g. `G-15` umbrella → `G-15-ITEMTYPE-CANONICAL-ORDER`; `G-25-SSE` umbrella → `G-25-SSE-AUTH`; `G-UPD-ANTIPATTERNS-FORBIDDEN` umbrella → 6 `G-17-*` leaves). These tokens appear in ADR `97-acceptance-criteria.md` files and overview prose as enumerated sub-rules of an already-registered umbrella, but were never authored as standalone registry rows. The runner currently allow-lists 18 of them by hard-coded `ALLOWED` set; the remaining 63 hold the runner in WARN-only mode (graduation criterion: drift ≤ 5).

Two remediation paths exist: (a) **enumerate** every sub-rule as its own row (≈63 row-adds across 12 batches; high churn, fragile), or (b) **declare** that an umbrella registration auto-covers any token matching `{umbrella}-{leaf}` shape (zero churn, structural). F-SCOPE-44 and F-SCOPE-50 explicitly defer to this ADR for the choice. Audit findings F-SCOPE-41/44/50 all converge on path (b) as the scalable answer.

## Decision

**Umbrella gates MUST automatically cover their composing sub-rule tokens.**

A registered gate `G-{NS}-{UMBRELLA}` (where `{UMBRELLA}` is non-empty and the row's `Description` column contains the literal substring `(Umbrella)` or `umbrella`) implicitly registers every cited token matching the regex `^G-{NS}-{UMBRELLA}-[A-Z0-9-]+$` as covered. The runner `76-check-orphan-gate-ids.mjs` MUST treat such tokens as registered (not allow-listed) when an umbrella row exists.

Bare-namespace umbrellas (`G-{NS}` with no leaf, e.g. `G-15`, `G-25-SSE`) MUST cover any cited `G-{NS}-*` or `G-{NS}-SSE-*` leaf token under the same rule.

Authors MUST mark a gate row as an umbrella by including `(Umbrella)` in the Description cell when the gate composes ≥2 enumerated sub-rules in its anchor source. The umbrella row's Description MUST list each composed leaf inline (already current convention per `G-UPD-ANTIPATTERNS-FORBIDDEN`).

Authors MUST NOT use this rule to silence genuine missing gates: a leaf token whose rule is **not** described in the umbrella's anchor source remains an orphan and MUST be authored as its own row.

**Same-number umbrella disambiguation (added 2026-04-30 per F-AUDIT-39).** When a `G-{NN}` numeric prefix is reserved by ≥2 distinct registries (e.g. `G-24` reserved by both `spec/00-adrs/0024-…` AND `spec/31-app/05-conventions/02-ci-quality-gates.md`), every umbrella row sharing that number MUST disambiguate via a `family=` qualifier in the `(Umbrella)` marker — e.g. `(Umbrella, family=adr-ratification)` vs `(Umbrella, family=convention-drift)`. The runner MUST scope leaf coverage to the umbrella whose `family=` matches the leaf's anchor file path (path prefix `spec/00-adrs/` → `family=adr-…`; path prefix `spec/31-app/05-conventions/` → `family=convention-drift`; etc.). Leaf names within a `(family=X)` cluster MUST NOT collide with leaf names in a sibling `(family=Y)` cluster sharing the same `G-{NN}` prefix; collisions MUST be resolved by renaming the newer leaf with a family-suffix (e.g. `G-24-PRIVILEGE-MUTATION-GATED-DRIFT` when bound after an existing `G-24-PRIVILEGE-MUTATION-GATED` already lives under `family=adr-ratification`). Authors MUST run the F-AUDIT-34 5-step cross-walk against BOTH families before binding any new `G-{NN}-*` leaf when `G-{NN}` is double-reserved.

## Consequences

**Positive**

- Eliminates 63-token allow-list backlog without 12 churn batches.
- Scales to future ADRs: any new umbrella authored with `(Umbrella)` marker auto-covers its leaves.
- Preserves single source of truth — leaves remain documented inline in the umbrella's anchor source rather than fragmented across registry rows.
- Unblocks `G-00-ORPHAN-GATE-ID-DRIFT` graduation from WARN-only → CI enforcement.
- Aligns with F-AUDIT-34 anti-recurrence methodology: per-umbrella grep already covers leaf citations.
- Affects [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) authoring conventions and [`spec/_GATE-GRADUATION-LEDGER.md`](../_GATE-GRADUATION-LEDGER.md) row 9 (`G-00-ORPHAN-GATE-ID-DRIFT`).

**Negative**

- Runner complexity: `76-check-orphan-gate-ids.mjs` must parse the `Description` column for the `(Umbrella)` marker and match leaf tokens by regex (≈30 LOC delta).
- Risk of accidental coverage: an author marking a non-composing gate `(Umbrella)` could silence real orphans. Mitigated by the explicit "leaves must be described in anchor source" rule + future `G-00-UMBRELLA-LEAVES-DESCRIBED` lint.
- Existing 18-token hard-coded `ALLOWED` set must be re-classified: tokens whose umbrella now covers them are removed from `ALLOWED`; only true exceptions (test fixtures, deprecated bare-numeric, baseline-ledger names) remain.

## Alternatives Considered

1. **Enumerate all 63 leaves as standalone registry rows** — rejected: ≈12 batches of pure churn with zero new enforcement value; leaves are already documented in their umbrella's anchor source; doubles the registry size for no semantic gain.
2. **Permanently expand the hard-coded `ALLOWED` set to include all 63** — rejected: turns the runner into a static allow-list rather than a structural check; new umbrellas would re-introduce the silent-gap class on every batch.
3. **Drop the orphan check entirely** — rejected: F-SCOPE-40 proved the silent-gap class is real (load-bearing tokens with no registry anchor); removing the check loses an audit invariant.

## Gates Touched

- **New gates:** `G-00-UMBRELLA-COMPOSES-LEAVES` (DOC-NORM, this ADR §Decision) — umbrella rows MUST contain `(Umbrella)` marker AND inline leaf enumeration; `G-00-UMBRELLA-LEAVES-DESCRIBED` (DOC-NORM, deferred to **NEW-13-FOLLOWUP**) — every leaf token covered by an umbrella MUST appear by name in the umbrella's anchor source.
- **Modified gates:** `G-00-ORPHAN-GATE-ID-DRIFT` (extend runner to honor umbrella coverage; WARN-only graduation criterion bumped from "drift ≤ 5" to "drift = 0" once runner ships).
- **Endpoints locked:** `(none)`
- **DDL identifiers locked:** `(none)`

## Supersedes / Superseded-By

- **Supersedes:** `(none)`
- **Superseded-By:** `(none)`
