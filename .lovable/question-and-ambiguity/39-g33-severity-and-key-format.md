# Ambiguity #39 — G-33: Cross-Gate ERROR vs WARN; Composite-Key Format

**Date:** 2026-04-27
**Task:** F-future-G33 — Build cross-runner duplicate detector
**Mode:** No-questions (expired but batch continuing per user instruction)

## The decision points

Two design choices that would normally have prompted clarifying questions:

### A. Severity for cross-gate duplicates: ERROR vs WARN

**Chosen:** ERROR (exit 1) by default; opt-out via `CROSS_GATE_EXEMPT`.

**Alternatives considered:**

1. **WARN-only (advisory, exit 0).** Same precedent as G-31.6/G-31.7
   (island + heading drift). Justification would be: "judgement may
   legitimately vary; surfacing the smell is enough."
2. **Hybrid: ERROR with no allow-list.** Forces every collision to be
   resolved by deletion; no escape hatch. Highest signal but brittle.

**Rationale for ERROR + allow-list:**

- Unlike islands and heading drift, cross-gate duplication has a single
  unambiguous action: either delete one side or consolidate rationale.
  There's no "judgement spectrum" — the duplicate either *should* exist
  (rare; legitimate cross-cutting concern) or it shouldn't.
- The G-30.2 promotion (Ambiguity #36) and G-31.4/G-31.2 promotions
  established the pattern: every smell-detector earns ERROR mode once it
  reaches 0 violations and the allow-list is small. G-33's initial state
  is already 0 violations, so ERROR is appropriate from day one.
- Allow-list with composite key + rationale comment preserves the
  meta-gate guarantee (G-30.3 / G-31.5 / G-32.4) that opt-outs are
  documented.

### B. Allow-list composite key format

**Chosen:** `"<value>::<sorted-gate-1>::<sorted-gate-2>[::<gate-N>]"`
with gates sorted alphabetically.

**Alternatives considered:**

1. **Bare value** (`"AT-FOO-"`). Simplest, but loses the gate-set
   context — adding `"AT-FOO-"` would suppress duplicate detection
   forever, even if a 4th gate later starts using it.
2. **List-name composite** (`"AT-FOO-::REDUNDANCY_ALLOWLIST::COVERAGE_EXEMPT"`).
   Most precise, but brittle: renaming a list (e.g., when consolidating
   G-31's *_EXEMPT siblings) would silently invalidate the exemption.
3. **Gate-set composite (chosen).** Stable across list renames within a
   gate; tightens scope so adding a new gate triggers re-review.

**Sorting:** alphabetical so the same conceptual exemption produces a
canonical key regardless of the order memberships are discovered. The
runner sorts internally before lookup.

## Impact

If the user later prefers WARN-only or a different key format:

- **Switch to WARN:** change `process.exit(1)` to `process.exit(0)` in
  the active-errors block; relabel ❌ → ⚠️.
- **Switch key format:** alter the `exemptKey` construction in `main()`
  and migrate any existing `CROSS_GATE_EXEMPT` entries (initially empty,
  so cost is zero today).

## Status

Resolved by AI default. Logged for user review per no-questions-mode
expired-batch protocol.
