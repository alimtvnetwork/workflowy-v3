# 16 — Naming Bridge SSOT location

**Date:** 2026-04-27
**Task:** F18 — Reconcile ERD↔SQL naming bridge
**Mode:** No-questions (auto-resolved)

## Ambiguity

Three distinct doc clusters reference the `MirrorPeerGroup*` ↔ `MirrorGroup`/`MirrorMember` naming split:

1. **ERD docs** (`03-app-db-erd.md`, `06-indexes.md`) use `MirrorPeerGroup*` / `IdxMirrorPeerGroup*`.
2. **SQL DDL** (`sql/02-app-schema.sql`, `sql/03-app-indexes.sql`) uses `MirrorGroup` / `MirrorMember` / `IdxMirrorMember*`.
3. **Prose specs** (`04-feature-slices.md`, `07-migrations.md`, `02-workflows/08-mirror-detach-flow.md`, `02-workflows/09-mirror-create-flow.md`) use the SQL names.

The bridge table already existed in `sql/00-overview.md` v2.1.0 — but only covered **table names**, not columns/indexes, and ERD docs had no back-pointer.

Where should the SSOT live? Options:

- **A.** Promote to a top-level `07-db-diagram/08-naming-bridge.md` SSOT.
- **B.** Keep the bridge inside `sql/00-overview.md` (DDL-side) and add reverse pointers from ERD docs.
- **C.** Duplicate in each consumer file.

## Resolution — Option B

Kept the bridge inside `sql/00-overview.md` because:

- DDL is the **runtime ground truth**; the bridge resolves prose aliases → DDL identifiers, so it belongs with the DDL.
- Promoting to a sibling file would create **two entry points** (overview + bridge) and risk drift.
- C is forbidden — duplication breaks SSOT.

Extended `sql/00-overview.md` v2.1.0→v2.2.0 with:
- **Tables & columns subsection** — added 4 new column-level rows (PK, FK, Member PK).
- **Indexes subsection (NEW)** — 3 index alias rows.
- **Reverse pointers subsection (NEW)** — enumerates the 4 consumer files that point here.

Added matching one-line `## Naming bridge` footnotes to:
- `03-app-db-erd.md` v1.1.0→v1.2.0
- `06-indexes.md` v1.1.0→v1.2.0

`04-feature-slices.md` and `07-migrations.md` already had inline naming-bridge callouts (added in F13/F12); left unchanged — they already link to `sql/00-overview.md` §Naming Bridge.

## Future-proofing

If a third name pair appears (e.g. a future `Comment` ↔ `Comments` split), add it to the bridge table — do NOT add a new SSOT file.
