# ADR-0013: Search ranking — hybrid relevance-then-recency, tiered match × field weight, sub-300 ms SLA

## Status

`Accepted` — 2026-04-28

## Context

Search is the primary cross-tree navigation surface in WorkFlowy.
Two load-bearing properties of the ranking algorithm define the user
experience and gate every implementation choice:

1. **Hybrid relevance-then-recency** — results are first bucketed by
   a relevance score, and recency only orders **within** a bucket. A
   relevance-100 item from last year MUST rank above a relevance-20 (gate G-16-RANKING-HYBRID-BUCKETED)
   item edited 5 seconds ago.
2. **Sub-300 ms response time** for datasets of ≥ 5 000 items, both
   online (server) and offline (local mirror per ADR-0010).

These properties are currently anchored only in:

- **Memory** — `mem://features/search-functionality` (single source
  for the AI agent: tier table, field weights, 5-bucket grouping,
  tiebreak chain, invariants).
- **Feature SSOT** — `spec/31-app/01-features/16-search-ranking.md`
  (formal AT-SR-* tests + worked examples).
- **Workflow** — `spec/31-app/02-workflows/06-search-query-flow.md`
  (end-to-end query sequence with permission filter, optional FTS5
  index, tier scoring, paging).

Without an ADR anchor, an AI generating a new search-related feature
or rebuilding the search service could legitimately:

- Replace the 5-tier match-kind table with full BM25 (different
  ranking + much larger index footprint).
- Collapse the hybrid scheme into pure recency or pure relevance,
  breaking invariant I-SR-02.
- Pick different field weights (e.g. Note × 1.5 to elevate notes),
  silently changing the perceived "what is this app good at finding".
- Fall back to "all items by recency" on empty query — a UX choice
  the spec explicitly forbids.
- Allow recency to win across buckets ("freshness boost") to satisfy a
  perceived UX request, breaking the AT-SR-01 / AT-SR-02 contracts.

P60 closes this gap.

## Decision

### D1 — Hybrid strategy: relevance bucket first, recency within

Search ranking MUST follow a **two-stage** ordering (gate G-16-RANKING-HYBRID-BUCKETED):

1. Compute a **relevance score** per candidate item (D2–D4).
2. Group candidates into **5 buckets** of `floor(Score / 20)`
   (buckets 0..4, where bucket 4 holds scores 80–100, bucket 3
   holds 60–79, etc.).
3. Sort across buckets **descending** (higher bucket = higher rank).
4. Within a bucket, sort by `Item.UpdatedAt` **descending**, then
   by `OwnerId` **ascending** as the deterministic tiebreak.

**Invariant I-SR-02 (load-bearing):** Recency MUST NEVER beat (gate G-16-RANKING-HYBRID-BUCKETED)
relevance across buckets. A bucket-4 item from one year ago ranks
above a bucket-1 item edited five seconds ago. Implementations that
add a "freshness boost" capable of crossing bucket boundaries are a
hard violation of this ADR.

### D2 — Match-kind tier table (5 tiers)

The relevance score for a single field MUST be computed from this (gate G-16-RANKING-HYBRID-BUCKETED)
exact tier table:

| Match kind | Score |
|---|---|
| Exact whole-field match | **100** |
| Exact substring match | **80** |
| All terms present, in order | **60** |
| All terms present, any order | **40** |
| Some terms present | **20** |
| No terms present | **0** (excluded) |

Tier values are **fixed** in v1; changing any value requires a
superseding ADR (the 5-bucket grouping in D1 is calibrated against
the 20-point spacing).

### D3 — Field weights: Content × 1.5, Note × 1.0

The candidate fields searched are **Content** (the item's primary
text) and **Note** (the secondary long-form annotation). The field
weights MUST be (gate G-16-RANKING-HYBRID-BUCKETED):

- `Content` × **1.5**
- `Note` × **1.0**

The per-item relevance score MUST be (gate G-16-RANKING-HYBRID-BUCKETED):

```
Score = max(
  tier(query, item.Content) * 1.5,
  tier(query, item.Note)    * 1.0
)
```

`max(...)`, **not** sum: an item with a tier-100 Content match and a
tier-100 Note match scores 150, not 250. This keeps Content-exact
matches (the dominant case) deterministically at the top of bucket 4.

Other text fields on `Item` (e.g. workspace path, breadcrumb labels)
MUST NOT contribute to the relevance score (gate G-16-RANKING-HYBRID-BUCKETED).

### D4 — Operator filters are hard predicates, applied **first**

Query operators (`#tag`, `date:<expr>`, `is:complete`,
`is:collapsed`, `is:trashed`, `type:todo|board|...`) MUST be applied (gate G-16-RANKING-HYBRID-BUCKETED)
as a **hard predicate** that narrows the candidate set **before**
relevance scoring. Operators MUST NOT modify tier values, field (gate G-16-RANKING-HYBRID-BUCKETED)
weights, or bucket assignments.

A filter-only query with no free-text terms (e.g. `is:todo`) MUST (gate G-16-RANKING-HYBRID-BUCKETED)
score every matching candidate at **bucket 3** (score 60 per
"all-terms-present" semantics on the empty term set) and order them
by recency.

### D5 — Sub-300 ms SLA for ≥ 5 000-item datasets

The end-to-end query latency (from the debounced request firing to
the first paint of results, excluding network) MUST be **< 300 ms** (gate G-16-RANKING-HYBRID-BUCKETED)
on a dataset of ≥ 5 000 items. The SLA applies in **both** modes:

- **Online** — query against the WP-plugin REST endpoint (per
  ADR-0002) backed by the SQLite app DB, optionally accelerated by
  the FTS5 index template in
  `spec/05-split-db-architecture/03-app-indexes.sql`.
- **Offline** — query against the local mirror (per ADR-0010 §scope
  *"Sub-300 ms search SLA still applies offline"*).

The 5-bucket coarse-grain strategy (D1) is the chosen mechanism for
holding the SLA without adopting full BM25 in v1 — the coarse buckets
let the query planner short-circuit on the first bucket-4 page and
defer lower buckets until the user pages.

### D6 — Empty query returns no results (no recency fallback)

An empty query (whitespace-only after operator stripping) MUST (gate G-16-RANKING-HYBRID-BUCKETED)
return **zero results**. Implementations MUST NOT fall back to "all (gate G-16-RANKING-HYBRID-BUCKETED)
items by recency" or "recently visited". Rationale: an accidental
empty query in a 50 000-item account would otherwise dump the entire
mirror through the result list and blow the 300 ms SLA.

### D7 — Out of scope (v1)

Deferred (require a superseding ADR before introduction):

- Full BM25 / TF-IDF scoring.
- Personalised relevance (per-user click-through learning).
- Cross-language stemming or fuzzy ("did you mean") matching.
- Synonym tables.
- Vector / semantic search.

### D8 — Mirror peer instances rank independently

Per ADR-0005 (mirror peer-group model): each peer of a mirror
peer-group is an independent `Item` with its own `id`, `parentId`,
and breadcrumb path. Search MUST rank each peer **independently** (gate G-16-RANKING-HYBRID-BUCKETED)
(they may appear at different ranks in the same result list with
distinct breadcrumbs). Deduplication of peers is **forbidden** — the
breadcrumb is what disambiguates them in the UI.

Trash and completed items MUST be excluded from results unless the (gate G-16-RANKING-HYBRID-BUCKETED)
query opts in via `is:trashed` or `is:complete`.

## Consequences

### Positive

- **One ranking contract.** Every search implementation (server FTS5,
  local mirror, future re-rank service) computes the same score and
  bucket assignment from the same inputs.
- **Load-bearing UX promise.** "Exact match wins, no matter how old"
  (I-SR-02) is now ratified, not memory-only.
- **Performance budget anchored.** D5 ties the 5-bucket strategy
  directly to the 300 ms SLA, so future "let's switch to BM25" PRs
  must demonstrate the SLA still holds on a ≥ 5 000-item dataset.
- **ADR-0010 offline contract honoured.** D5's "both modes" clause
  closes the implicit forward-reference from the offline-resilience
  feature memory to a concrete latency target.

### Negative

- **No personalised ranking.** A user who frequently clicks on a
  specific tier-20 item gets no "boost" for it. D7 leaves the door
  open via a future ADR.
- **5-tier table is coarse.** Two queries with very different
  semantic specificity may end up in the same bucket. Acceptable
  trade-off — full BM25 in v1 was rejected as the SLA risk.


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/ (search)`](../31-app/).

## Alternatives Considered

1. **Full BM25 / TF-IDF** — rejected for v1: requires a real inverted
   index (~3–5× the bytes of the FTS5-substring index), forces a
   re-index pass on every Content/Note write, and makes the offline
   path (per ADR-0010) significantly more complex. The 5-tier × field
   weight scheme captures the dominant cases ("exact title", "term
   in note") deterministically at < 300 ms.
2. **Pure recency** — rejected: collapses the entire UX into "what
   did I edit last", defeating the purpose of search in a deeply
   nested outliner where users navigate by name, not by edit time.
3. **Pure relevance, no recency tiebreak** — rejected: when 50 items
   share bucket 4 (e.g. all titled "Untitled"), arbitrary ordering
   is unusable. Recency is the only deterministic, user-meaningful
   tiebreak available without per-user state.
4. **"Freshness boost" that can cross buckets** — rejected:
   directly violates I-SR-02 (the load-bearing contract that anchors
   AT-SR-01 and AT-SR-02). If product evidence ever demands it, a
   superseding ADR must explicitly retire I-SR-02.

## Gates Touched

- `G-16-RANKING-HYBRID-BUCKETED` — enforces D1 (5 buckets of
  `floor(Score/20)`; recency only within bucket; I-SR-02 enforced).
- `G-16-MATCH-TIER-TABLE` — enforces D2 (the five tier values
  100/80/60/40/20 are fixed; no re-weighting without ADR).
- `G-16-FIELD-WEIGHTS-CONTENT-NOTE` — enforces D3 (`max(Content×1.5,
  Note×1.0)`; no other field contributes; `max` not `sum`).
- `G-16-OPERATORS-AS-PREDICATE` — enforces D4 (operators narrow
  candidates before scoring; filter-only query → bucket 3).
- `G-16-SEARCH-300MS-SLA` — enforces D5 (< 300 ms on ≥ 5 000-item
  datasets, online and offline).
- `G-16-EMPTY-QUERY-NO-FALLBACK` — enforces D6 (zero results, never
  recency fallback).
- `G-16-MIRROR-PEERS-INDEPENDENT` — enforces D8 (no dedup of peer
  results; trash/completed excluded unless opted in).

All seven gates are formally **anchored** by this ADR. Their
enforcement contracts live in
`spec/31-app/01-features/16-search-ranking.md` (AT-SR-* table),
`spec/31-app/02-workflows/06-search-query-flow.md`, and
`spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none — refines `16-search-ranking.md` by ratifying
  its previously-prose-only invariants as ADR-bound).
- **Superseded-By:** (none).
