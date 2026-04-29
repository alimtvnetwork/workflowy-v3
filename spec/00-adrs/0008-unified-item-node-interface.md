# ADR-0008: Unified `Node` interface and 250-item per-view limit

## Status

`Accepted` — 2026-04-28

## Context

WorkFlowy's entire UI — outliner, board view, dashboard, mirror peer
groups, templates, search results, and trash — operates on a **single**
abstract entity. Every bullet, card, dashboard tile, and search hit is
the same thing: a **Node**. The product's core value proposition (any
item can become any other item type without losing identity, position,
or children) collapses if the codebase carries multiple parallel
interfaces (`Card`, `Bullet`, `Tile`, `MirrorRef`, `SearchHit`, …).

This load-bearing invariant currently lives in two places:

1. **Memory** — `mem://architecture/data-model` (single source of
   truth for the AI agent).
2. **Prose** — scattered references in `spec/31-app/01-features/`,
   `spec/04-database-conventions/`, `spec/20-enums-index.md`.

A second invariant ships alongside it: the **250-item limit per
default organizational view**, which is the load-bearing performance
guarantee the entire UI architecture (virtualization strategy, page
weight, mobile budgets) is sized against.

Without an ADR anchor:

- An AI generating a new view (e.g. "Calendar view") could legitimately
  introduce `CalendarEvent` as a parallel interface.
- The 250-cap is a free parameter that an AI could silently bump to
  500 or 1000 to "fix" a paginate-or-virtualize design question, with
  cascading performance consequences.

P55 closes this gap.

## Decision

### D1 — The `Node` interface is the **sole** representation of any item

Every item in the system MUST be representable as a single
`Node` interface. No view, feature, or storage layer may introduce a
parallel interface (`Card`, `Tile`, `BoardCell`, `MirrorRef`,
`SearchHit`, `TrashEntry`, `TemplateNode`, etc.). Views derive their
shape **by composing or projecting** `Node`, never by replacing it.

The `Node` interface has these **mandatory** fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `ItemId` (branded `string`) | Persistent across moves, mirrors, type changes. Constructed only via `asItemId()` at trust boundaries. |
| `parentId` | `ItemId \| null` | `null` only for the permanent undeletable root. |
| `content` | `string` | Rich-text payload. |
| `itemType` | enum, 12 lowercase values | See `spec/20-enums-index.md` §3.5 and `mem://features/core-mechanics`. |
| `isCompleted` | `boolean` | Default `false`. |
| `isCollapsed` | `boolean` | Default `false`. |
| `sortOrder` | fractional index (`string`) | Lexicographically comparable; see `mem://features/editor-core`. |
| `ownerId` | `OwnerId` (branded `string`) | Constructed only via `asOwnerId()`. |
| `createdAt` | ISO-8601 `string` | UTC. |
| `updatedAt` | ISO-8601 `string` | UTC; LWW tiebreak per ADR-0005. |
| `deletedAt` | ISO-8601 `string \| null` | Soft-delete; non-null = in trash (P56 will lift retention into ADR-0009). |

Optional view-specific decoration MAY be attached via a separate
**projection** type (e.g. `BoardCardProjection extends Pick<Node, …>`),
but the base `Node` MUST round-trip through the projection without
data loss.

### D2 — Identity Rule

A `Node.id` is **persistent**:

- A move (parent change, sort reorder) MUST NOT change `id`.
- A mirror (peer-group join per ADR-0005) MUST NOT change `id` of
  any peer.
- A type change (`text` → `task`, `task` → `board`) MUST NOT change
  `id`.

Generating a new `id` is reserved for `create` operations only.

### D3 — Root Rule

There is exactly one `Node` per workspace whose `parentId === null`.
This root is **permanent**, **undeletable** (`deletedAt` MUST stay
`null`), and **uneditable** (its `content` is the workspace name,
mutable only via the workspace-rename endpoint). No other `Node` may
have `parentId === null`.

### D4 — 250-item limit per default organizational view

Any **default organizational view** (outliner page, board column,
dashboard child grid, search result page, mirror peer-group expansion)
MUST render at most **250 `Node` instances** at one time. Beyond 250:

- The view MUST paginate, virtualize, or "load more" — never silently
  truncate.
- The 250 cap is a **performance contract**, not a UX preference.
  Bumping it requires a superseding ADR with a documented benchmark
  showing the new ceiling holds the original budget (TTI ≤ 1.5 s on
  median mobile, scroll FPS ≥ 55).

**Out of scope** for the cap: aggregate counts, sidebar lists of saved
queries, the trash flat list (which paginates server-side at 100/page
per `35-enforcement-rules/`), and admin/diagnostic tools.

### D5 — Zero parallel item interfaces

A new file MUST NOT define an interface or type alias whose shape
overlaps `Node` by ≥ 4 of the mandatory D1 fields. Reviewers (and
the future `G-31-NO-PARALLEL-NODE` gate) treat such a definition as a
hard violation; the offending type MUST be replaced with `Node` or a
`Pick`/`Omit` projection of it.

## Consequences

### Positive

- **One mental model.** Every developer, every AI prompt, every
  test fixture talks about the same `Node`. Refactors that change one
  view's shape no longer ripple across N parallel interfaces.
- **Mirror, type-change, and move semantics fall out for free.**
  Because `id` is persistent (D2) and the shape is uniform (D1),
  the operations defined in ADR-0005 (mirror peer groups) and the
  type-change endpoints reduce to field updates instead of re-key /
  re-create.
- **Performance budget is load-bearing.** D4 turns the 250-cap from
  a soft preference into a contract that gates new-view PRs.

### Negative

- **Projection ceremony.** Some views (board kanban) want
  card-specific decoration (column position, drag-handle state).
  These MUST live in a separate projection type, adding one extra
  declaration per view.
- **D4 forces virtualization early.** Even small features (e.g.
  search) must implement pagination from day one rather than
  shipping a "render-all" v0.


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/ (Item interface)`](../31-app/).

## Alternatives Considered

1. **Per-view interfaces (`Card`, `Tile`, `BoardCell`, …)** — rejected:
   this is exactly what D5 forbids. It was the default in three early
   prototypes and led to N² conversion functions and identity loss
   during type changes (which is the product's core promise).
2. **Higher per-view cap (e.g. 1000) + always-on virtualization** —
   rejected: virtualization solves render but not network/payload
   weight; 250 was chosen against the median-mobile TTI budget. The
   superseding-ADR clause in D4 leaves the door open if benchmarks
   change.

## Gates Touched

- `G-31-NODE-INTERFACE-CANONICAL` — enforces D1 (mandatory fields,
  no overlap with parallel interfaces).
- `G-31-NODE-ID-PERSISTENT` — enforces D2 (identity preserved across
  move / mirror / type change).
- `G-31-ROOT-SINGLETON` — enforces D3 (exactly one `parentId === null`,
  permanent, undeletable).
- `G-31-VIEW-250-CAP` — enforces D4 (no default view renders > 250
  `Node` instances simultaneously).
- `G-31-NO-PARALLEL-NODE` — enforces D5 (≥ 4-field overlap = hard
  violation).

All five gates are formally **anchored** by this ADR. Their
enforcement contracts live in `spec/31-app/01-features/00-overview.md`,
`spec/31-app/02-workflows/`, and `spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none).
- **Superseded-By:** (none).
