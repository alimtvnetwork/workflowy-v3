# ADR-0015: Twelve `ItemType` enum values — closed set, lowercase, mirror-excluded

## Status

`Accepted` — 2026-04-28

## Context

ADR-0008 ratified the unified `Node` interface but left `ItemType` as a
forward-reference to `spec/20-enums-index.md` §3.5. Three independent surfaces
already encode this enum — `spec/20-enums-index.md` §3.5,
`spec/32-ui-design/02-state-and-data/03-data-types.md`, and
`src/types/index.ts` — and AUDIT-03 (2026-04-26) corrected the set by swapping
`mirror` → `dashboard` (mirrors are rows in the `Mirror` table per ADR-0005,
not a turn-into target). Without an ADR pin, the closed set, the lowercase
casing, the mirror-exclusion rationale, and the dashboard/board
"child-rendering" semantics drift independently across the three SSOTs and
across `mem://features/core-mechanics` (still listing the pre-AUDIT-03 set).
This ADR closes the forward-reference.

## Decision

The `ItemType` enum is a **closed set of exactly twelve lowercase string
values**. It MUST be defined identically in all three SSOTs and consumed
through the TypeScript `as const` + derived-union pattern (per
`spec/20-enums-index.md` §1 rule 9).

**D1 — The twelve values (canonical order):**

```
bullet | h1 | h2 | h3 | paragraph | todo | numbered | board | dashboard | quote | code | divider
```

**D2 — Casing.** All values MUST be lowercase. PascalCase, SCREAMING_SNAKE,
or kebab-case representations are forbidden in code, DB columns, and wire
payloads. This is a deliberate exception to the universal PascalCase
enum-name rule (`spec/20-enums-index.md` §1 rule 1) granted by §3.5 because
the enum has been a lowercase DB column since the schema's inception.

**D3 — Mirror is NOT an `ItemType`.** Mirroring is a peer-group relation per
ADR-0005, materialised as rows in the `Mirror` table referencing a source
`Item` row. `mirror` MUST NOT appear in the `ItemType` enum. "Turn into
mirror" is therefore not a legal operation; mirror creation goes through
the peer-group join path, never through `Item.ItemType` mutation.

**D4 — `dashboard` and `board` are child-rendering values.** Every other
`ItemType` value renders the item itself. `board` and `dashboard` instead
control how the item's *direct children* are rendered (Kanban columns and
card grid respectively, per ADR-0010-pending feature ADRs and
`mem://features/board-view` / `mem://features/dashboard-view`). This
duality is intentional and MUST be preserved.

**D5 — Closed set.** Adding, removing, renaming, or re-casing any value
requires a superseding ADR. No runtime extension, no plugin-defined types,
no string fallback for unknown values — unknown values MUST be treated as a
parse error per `spec/20-enums-index.md` §1 rule 6 (default fallback is
explicit, not silent).

**D6 — Tri-SSOT lockstep.** `spec/20-enums-index.md` §3.5,
`spec/32-ui-design/02-state-and-data/03-data-types.md`, and
`src/types/index.ts` MUST list the twelve values in the same canonical order
shown in D1. CI MUST fail any PR that desyncs the three.

## Consequences

**Positive**

- Closes ADR-0008 D1's forward-reference; `Node.itemType` now has a
  ratified domain.
- Makes the AUDIT-03 correction load-bearing instead of "current SSOT" —
  future regressions to the pre-AUDIT-03 set are gate violations.
- Eliminates the recurring "is mirror an ItemType?" question by pinning the
  ADR-0005 boundary into the type system.
- Single canonical order across all three SSOTs makes diff review and
  enum-table audits trivial.

**Negative**

- Any future need for a 13th type (e.g. `table`, `embed`, `whiteboard`)
  requires a superseding ADR, not a code change — slower iteration on item
  taxonomy.
- Lowercase exception to the PascalCase enum-name rule must be re-explained
  to every new contributor; the §3.5 annotation is the only signpost.
- `mem://features/core-mechanics` is currently out of lockstep (lists
  `mirror` instead of `dashboard`) and must be corrected as a follow-up.

## Alternatives Considered

1. **Open set with plugin-registered types** — rejected because every
   downstream surface (DB CHECK constraint, TS exhaustiveness checks,
   render switch, board/dashboard branching) assumes a closed enum.
   Plugin-registered types would silently break the
   `dashboard`/`board` child-rendering branch and the hotkey "turn into"
   table.
2. **Re-add `mirror` as an ItemType (pre-AUDIT-03 shape)** — rejected per
   ADR-0005: mirrors are peer-group relations, not turn-into targets. A
   `mirror` ItemType would re-introduce the duality bug AUDIT-03 fixed
   (an item that is both a `Mirror` row's target *and* an `ItemType =
   mirror` would have undefined render semantics).
3. **PascalCase the enum to align with §1 rule 1** — rejected because the
   DB column has shipped lowercase since v0.1 and re-casing would force a
   schema migration, a wire-format break, and a rewrite of every existing
   `ItemType` reference in the spec for zero behavioural gain.
4. **Defer to `spec/20-enums-index.md` §3.5 indefinitely (no ADR)** —
   rejected because §3.5 is a registry, not a decision record; it tells
   you *what* the values are but not *why* the set is closed, *why* mirror
   is excluded, or *why* lowercase is allowed. ADR-0008 D1 explicitly
   asked for this ADR.

## Gates Touched

- **New gates:**
  - `G-20-ITEMTYPE-CLOSED-12` — enforces D1 + D5 (exactly the twelve
    listed values, no additions, no removals, no plugin extension).
  - `G-20-ITEMTYPE-LOWERCASE` — enforces D2 (lowercase only in code,
    DB, wire).
  - `G-20-NO-MIRROR-ITEMTYPE` — enforces D3 (`mirror` MUST NOT appear
    in any `ItemType` definition or CHECK constraint); cross-references
    ADR-0005.
  - `G-20-DASHBOARD-BOARD-CHILD-RENDER` — enforces D4 (any code path
    that renders `Item` based on `ItemType` MUST branch on `board` and
    `dashboard` to render *children*, not self).
  - `G-20-ITEMTYPE-TRI-SSOT-LOCKSTEP` — enforces D6 (CI compares the
    three SSOTs; fails on any drift in values, order, or casing).
- **Modified gates:** `(none)`
- **Endpoints locked:** `(none)` — `ItemType` is a payload field, not an
  endpoint; affected endpoints are governed by ADR-0004's envelope rules.
- **DDL identifiers locked:** `Item.ItemType` (singular per ADR-0001),
  including its CHECK constraint domain (the twelve D1 values).

## Supersedes / Superseded-By

- **Supersedes:** `(none)` — closes ADR-0008 D1's forward-reference but
  does not supersede ADR-0008 itself.
- **Superseded-By:** `(none)`
