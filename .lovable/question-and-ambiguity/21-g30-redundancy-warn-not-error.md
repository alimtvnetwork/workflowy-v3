# 21 — G-30.2 redundancy advisory: WARN vs ERROR design choice

**Loop:** 22 / 40 (F24)
**Date:** 2026-04-27
**Files touched:**
- `scripts/spec-hygiene/30-check-at-citation-validity.mjs` (v1.1.0 → v1.2.0)
- `spec/31-app/05-conventions/23-g30-at-citation-validity-gate.md` (v1.1.0 → v1.2.0)
- `spec/31-app/05-conventions/02-ci-quality-gates.md` (G-30 catalogue row)

## Question / decision point

After F15 + F20 closed 25 alias prefixes into explicit registration tables
(908 closed IDs), most surviving open-prefix declarations (`AT-FOO-NN`) are
technically dead — every citation under their prefix already has a closed
row. Survey via `/tmp/probe_g30.mjs` showed **41 / 41** open prefixes are
either zero-cited or 100% closed-covered.

Should the new G-30.2 sub-check:

- **(A) WARN-only** — print advisory list, never fail CI
- **(B) ERROR** — fail CI on redundant prefixes, force immediate cleanup

## Decision: **(A) WARN-only with allow-list**

Reasoning:

1. **Some closed coverage is provisional.** F3-poly will eventually merge
   addendum sections into parent SSOTs; some closed-table rows may be
   relocated. Failing CI on redundancy would incentivise re-adding open
   declarations defensively, undoing F15/F20's cleanup intent.
2. **5 prefixes are intentional future-licensing slots** (`AT-WORKFLOWS-`,
   `AT-ROADMAP-`, `AT-ENDPOINTS-`, `AT-DBDIAGRAM-`, `AT-FOO-`). An ERROR
   gate would need to hard-code these allow-list entries with no escape
   hatch. WARN naturally accommodates the queue.
3. **36 candidates is too many for one cleanup task.** A future F-series
   loop can drain the queue in batches; WARN keeps the surface visible
   without blocking other work.
4. **Activation is opt-in** (`--warn-redundant` flag or env var) — the
   default G-30 run is unchanged, preserving zero-noise CI for unrelated
   spec changes.

## Future promotion path

When F-series cleanup drains the queue to ≤5 candidates AND those 5 are
all in the allow-list, the master runner can pass `--warn-redundant` by
default. A future loop (e.g. F-future) can then promote G-30.2 to ERROR
mode. Logged as deferred work in this entry — not added to the active
remaining-tasks list to avoid premature scheduling.

## Status

✅ Closed in this loop. F24 done as v1.2.0 advisory; cleanup queue
documented in SSOT with sample output. No source files changed beyond
the gate itself + its catalogue row.
