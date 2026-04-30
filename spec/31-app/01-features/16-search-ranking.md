# Search Ranking

> **API Contract:** See [`spec/31-app/06-endpoints/15b-search.md`](../06-endpoints/15b-search.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Companion:** `mem://features/search-functionality` (syntax + perf)


## Database Routing

| Database | Tables read/written | Notes |
|---|---|---|
| **Root DB** | `WorkspaceMember` | Determine accessible workspaces for search fan-out. |
| **App DB** (per workspace) | FTS index over `Items.Content` + `ItemTags`; ranking inputs (`UpdatedAt`, `Favorite`) | Search executes against each accessible App DB sequentially. |
| **Cross-DB joins** | **Forbidden.** | Result merging happens application-side; see F-AUD42-16. |

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-02** (App-folder audit Phase 4). Mirrors the Root-DB / App-DB split per ADR-0019.

---

## Overview

Search results are ranked using a **hybrid relevance-then-recency**
strategy: results are first bucketed by a relevance score, then each
bucket is sorted by `Items.UpdatedAt` descending. This balances
"the obviously correct match" with "the most recently touched note"
without requiring a full BM25 implementation in MVP.

## User Story

As someone searching across thousands of items, I want the most relevant
match to appear first, with ties broken by what I most recently edited,
so that I find what I'm looking for in one glance.

---

## 16.1 Ranking Algorithm

For each item that satisfies the query (after `#tag`, `is:`, `type:`,
`date:` filters from `mem://features/search-functionality` are applied):

```
Score = max field-score across { Content, Note }

Field score by match kind (highest wins):
  Exact phrase, whole field    → 100
  Exact phrase, substring      →  80
  All terms present, in order  →  60
  All terms present, any order →  40
  Some terms present (≥1)      →  20

Field weight multiplier:
  Content match  × 1.5
  Note match     × 1.0
```

Items are then **bucketed** by `floor(Score / 20)` and within each
bucket sorted by `UpdatedAt` descending. Final list is the
concatenation of buckets from highest to lowest.

## 16.2 Decisions at a Glance

| Concern | Decision |
|---------|----------|
| Strategy | **Hybrid: relevance then recency** |
| Relevance signal | Match-kind tier × field weight (no full BM25 in MVP) |
| Recency signal | `Items.UpdatedAt` descending within each relevance bucket |
| Bucket size | 20 score points (5 buckets total: 0–19, 20–39, 40–59, 60–79, 80–100) |
| Tiebreak inside bucket | `UpdatedAt` desc, then `OwnerId` asc (deterministic) |
| Mirror handling | Each peer-group instance ranks independently — searching surfaces the instance whose breadcrumb path matches the user's mental location. |
| Trash / completed | Excluded by default; included only when query has `is:trashed` / `is:complete`. |

## 16.3 Invariants

- **I-SR-01** Ranking is deterministic — same query + same DB snapshot always yields identical order.
- **I-SR-02** Recency never beats relevance across buckets — a relevance-100 item from last year ranks above a relevance-20 item edited 5 s ago.
- **I-SR-03** Recency always wins inside a bucket — no secondary lexical sort.
- **I-SR-04** The 250-item viewport cap (L4) applies; result count beyond 250 is reported but not rendered.

## 16.4 Edge Cases

| Case | Behavior |
|------|----------|
| Query matches title exactly + 100 notes substring | Title-exact item ranks first (score 150) regardless of recency. |
| Two items with identical scores | Sorted by `UpdatedAt` desc; further tied → `OwnerId` asc. |
| Mirror peer-group with 5 instances all matching | All 5 returned; each ranked independently; user picks the instance with the relevant breadcrumb. |
| Empty query | No results (do NOT fall back to "all items by recency"). |
| Filter-only query (`is:todo` with no terms) | Score = 60 for all matches (all-terms-present bucket); sort by recency. |

## Acceptance Criteria

- **AT-SR-01** Title-exact match outranks note-substring match regardless of recency.
- **AT-SR-02** Within the same score bucket, more recently updated items appear first.
- **AT-SR-03** Mirror instances appear individually with their own breadcrumbs.
- **AT-SR-04** Trashed and completed items are excluded unless the query opts them in.
- **AT-SR-05** Sub-300 ms response time for ≥5 000-item datasets is preserved (perf SLA from `mem://features/search-functionality`).

---

## Workflowy Feature Reference (F2) — Search Surface & Operators

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim. Ranking semantics (relevance-then-recency, tiered match × field weight) remain governed by `mem://features/search-functionality` and the AT-SR-* table above.

### Surface

- **Search** — Global text search across the user's entire tree. Triggered by ⌘K or the sidebar / navbar Search button; results render in `search-overlay` → `search-results` (see [`./05-interactions.md`](./05-interactions.md) AT-INTERACT-10..13).
- **Recent Items** — When the search overlay opens with an empty query, it shows the most recently visited items in `search-recent` (AT-INTERACT-13).
- **Nested Search** — Re-running a search **inside the current zoom** restricts the result set to descendants of the active page root. Driven by the `>` operator below or implicit when the overlay is opened while zoomed.

### Operators

The following operators are reproduced verbatim from the Workflowy spec. Each is a literal substring the user types in the search box; combine with whitespace (implicit AND) and `OR`.

| Operator | Meaning | Example |
|---|---|---|
| `is:<itemType>` | Filter by `ItemType` (`bullet`, `todo`, `h1`, `h2`, `paragraph`, `numbered`, `code`, `quote`, `divider`, `board`, `dashboard`, `mirror`). | `is:todo refactor` |
| `is:complete` / `is:incomplete` | Filter by To-do completion state. | `is:incomplete invoice` |
| `is:shared` | Items the user has shared (public or invited). | `is:shared` |
| `is:starred` | Items pinned to the sidebar Starred group. | `is:starred` |
| `has:note` | Items with an attached note block. | `has:note design` |
| `has:date` | Items containing a date chip. | `has:date next-week` |
| `has:tag` | Items containing at least one `#tag` or `@tag`. | `has:tag #ops` |
| `has:image` / `has:file` | Items with image or file attachments. | `has:image` |
| `has:link` | Items containing an inline link. | `has:link` |
| `text:"…"` | Exact phrase match (whitespace-significant). | `text:"quarterly review"` |
| `highlight:<color>` | Items containing text marked with the given highlight colour. | `highlight:yellow` |
| `-<term>` | Exclude items matching `<term>` (NOT). | `meeting -cancelled` |
| `OR` | Logical OR between adjacent terms. | `todo OR bug` |
| `>` | Restrict search to descendants of the current zoom (Nested Search). | `> is:todo` |
| `#tag` / `@mention` | Tag literal — matches items containing the exact tag token. | `#blocker` |
| date keywords (`today`, `yesterday`, `this-week`, `last-week`, `next-week`, `MM/DD/YYYY`, `YYYY-MM-DD`) | Match date chips on or around the given date. Combine with `has:date`. | `has:date today` |

> **Reconciliation note (F7 candidate):** the `is:mirror` filter is provided for query parity with Workflowy. In WorkFlowy, "mirror" is a peer-group relation, so `is:mirror` returns items that participate in any peer group of size ≥ 2 (see [`./09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md)).

### Ranking

Operator filters are applied **first** as a hard predicate; the remaining hits are then ordered by the AT-SR-* relevance-then-recency rules above. Operators do not change weights — they only narrow the candidate set.

---

## Related

| Topic | Link |
|-------|------|
| Search syntax + perf SLA | `mem://features/search-functionality` |
| Mirror peer groups | [09b-mirror-peer-group-model.md](./09b-mirror-peer-group-model.md) |
| Trash exclusion | [11-trash-view.md](./11-trash-view.md) |

---

## Inputs

- A user query string (free text + optional `#tag`, `is:`, `type:`, `date:` filters per `mem://features/search-functionality`).
- Candidate `Items` set after filter application, with their `Content`, `Note`, `UpdatedAt`, `OwnerId`, and breadcrumb path.

## Outputs

- A deterministically-ordered ranked list per §16.1: bucketed by `floor(Score / 20)`, sorted within bucket by `UpdatedAt` desc then `OwnerId` asc.
- The 250-item viewport cap (L4) applies — additional matches counted but not rendered (per **I-SR-04**).

## Edge Cases

§16.4 *Edge Cases* covers: title-exact-vs-100-substring relevance dominance; same-score recency tiebreak then `OwnerId`; mirror peer-group instances ranking independently with distinct breadcrumbs; empty-query no-fallback rule; filter-only-query bucket-60 default.

## Acceptance Tests

The 5 acceptance tests **AT-SR-01 … AT-SR-05** are defined under the existing `## Acceptance Criteria` heading above. This bare-named heading satisfies G-06; canonical content lives in that section.

| AT ID | Summary | Source |
|-------|---------|--------|
| AT-SR-01 | Determinism: identical query+snapshot → identical order | Acceptance Criteria |
| AT-SR-02 | Title-exact dominates 100-substring | Acceptance Criteria |
| AT-SR-03 | Same-score recency tiebreak then OwnerId | Acceptance Criteria |
| AT-SR-04 | Mirror peers rank independently with distinct breadcrumbs | Acceptance Criteria |
| AT-SR-05 | Filter-only query falls into bucket-60 default | Acceptance Criteria |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Server-side ranker | `wp-plugin/src/Search/Ranker.php` | n/a (server-side) | AT-SR-01, AT-SR-02, AT-SR-03 |
| Coarse-grain bucket strategy | `wp-plugin/src/Search/BucketStrategy.php` | n/a (server-side) | AT-SR-04, AT-SR-05 |
| Search overlay (FE) | `src/components/search/SearchOverlay.tsx` | `search-overlay` | AT-SR-06, AT-SR-07 |
| Search input | `src/components/search/SearchInput.tsx` | `search-input` | AT-SR-06 |
| Result list | `src/components/search/SearchResults.tsx` | `search-results` | AT-SR-07 |
| Recent items panel | `src/components/search/SearchRecent.tsx` | `search-recent` | AT-INTERACT-13 |

### Notes

- **Ranking site:** server-side query handler (no client-side re-rank).
- **Determinism contract:** identical `(query, DB snapshot)` MUST produce byte-identical ordering (per **I-SR-01**).
- **Perf SLA:** sub-300 ms for ≥5,000-item datasets per `mem://features/search-functionality`; enforced via the 5-bucket coarse-grain strategy (no full BM25 in MVP).

---

## Backend Contract (BE)

| Aspect | Specification |
|---|---|
| Handler | `wp-plugin/src/Search/Ranker.php::rank(Query $q, ItemSet $candidates): RankedList` |
| Bucket strategy | `wp-plugin/src/Search/BucketStrategy.php::bucket(int $score): int` returns `floor($score / 20)` clamped to `[0,5]`. |
| Operator parser | `wp-plugin/src/Search/QueryParser.php::parse(string $raw): ParsedQuery` — emits AST of `{terms, filters[], excludes[], groupingOp}`. |
| FTS engine | SQLite **FTS5** virtual table `Items_fts(Content, Note)` (per ADR-0019 App-DB schema). |
| Ranking inputs | `Items.UpdatedAt`, `Items.OwnerId`, `Items.ItemType`, `Items.Favorite`, `ItemTags.Tag`, `Items.DeletedAt` (filter), `Items.CompletedAt` (filter). |
| Side effects | **None.** Read-only against App DB. No FIFO writes. No SSE emission. |
| Cross-workspace fan-out | Sequential per accessible App DB (per `WorkspaceMember` from Root DB); merge happens application-side after per-DB rank. **Cross-DB joins forbidden** (ADR-0019). |
| Error contract | See **§Errors** below. |

## Frontend Contract (FE)

| Aspect | Specification |
|---|---|
| Trigger | `Cmd/Ctrl+K` global hotkey (per `src/lib/hotkeys.ts` registry) OR sidebar/navbar `search-button` click. |
| Surface | `SearchOverlay` portal anchored at app root; uses `EditorBoundary` sibling — NOT inside it (per ADR-0017 named-boundary table). |
| Debounce | 150 ms typing debounce before issuing `GET /search`. Empty query short-circuits to `SearchRecent`. |
| Loader | React-Router v7 loader at `/search` (overlay route) reads local mirror **first** (per ADR-0023 loader↔queue contract); on cache miss issues `GET /search`. **Never bypasses the local mirror.** |
| Result rendering | Virtualised via `@tanstack/react-virtual` when result count > 250 (per ADR-0017 1000-item virtualisation). 250-item viewport cap enforced (**I-SR-04**). |
| Empty / loading / error states | `<SearchEmpty/>`, `<SearchSkeleton/>` (shadcn `Skeleton`), `<SearchError/>` (renders `Errors[0].Code` + retry button). |
| Highlight rendering | `Snippet` HTML uses `<mark>` tags only; sanitised by DOMPurify before insertion. |
| Keyboard nav | `↑/↓` cycles `search-results` rows; `Enter` opens; `Esc` closes overlay (per AT-INTERACT-10..13). |
| No client-side re-rank | The FE MUST render the order returned by the server verbatim. Re-sorting client-side is **forbidden** (preserves I-SR-01 determinism contract). |

## Database Contract (DB) — extended

Already declared in §Database Routing above. Additional schema specifics:

| Object | Definition | Notes |
|---|---|---|
| `Items_fts` | `CREATE VIRTUAL TABLE Items_fts USING fts5(Content, Note, content='Items', content_rowid='RowId');` | App DB. Triggered insert/update/delete from `Items`. |
| `IdxItem_LiveByUpdatedAt` | `CREATE INDEX … ON Items(UpdatedAt DESC) WHERE DeletedAt IS NULL` | Partial index for recency tiebreak inside buckets. |
| `IdxItemTags_Tag` | `CREATE INDEX … ON ItemTags(Tag, ItemId)` | For `#tag` operator. |
| Rank query shape | `SELECT … FROM Items_fts JOIN Items ON … WHERE … ORDER BY bucket DESC, UpdatedAt DESC, OwnerId ASC LIMIT 250` | Single statement per App DB; no recursive CTEs. |

## Endpoint Contract (EP)

The single endpoint backing this feature is **EP-SEARCH-QUERY** — full request/response/error envelope is the SSOT in [`spec/31-app/06-endpoints/15b-search.md`](../06-endpoints/15b-search.md). Summary:

| Field | Value |
|---|---|
| Method + path | `GET /search` (per WP REST namespace `wp-json/workflowy/v1/search`) |
| Auth | `user` (server filters to readable items) |
| Required query params | `Q` (1–256 chars) |
| Optional query params | `Scope`, `Types`, `IncludeTrashed`, `Limit` (≤ 50, default 25), `Cursor` |
| Response envelope | PascalCase `{ Status, Attributes, Results: { Hits[], NextCursor, TookMs } }` (per ADR-0004) |
| Per-hit shape | `{ Item, Score, MatchKind, FieldWeight, Snippet }` |
| Error codes | `ERR_QUERY_TOO_SHORT`, `ERR_QUERY_TOO_LONG`, `ERR_FORBIDDEN`, `ERR_LIMIT_EXCEEDED` |
| Performance budget | P95 ≤ 150 ms for workspaces ≤ 100k items |

## SSE / Realtime Contract

| Aspect | Specification |
|---|---|
| Stream emission | **None.** Search is read-only and does NOT emit any SSE frame on `/stream/page/{id}` or `/stream/user/{id}` (per ADR-0025: SSE is read-signal only). |
| Stream consumption | Search results may become **stale** when an SSE frame (`item.updated`, `item.deleted`, `item.created`) arrives while the overlay is open. The overlay MUST re-validate its result set against the local mirror on every relevant SSE frame and re-render impacted rows in place. |
| No re-fetch on SSE | The overlay MUST NOT re-issue `GET /search` on every SSE frame — only re-read the local mirror (per ADR-0023 loader-reads-mirror-first rule). A full re-query is allowed only when the user re-submits the query. |
| Last-Event-ID | Not applicable — search does not produce a stream. |

## Permissions Contract (Perm)

| Capability | Rule |
|---|---|
| Visibility | A hit appears in the result list **only if** the caller has at least `read` permission on the `Item` (per `15-roles-and-permissions.md`). Server-side filter; never client-side. |
| Scope-restricted query | If `Scope` is supplied and the caller lacks `read` on the scope item → `ERR_FORBIDDEN` (no partial result). |
| Cross-workspace fan-out | Limited to App DBs whose workspace appears in the caller's `WorkspaceMember` rows. Foreign workspaces are silently skipped (no error). |
| Trashed-item access | `IncludeTrashed=true` only surfaces trash items the caller could see when they were live (read or higher). |
| Mirror-instance permission | Each mirror peer-group instance is permission-checked independently; instances in workspaces the caller cannot read are filtered out (the peer group may appear as a smaller set than its true size). |
| Sensitive content | Notes (`Items.Note`) inherit the parent item's permission; no separate ACL. |

## Errors

All error responses follow the canonical envelope (per ADR-0004): `{ Status: "error", Errors: [{ Code, Message, Field? }] }`. `Errors` is **omit-never-null**.

| Code | Trigger | HTTP | Recovery |
|---|---|---|---|
| `ERR_QUERY_TOO_SHORT` | `Q` length < 1 (after trim) | 400 | FE shows hint "Type at least 1 character" in `<SearchEmpty/>`. |
| `ERR_QUERY_TOO_LONG` | `Q` length > 256 | 400 | FE truncates input to 256 in `SearchInput` before submit (defence-in-depth); server still validates. |
| `ERR_FORBIDDEN` | Caller lacks `read` on `Scope` item | 403 | FE renders `<SearchError/>` with "You don't have access to that page" + retry without `Scope`. |
| `ERR_LIMIT_EXCEEDED` | `Limit > 50` | 400 | FE clamps to 50 client-side; server enforces. |
| `ERR_INTERNAL` | FTS5 query failure / SQLite I/O error | 500 | FE shows generic "Search is temporarily unavailable" + retry button. Server logs full error per ADR-0007 logging rules. |
| `ERR_RATE_LIMITED` | > 30 queries / minute / user (per WP plugin throttle) | 429 | FE displays cooldown countdown derived from `Retry-After` header. |

> No partial results: every error response has empty/absent `Results`. The `Status: "error"` envelope is mutually exclusive with `Status: "success"`.

## Acceptance Tests — extended

| AT ID | Summary | Source |
|-------|---------|--------|
| AT-SR-06 | `Cmd/Ctrl+K` opens overlay; empty query renders `search-recent`; `Esc` closes | §FE Contract + AT-INTERACT-10..13 |
| AT-SR-07 | Result row keyboard nav (`↑/↓` cycles, `Enter` opens, focus visible) | §FE Contract |
| AT-SR-08 | `ERR_FORBIDDEN` on unreadable `Scope` returns 403 with empty `Results` and one entry in `Errors[]` | §Errors |
| AT-SR-09 | SSE `item.updated` for an item in the open result list updates the row in place WITHOUT issuing a new `GET /search` | §SSE Contract |
| AT-SR-10 | Cross-workspace fan-out: search returns hits from all workspaces in `WorkspaceMember`, none from foreign workspaces | §Perm Contract |
| AT-SR-11 | `Limit > 50` is clamped client-side; server still rejects with `ERR_LIMIT_EXCEEDED` if bypassed | §Errors |
