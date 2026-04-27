# 20 — Index drift: deprecated rows + implicit-index miscategorisation

**Date:** 2026-04-27
**Task:** F22 — Audit non-Mirror index-name drift
**Mode:** No-questions (auto-resolved)

## Findings

Bash-diffed `IdxXxx` identifiers between `sql/03-app-indexes.sql` and `06-indexes.md`:

- 24 indexes in DDL.
- 41 `Idx*` mentions in MD, of which:
  - 5 are **Root-DB indexes** (correctly in `sql/01-root-schema.sql`, not App DDL).
  - 4 are **rationale entries** in §"Indexes that are NOT needed" (`IdxItem_Content`, `IdxItem_CreatedAt`, `IdxComment_AuthorUserId`, plus the reversed `IdxItem_UpdatedAt`).
  - 6 are **partial substring matches** of Mirror bridge names.
  - **3 are real drift** — referenced columns/tables dropped by v2 migration M-117 but still listed under "Required Indexes":
    - `IdxItem_MirrorOfItemId` (column dropped)
    - `IdxMirror_SourceItemId` (table dropped)
    - `IdxMirror_MirrorItemId` (table dropped)
  - **1 is miscategorised** — `IdxUser_Email` listed as required index but is only an implicit `UNIQUE`-side-effect, no `CREATE INDEX` exists in `sql/01-root-schema.sql`.

## Auto-decisions

1. **Delete the 3 deprecated rows or move them to a "Deprecated" subsection?** → **Delete** + add a one-line v2-deprecation note above the table that references M-117. The rows are gone; readers who land on the diff via git history still get context. Keeping deprecated rows in a "live" required-indexes table risks future readers thinking they're current.

2. **`IdxUser_Email` — delete or move?** → **Move to a new §"Implicit Indexes"** subsection. SQLite *does* create a backing B-tree for `UNIQUE` columns (named `sqlite_autoindex_User_*`). Documenting that explicitly is more useful than deleting the row, because the underlying query ("login by email") still benefits. Same treatment may apply to other UNIQUE columns — but I limited the new section to `IdxUser_Email` specifically (the only previously-listed-as-required example) to keep F22 atomic.

3. **Touch the SQL DDL?** → **No.** F22 is a documentation-drift audit, not a DDL change. The DDL was already correct; only the MD documentation was stale.

4. **Bump `01-root-schema.sql` to add an explicit `CREATE INDEX IdxUser_Email`?** → **No.** Would create a duplicate of `sqlite_autoindex_User_*` for zero query benefit. The "Implicit Indexes" subsection makes the duplicated coverage explicit instead.

## Future tasks unblocked / created

- **F26** (new) — Audit other `UNIQUE` columns/constraints across both schemas and decide which deserve §"Implicit Indexes" rows. Candidates: `Tag.Name`, `Workspace.Slug`, etc. Out of scope for F22.
- **F22 verification** — G-29/G-30 still green (no AT changes; this is purely DDL-doc reconciliation).

## What was NOT changed

- `sql/01-root-schema.sql`, `sql/03-app-indexes.sql` — both already correct, untouched.
- `04-feature-slices.md` — slices reference the bridge-aliased Mirror index names; no stale references.
- `01-master-erd.md` — no inline index references.
