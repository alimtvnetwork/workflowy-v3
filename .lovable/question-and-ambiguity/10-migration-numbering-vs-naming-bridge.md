# Ambiguity 10 — Migration slot M-115..M-118 picks SQL names, not ERD names

**Date:** 2026-04-27
**Task:** F12 — v1→v2 Mirror Peer-Group migration plan
**Mode:** No-Questions (auto-decided)

## Context

The v1→v2 migration involves tables that have **two valid names** in the spec:

| Surface | Mirror group table | Member table |
|---------|--------------------|--------------|
| ERD (`03-app-db-erd.md`, `06-indexes.md`) | `MirrorPeerGroup` | `MirrorPeerGroupMember` |
| SQL (`02-app-schema.sql`, `07-migration-v2-mirror-peer-groups.sql`) | `MirrorGroup` | `MirrorMember` |

This drift was previously logged as Ambiguity #03 (DDL Naming Bridge) and is documented in `sql/00-overview.md` §Naming Bridge.

## Decision

In `07-migrations.md` §Allocated Migration Slots, I used the **SQL names** (`MirrorGroup` / `MirrorMember`) because:

1. The `M-NNN` slots correspond directly to **executable SQL files**, not ERD entities.
2. The slot table links to the SQL file — the names must match what the reader sees when they open the link.
3. A reader checking "what does M-115 do?" should not have to mentally rename the entity.

A footnote points back to the Naming Bridge so ERD readers aren't confused.

## Future cleanup

When the spec consolidates on one name (likely SQL names, since they ship in code), the ERD files will need a v1.2.0 bump to rename. That's tracked separately and is **not** in scope for the 40-task budget.
