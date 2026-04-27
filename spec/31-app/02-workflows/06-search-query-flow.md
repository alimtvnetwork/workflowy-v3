# Search Query Flow

> **Version:** 1.0.0
> **Created:** 2026-04-27 (UTC+8) — F11 (No-Questions Mode)
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/16-search-ranking.md`](../01-features/16-search-ranking.md)
> **Endpoint contract:** [`spec/31-app/06-endpoints/15-search.md`](../06-endpoints/15-search.md)

---

## Why this file exists

`01-features/16-search-ranking.md` describes the 5-tier match-kind score × field-weight formula. `01-features/15-roles-and-permissions.md` describes `Auth::hasRole()`. Neither file describes the **end-to-end query sequence** of "user types → debounced request → permission filter → tier scoring → tie-break by `UpdatedAt` → result paging". Without this flow, AI implementers either (a) leak items the user has no permission to see, or (b) collapse hybrid relevance+recency into pure recency and fail AT-APP-103.

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| User | Types into NavBar search input. |
| Client (React) | Debounces 250 ms, sends `GET /api/search?q={query}&limit=50&cursor=...`. |
| WP REST handler (PHP) | Authorizes, builds permission-filtered SQL, scores, paginates. |
| App DB (workspace) | Owns `Items`; serves the candidate set. |
| FTS5 index (optional) | Accelerates substring/token tiers when present (commented template in `03-app-indexes.sql`). |
| Permission resolver | `Auth::hasRole($userId, 'View', 'Item', $itemId)` per item or precomputed visibility set. |

---

## Preconditions

- `Auth::isAuthenticated($userId)` returns true (anonymous users get 401).
- `q.length >= 2` (single-char queries return 400).
- `q.length <= 256` (longer queries return 400 to bound regex cost).
- The user has at least one `View`-grant on at least one item in the workspace; otherwise the result set is empty (200 with `items: []`).

---

## Sequence

```
1. User types "design" → 250 ms debounce → client emits
   GET /api/search?q=design&limit=50&cursor=null
2. PHP handler:
     a. Auth::isAuthenticated($userId) → 401 if not.
     b. Validate q (length 2..256). Else 400.
     c. visibilitySet = Auth::resolveViewableItemIds($userId, $workspaceId).
        (One precomputed set for the request; avoids per-row hasRole calls.)
        If visibilitySet is empty → return { items: [], nextCursor: null } (200).
     d. Build candidate set with permission filter applied AT THE DB LEVEL:
          SELECT ItemId, Title, Note, ParentId, UpdatedAt
            FROM Items
           WHERE WorkspaceId = $workspaceId
             AND DeletedAt IS NULL                      -- AT-APP-106
             AND ItemId = ANY($visibilitySet)           -- AT-APP-107
             AND (
               Title  ILIKE '%' || $q || '%'
               OR Note ILIKE '%' || $q || '%'
             )
           LIMIT 500.   -- pre-rank ceiling; tighter than the user-facing limit
     e. For each candidate row, compute score:
          tierTitle = matchKindTier($q, row.Title);   -- 100/90/80/70/60 per AT-APP-103
          tierNote  = matchKindTier($q, row.Note);
          score = max(
            tierTitle * 1.0,    -- title field weight
            tierNote  * 0.4     -- note field weight    -- AT-APP-105
          ).
        matchKindTier rules:
          exact whole field          → 100
          starts-with prefix         → 90
          contained substring        → 80
          token-aligned (word break) → 70
          fuzzy (≤2 char distance)   → 60
          no match                   → 0  (filter out)
     f. Sort by score DESC, then by UpdatedAt DESC (AT-APP-104 tie-break).
     g. Page: take ($cursor.offset, $cursor.offset + limit].
        nextCursor = (offset + limit) if remaining else null.
3. Response:
     200 { items: [{ itemId, title, score, parentId, updatedAt }, ...],
           nextCursor }
4. Client renders results; clicking a result navigates to its zoom view.
```

> **Why DB-level permission filter:** Per-row `Auth::hasRole()` calls would be O(N) extra queries. `Auth::resolveViewableItemIds()` returns one set up-front; the `ItemId = ANY(...)` clause is a single index lookup. AT-APP-107 mandates the filter applies *before* scoring, not after — otherwise pagination cursors would be invalid for users with different permissions.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 401 — not authenticated | 401 | Client redirects to login. |
| 400 — query length out of range | 400 | UI shows inline "Type at least 2 characters". |
| 403 — workspace not accessible | 403 | (Should not occur if upstream auth is correct.) |
| 500 — DB or FTS index error | 500 | Client falls back to unscored title-only `ILIKE` query against local mirror per `14b-offline-queue.md`. |
| Visibility set empty | 200 + `[]` | UI shows "No matches" — distinguishable from "search broken". |
| Pagination cursor invalid (visibility changed) | 200 + reset | Client discards cursor and re-queries from offset 0. |

---

## Idempotency

`GET` is naturally idempotent. Successive identical queries return identical results (modulo `Items.UpdatedAt` ticks from concurrent edits). No `X-WorkFlowy-Idempotency-Key` applies; HTTP caching headers (`Cache-Control: private, max-age=5`) bound staleness.

---

## Forbidden in implementations

- ❌ Resolving permissions per row (calling `Auth::hasRole()` inside the result loop). Use the precomputed visibility set.
- ❌ Sorting by `UpdatedAt DESC` only (drops relevance tier — fails AT-APP-103).
- ❌ Sorting by score only without the `UpdatedAt` tie-break (non-deterministic order — fails AT-APP-104).
- ❌ Including soft-deleted rows (fails AT-APP-106). The `DeletedAt IS NULL` filter MUST be in the WHERE clause, not applied post-fetch.
- ❌ Returning items the user lacks `View` permission on (fails AT-APP-107). The `ItemId = ANY($visibilitySet)` clause MUST be in the WHERE clause.
- ❌ Computing `matchKindTier` without the field-weight multiplier (collapses 5 tiers × 2 fields into 5 tiers — fails AT-APP-105).
- ❌ Using offset pagination on the unfiltered set then applying the visibility filter (produces page-size jitter and missing items).

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-SEARCH-01` | `AT-APP-103` | This flow | Query matches title (exact whole field) and another item by token | Exact-field result scores 100×1.0=100; token result scores 70×1.0=70 |
| `AT-WF-SEARCH-02` | `AT-APP-104` | This flow | Two results in same tier, different `UpdatedAt` | Newer `UpdatedAt` ranks first |
| `AT-WF-SEARCH-03` | `AT-APP-105` | This flow | Query matches Title of A and Note of B | A (100×1.0=100) ranks above B (100×0.4=40) |
| `AT-WF-SEARCH-04` | `AT-APP-106` | This flow | Query matches title of soft-deleted item | Result excluded; `DeletedAt IS NOT NULL` filter applied |
| `AT-WF-SEARCH-05` | `AT-APP-107` | This flow | Query matches title of item user lacks `View` on | Result excluded; visibility filter applied at DB level |

> ✅ **Canonical-mapped:** each `AT-WF-SEARCH-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative.

---

## Related

- [`07-sync-replay-flow.md`](./07-sync-replay-flow.md) — search runs against the local mirror when offline (per `14b-offline-queue.md`)
- [`05-trash-reaper-flow.md`](./05-trash-reaper-flow.md) — reaper removes rows; search excludes `DeletedAt IS NOT NULL` independently
- [`../01-features/16-search-ranking.md`](../01-features/16-search-ranking.md) — feature-level SSOT
- [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) — `Auth::hasRole()` and `resolveViewableItemIds()` contract
- [`../06-endpoints/15-search.md`](../06-endpoints/15-search.md) — endpoint contract (EP-SEARCH-QUERY)
- [`../07-db-diagram/sql/03-app-indexes.sql`](../07-db-diagram/sql/03-app-indexes.sql) — `IdxItem_LiveByUpdatedAt` partial index for tie-breaks; commented FTS5 template
