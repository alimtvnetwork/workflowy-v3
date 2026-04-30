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

### Notes

- **Ranking site:** server-side query handler (no client-side re-rank).
- **Determinism contract:** identical `(query, DB snapshot)` MUST produce byte-identical ordering (per **I-SR-01**).
- **Perf SLA:** sub-300 ms for ≥5,000-item datasets per `mem://features/search-functionality`; enforced via the 5-bucket coarse-grain strategy (no full BM25 in MVP).
