---
task: F7 — ERD diagram refresh for B1–B4
date: 2026-04-27
status: inferred-and-proceeded
---

# Ambiguity: deprecate `Mirror` table or migrate immediately?

## Context
Updating `03-app-db-erd.md` to add the new `MirrorPeerGroup` + `MirrorPeerGroupMember` entities (per `mem://features/mirroring` — bidirectional peer groups, not source/copy pairs).

## Conflict
- The legacy `Mirror` table + `Item.MirrorOfItemId` FK still exist in `02-app-schema.sql` and 4+ endpoints (`EP-MIRRORS-CREATE`, `EP-MIRRORS-LIST`, `EP-MIRRORS-DELETE`, plus index `IdxMirror_SourceItemId`).
- New B1 endpoints (`EP-MIRRORS-GROUP-GET`, `EP-MIRRORS-DETACH`) operate on `MirrorPeerGroup`.
- Two parallel models in the same DB is a smell.

## Decision (inferred)
1. Added `MirrorPeerGroup` + `MirrorPeerGroupMember` to the ERD as the new ground truth.
2. Marked `Mirror` as **DEPRECATED** in the ERD relationship label, but kept the entity rendered for backwards compatibility during the transition.
3. Added a "Migration note" inline that defers the actual table drop + backfill to a future migration in `07-migrations.md` (planned).
4. Did NOT touch `02-app-schema.sql` to drop the `Mirror` table — that's a destructive change that warrants explicit user approval before executing in a real migration.

## What the user should review
- Whether to immediately schedule the `Mirror → MirrorPeerGroup` migration or leave both models coexisting until the React frontend is rewired.
- Whether `EP-MIRRORS-CREATE` should be redefined to write directly to `MirrorPeerGroup` (creating a 2-member group on first call), making the legacy `Mirror` table write-only-by-migration.
