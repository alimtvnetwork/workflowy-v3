# Endpoints — 15 Search

## Database Routing

**Read:** App DB (per-workspace; one SQLite file per workspace) — workspace-scoped FTS over `Items.Content` + `ItemTags`.
**Cross-workspace search:** fan-out across user's accessible App DBs (`WorkspaceMember` from Root DB → iterate App DBs sequentially). See F-AUD42-16 (open) for fan-out contract.
**Write:** none.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** `mem://features/search-functionality`

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-SEARCH-QUERY | GET | `search` | user | Hybrid relevance-then-recency search across owned + shared items |

---

## EP-SEARCH-QUERY — GET `search`

- **Auth**: `user`. Server filters results to items the caller can read (own + shared with read or higher).
- **Query**:
  - `Q` (string, required, 1–256 chars) — query text. Tokenised on whitespace + punctuation.
  - `Scope` (string, optional) — Item ID to constrain to a subtree. Default = entire workspace.
  - `Types` (csv, optional) — filter by `ItemType` (`bullet`, `board`, `dashboard`, `mirror`).
  - `IncludeTrashed` (boolean, optional, default `false`).
  - `Limit` (≤ 50, default 25), `Cursor`.
- **Success (200)** `Results`:
  ```json
  {
    "Hits": [
      {
        "Item": { /* Item */ },
        "Score": 0.873,
        "MatchKind": "title-exact" | "title-prefix" | "title-fuzzy" | "content-fts",
        "FieldWeight": 1.0,
        "Snippet": "…highlighted <mark>match</mark>…"
      }
    ],
    "NextCursor": "string?",
    "TookMs": 12
  }
  ```
- **Ranking** (per `mem://features/search-functionality`):
  1. `Score = MatchKindScore × FieldWeight` (tiered: title-exact > title-prefix > title-fuzzy > content-fts).
  2. **Tie-break** by `UpdatedAt DESC` — uses partial index `IdxItem_LiveByUpdatedAt`.
  3. Trashed items always rank below live items, even when `IncludeTrashed = true`.
- **Errors**: `ERR_QUERY_TOO_SHORT`, `ERR_QUERY_TOO_LONG`, `ERR_FORBIDDEN` (Scope unreadable), `ERR_LIMIT_EXCEEDED`.
- **Side effects**: none. Read-only against `Item` + FTS5 virtual table (see `03-app-indexes.sql` commented template).
- **Performance budget**: P95 ≤ 150 ms for workspaces ≤ 100k items.
- **AC refs**: `AT-APP-103`, `AT-APP-104`, `AT-APP-105`, `AT-APP-106`, `AT-APP-107`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Ranking algorithm | `mem://features/search-functionality` |
| FTS5 virtual table | [`../07-db-diagram/sql/03-app-indexes.sql`](../07-db-diagram/sql/03-app-indexes.sql) |
| Tie-break index | `IdxItem_LiveByUpdatedAt` (partial, `DeletedAt IS NULL`) |

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** search_index, nodes
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
