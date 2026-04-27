# Ambiguity 12 — G-30.1 scope boundary

**Date:** 2026-04-27
**Task:** F14 — extend G-30 to feature-slices + workflows
**Status:** Resolved by decision

## Question

Once `02-workflows/` and `04-feature-slices.md` are in scope, should the
gate also scan the rest of `07-db-diagram/` (master ERD, migrations,
indexes), `01-features/`, and `05-conventions/`?

## Decision

**No — only `04-feature-slices.md` is added from `07-db-diagram/`.**

Rationale:

- The master ERD (`03-app-db-erd.md`), `06-indexes.md`, and `07-migrations.md`
  use prose references (e.g. "see AT-APP-58..67"), not citation density.
  G-30 was designed for files where ATs are first-class consumers.
- `01-features/*.md` files are themselves *declarers* via dispatch tables;
  treating them as consumers would create circular noise.
- `05-conventions/` files declare ATs (AT-MFA, AT-SSE-PHP, etc.) — same
  reason as features.

## Follow-up

If a future audit shows drift in any of those files, expand
`CONSUMER_SCOPES` and bump SSOT to v1.2.0. The runner is designed for
trivial scope addition (one entry per scope).
