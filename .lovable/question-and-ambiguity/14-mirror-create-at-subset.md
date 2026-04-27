# Ambiguity 14 — Mirror-create AT subset selection

**Date:** 2026-04-27
**Task:** F16 — pin `09-mirror-create-flow.md`
**Status:** Resolved by decision

## Question

The `09b-mirror-peer-group-model.md` feature spec has 10 ATs (`AT-MGP-01..10`)
mapping to canonical `AT-APP-58..67`. F11's detach flow only cited a subset
(`AT-APP-60..65`). Which subset belongs to the *create* flow?

## Decision

Selected **5 ATs**: `AT-APP-58` (create-group), `AT-APP-59` (SSE fan-out
on edit, observable post-create), `AT-APP-62` (cycle prevention),
`AT-APP-66` (idempotency / migration replay), `AT-APP-67` (legacy table
410).

Rationale:
- `AT-APP-58, 59, 62` are unambiguously about creation.
- `AT-APP-60, 61, 63, 64, 65` are detach-side (already covered in F11).
- `AT-APP-66, 67` are migration-related but exercise the same write
  path (legacy → peer-group), so the create-flow contract is the
  natural sequence-pinning home for them. They could alternatively be
  placed in a future migration-execution flow (F17).

## Overlap with `AT-MIRRORS-*`

The pre-peer-group spec (`09-mirrors.md`) has 16 ATs (`AT-MIRRORS-01..16`)
that overlap conceptually. The flow file cites them in prose ("see
`AT-MIRRORS-08`", "per `AT-MIRRORS-15`") for human guidance; only the
canonical `AT-APP-NN` IDs appear in the Acceptance Tests table. This
preserves the v2.3.0 alias enumeration's invariant: short-prefix citations
are licensed but not the *primary* AT axis for new flow files.

## Future toggle

If F17 (migration-execution flow) materializes, `AT-APP-66, 67` may
migrate from this file's table to that one. The G-30 gate will catch the
move because consumer scopes are scanned uniformly.
