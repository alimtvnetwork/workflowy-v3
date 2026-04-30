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

## Cross-Workspace Fan-Out Contract (resolves F-AUD42-16)

> **Problem.** Each workspace lives in its own SQLite file (`app-{WorkspaceId}.db`). FTS5 cannot index across attached DB files in a way that respects the split-DB no-JOIN invariant. A user with read access to N workspaces must still receive a single ranked result list.

### 1. Scope modes

| Mode | Trigger | DB scope | Behavior |
|------|---------|----------|----------|
| **Workspace-local** | default; `Scope` empty or set to an item in the active workspace | `[db-scope: app]` (single App DB) | Direct FTS5 query; no fan-out. |
| **Cross-workspace** | `Scope=*` query parameter (new; opt-in) OR caller is on a global search surface | `[db-scope: cross-db]` (Root DB → N App DBs) | Sequential fan-out per §2. |

`Scope=*` is the **only** way to trigger fan-out. Default search remains workspace-local for predictable latency.

### 2. Fan-out algorithm (sequential, no cross-DB JOIN)

1. **Resolve membership.** Query `root.workspace_members WHERE UserId = :caller AND Status = 'active'` → ordered list `Workspaces[]` (sorted by `LastAccessedAt DESC` for cache locality).
2. **Cap.** Hard cap at `MAX_FANOUT_WORKSPACES = 25`. If `len(Workspaces) > 25`, return `ERR_FANOUT_CAP_EXCEEDED` (409) with `Attributes.AccessibleWorkspaceCount`. Caller must narrow with `WorkspaceIds` filter (new optional CSV param, max 25 IDs).
3. **Per-workspace query.** For each `WorkspaceId`, open `app-{WorkspaceId}.db` read-only and run the workspace-local FTS5 query with the same `Q`, `Types`, `IncludeTrashed`. Each row is annotated with `WorkspaceId` + `WorkspaceName` (resolved from the membership row).
4. **No cross-DB transaction.** Each per-workspace query is its own connection; failure of one workspace does NOT abort the fan-out — that workspace's hits are omitted and surfaced in `Attributes.PartialFailures[]` with `{WorkspaceId, ErrorCode}`.
5. **Merge & rank.** Concatenate all per-workspace `Hits[]`, then re-rank globally using the same `Score = MatchKindScore × FieldWeight` formula (§Ranking above). Tie-break: `UpdatedAt DESC` then `WorkspaceId ASC` (deterministic).
6. **Pagination.** `Cursor` encodes `{WorkspaceId, ItemId, Score, UpdatedAt}` of the last returned hit. Subsequent pages re-run only the workspaces with remaining unread results (worker tracks per-workspace high-water mark).

### 3. Performance budgets (cross-workspace)

| Metric | Budget | Notes |
|--------|--------|-------|
| P95 total latency | ≤ 600 ms for ≤ 10 workspaces | Sequential; per-workspace budget 60 ms × 10 |
| P95 per-workspace | ≤ 150 ms | Same as workspace-local budget |
| Hard timeout | 1 200 ms total | Workspaces not yet queried at timeout → `Attributes.PartialFailures[].ErrorCode = 'ERR_FANOUT_TIMEOUT'` |

### 4. New errors

- `ERR_FANOUT_CAP_EXCEEDED` (409) — caller has > 25 accessible workspaces; must narrow.
- `ERR_FANOUT_TIMEOUT` (per-workspace, surfaced in `PartialFailures`) — that workspace was not queried in time; client may retry with `WorkspaceIds=[that one]`.

### 5. Gates

- `[gate: G-SEARCH-FANOUT-NO-CROSS-DB-JOIN]` — static analyzer MUST reject any SQL that opens > 1 App DB in a single transaction or uses `ATTACH DATABASE` to JOIN across them.
- `[gate: G-SEARCH-FANOUT-CAP]` — runtime check that fan-out never opens more than `MAX_FANOUT_WORKSPACES` connections per request.
- `[gate: G-SEARCH-FANOUT-MEMBERSHIP-FRESH]` — membership list MUST be re-read from `root.workspace_members` per request (no stale cache > 60 s).

### 6. AC refs

`AT-APP-103-FANOUT`, `AT-APP-104-FANOUT-CAP`, `AT-APP-105-FANOUT-PARTIAL`, `AT-APP-106-FANOUT-CURSOR`, `AT-APP-107-FANOUT-TIMEOUT`.

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
