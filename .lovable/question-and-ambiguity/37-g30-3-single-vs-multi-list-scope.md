# Ambiguity #37 — G-30.3 Meta: Single-Allowlist Scope vs Multi-List Generalization

**Logged:** 2026-04-27 (post-no-questions-mode; counter at 42+)
**Task:** F-future-G30-B — add G-30.3 rationale-coverage meta sub-check
**Decision taken:** Single-list scope (REDUNDANCY_ALLOWLIST only) with
trivially-extensible array (`G30_ALLOWLIST_NAMES = [...]`).

## The choice

When porting the G-31.5 algorithm into the G-30 runner, two design
choices presented themselves:

1. **Single-list scope** (CHOSEN) — name `REDUNDANCY_ALLOWLIST` directly
   in `G30_ALLOWLIST_NAMES = ["REDUNDANCY_ALLOWLIST"]`. Trivially
   extensible later by appending; minimal cognitive load right now.
2. **Multi-list pre-emptive generalization** — even though G-30 has only
   one allow-list today, structure the gate as if it had several
   (e.g., a future `CITATION_TYPO_EXEMPT` for legitimate AT-style
   strings that aren't ATs).

## Why single-list won

### G-31.5 has 12 lists; G-32.4 has 3; G-30 has 1

The mirror gates (G-31.5, G-32.4) earned their multi-list complexity
because each scope (workflows / features / endpoints / db-diagram) has
its own exemption Set. G-30 has no analogous scope-multiplication —
there's only one redundancy-judgement axis ("is this open prefix
needed?"), so one allow-list suffices.

### Pre-emptive generalization tends to misshape the API

If we'd structured G-30.3 as if it had multiple allow-lists today, we'd
either (a) invent a fake second list to populate the array, or
(b) leave the array singleton-but-look-like-array, which signals a
maintenance burden that doesn't exist. Both are noise.

### The array IS the extension point

`G30_ALLOWLIST_NAMES = ["REDUNDANCY_ALLOWLIST"]` is an array, not a
constant string. Adding a second list later is a one-character diff
(comma + new entry) — no algorithm change, no integration change. That
satisfies the open-closed principle without speculative complexity.

## Why not just inline the algorithm without an array at all?

Considered: hard-code `findUnrationaledG30Entries()` to scan only
`REDUNDANCY_ALLOWLIST` with no listName parameter. Rejected because:

- The G-31.5 / G-32.4 algorithm is a known-good pattern. Diverging from
  it (even slightly) creates three near-identical-but-different copies
  to maintain.
- The violation report needs to label which list each violation came
  from. With multiple lists possible (even if currently 1), the
  `[listName]` prefix in output is informative; without an array, that
  prefix becomes a constant and the diagnostic gets less useful when
  the gate inevitably grows.

## Aggregate-failure restructuring

Side-decision in v1.6.0: rewrote `main()` to collect G-30.1/2/3 failures
into a single `G-30 FAILED:` summary before exit 1, rather than the
previous early-exit-on-first-failure pattern.

Rationale: when CI fails, an operator wants to see ALL failing sub-checks
at once (so one fix-pass can address everything), not just the first one
that tripped. The aggregate pattern is what G-31 and G-32 already use.

## Verification

- Green (41 entries, all rationaled): exit 0 ✅
- Negative (`"AT-NORATIONALE-"` injected with no comment): exit 1, output
  shows `G-30.3: 1 unrationaled allow-list entry/entries` ✅
- Restored: exit 0 ✅
- Master runner: still exactly 6 pre-existing failures (no regression).
