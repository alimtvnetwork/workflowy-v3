# 23 — Fabricated soft-delete columns (`DetachedAt`, `DissolvedAt`) in ERD + indexes doc

**Loop:** 24 / 40 (F26)
**Date:** 2026-04-27
**Files touched:**
- `spec/31-app/07-db-diagram/03-app-db-erd.md` (v1.2.0 → v1.3.0)
- `spec/31-app/07-db-diagram/06-indexes.md` (v1.3.0 → v1.4.0)
- `spec/31-app/07-db-diagram/sql/00-overview.md` (v2.2.0; naming-bridge row corrected)

## Audit method

Built `/tmp/audit_unique.mjs` to enumerate every `UNIQUE` declaration
across `01-root-schema.sql` + `02-app-schema.sql` (column-level, table-level
constraint, and explicit `CREATE UNIQUE INDEX`) and check whether each was
documented in `06-indexes.md`. Initial result: **3 of 13 declarations
documented** (the 10 misses were either lookup-table enum UNIQUE columns or
real bugs).

## Findings

### Critical (DDL ↔ doc drift)

1. **`DetachedAt` is a fabricated column** that does not exist in DDL.
   - `06-indexes.md` line 110 (v1.3.0) claimed `IdxMirrorPeerGroupMember_ItemId`
     was `UNIQUE partial WHERE DetachedAt IS NULL`.
   - `03-app-db-erd.md` line 174 listed `TEXT DetachedAt "NULL = still a peer"`
     as a column on `MirrorPeerGroupMember`.
   - `sql/00-overview.md` line 33 naming-bridge row repeated the partial-WHERE
     claim.
   - **DDL ground truth** (`02-app-schema.sql:85` + `03-app-indexes.sql:38`):
     `UNIQUE (ItemId)` and `CREATE UNIQUE INDEX IdxMirrorMember_ItemId ON
     MirrorMember (ItemId)` — full-table UNIQUE, no `WHERE` clause, no
     `DetachedAt` column.
   - **Workflow ground truth** (`02-workflows/08-mirror-detach-flow.md` step 3c):
     detach is `DELETE FROM MirrorMember WHERE …` (row delete), not
     `UPDATE MirrorMember SET DetachedAt = now`.

2. **`DissolvedAt` is a fabricated column** on `MirrorPeerGroup`.
   - `03-app-db-erd.md` line 166 (v1.2.0) listed `TEXT DissolvedAt
     "NULL = active; set on singleton dissolution"`.
   - **DDL ground truth** (`02-app-schema.sql:66-71`): `MirrorGroup` has no
     `DissolvedAt` column; dissolve is performed by row DELETE via the
     auto-dissolve trigger (`04-app-triggers.sql`, referenced by
     `02-app-schema.sql:75`).

3. **`IdxUserRole_User_Role` undocumented**: explicitly created in
   `01-root-schema.sql:97` but never appeared in `06-indexes.md` Root DB
   table.

### Documentation gaps (legitimate, not bugs)

4–9. Six lookup/enum UNIQUE side-effect indexes never enumerated:
   `WorkspaceRoleType.Name`, `RoleType.Name`, `Workspace.AppDbPath`,
   `ItemType.Name`, `ShareRoleType.Name`, `MirrorMember(MirrorGroupId,ItemId)`
   composite, `Tag(OwnerUserId,Name)`, `Favorite(UserId,ItemId)`.

## Resolution

- **ERD v1.3.0**: deleted `DetachedAt` and `DissolvedAt` rows from the two
  affected entities. Added `CanonicalItemId` FK to `MirrorPeerGroup` (was
  also missing — present in DDL line 68).
- **`06-indexes.md` v1.4.0**:
  - Corrected `IdxMirrorPeerGroupMember_ItemId` row to "UNIQUE (full-table)"
    with explicit cross-ref to `02-workflows/08-mirror-detach-flow.md` step 3c
    explaining why a soft-detach column would be redundant.
  - Added `IdxUserRole_User_Role` row to Root DB table.
  - Expanded §Implicit Indexes from 1 entry to 9 (split into Root DB + App DB
    sub-tables); each entry cites its source line in DDL.
- **`sql/00-overview.md`**: corrected naming-bridge row 33 to read
  "UNIQUE (full-table)" and removed the `WHERE DetachedAt IS NULL` claim.

## Why this drifted

The fabricated `DetachedAt`/`DissolvedAt` columns appear to date from the
v2.0.0 mirror-peer-group introduction (B1 work). At spec-design time the
team likely considered a soft-delete pattern, then chose row-DELETE +
auto-dissolve trigger as the implementation. The DDL was updated; the ERD
+ index doc + naming bridge were not. F22 caught the M-117-removed legacy
indexes but did not check for *fabricated* columns referenced by surviving
indexes. F26 closes that residual gap.

## Future-proofing

A future gate (potentially **G-31** — DDL↔doc drift) could parse all
`Idx*` rows in `06-indexes.md` and `*` columns in `03-app-db-erd.md`
mermaid blocks, then assert each column/predicate appears in the SQL DDL.
Logged as deferred — not promoted to active queue (4-table audit was
fast; full G-31 would require a mermaid parser).

## Status

✅ Closed in this loop. G-29 + G-30 still ✅ green. Audit script result:
13/13 UNIQUE declarations now documented (was 3/13).
