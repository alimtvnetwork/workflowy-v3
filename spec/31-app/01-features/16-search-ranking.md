# Search Ranking

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Companion:** `mem://features/search-functionality` (syntax + perf)

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

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Server-side ranker | `wp-plugin/src/Search/Ranker.php` | n/a (server-side) | AT-SR-01, AT-SR-02, AT-SR-03 |
| Coarse-grain bucket strategy | `wp-plugin/src/Search/BucketStrategy.php` | n/a (server-side) | AT-SR-04, AT-SR-05 |

### Notes

- **Ranking site:** server-side query handler (no client-side re-rank).
- **Determinism contract:** identical `(query, DB snapshot)` MUST produce byte-identical ordering (per **I-SR-01**).
- **Perf SLA:** sub-300 ms for ≥5,000-item datasets per `mem://features/search-functionality`; enforced via the 5-bucket coarse-grain strategy (no full BM25 in MVP).
