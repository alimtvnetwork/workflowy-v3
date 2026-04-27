---
task: F6 — endpoint contracts for B1–B4 addendums
date: 2026-04-27
status: inferred-and-proceeded
---

# Ambiguity: AT prefix for new endpoint matrix rows

## Context
Adding 5 new endpoints (Reaper×2, Search, Sync-Replay, Mirror-PeerGroup×2) to the endpoint↔AT matrix `16-endpoint-at-matrix.md`. The existing matrix uses per-feature AT prefixes (`AT-TRASH-`, `AT-MIRROR-`, etc.), but the 50 new ATs registered in task #2 all sit under the generic `AT-APP-` and `AT-MGP-` namespaces.

## Conflict
- Endpoint matrix style: feature-prefixed (`AT-TRASH-01`).
- Newly registered ATs: numeric continuation (`AT-APP-78..103`) + ad-hoc `AT-MGP-58..62`.

## Decision (inferred)
Used the AT IDs as registered in the canonical `97-acceptance-criteria.md` rather than minting new feature-prefixed duplicates. Rationale:
1. The canonical registry is the SSOT.
2. Duplicating the IDs under a new prefix would create a one-to-many map and violate the Naming-Bridge principle from task #3.
3. `AT-APP-` IDs already mix freely with feature-prefix IDs in earlier rows of the same matrix (e.g. `AT-APP-25`).

## What the user should review
Whether to retro-rename `AT-APP-78..81` → `AT-REAPER-01..04`, `AT-APP-90..94` → `AT-OFFLINE-01..05`, `AT-APP-100..103` → `AT-SEARCH-01..04` for matrix readability.
