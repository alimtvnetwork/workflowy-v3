# P48 Sweep Ledger — Plural-DDL References After ADR-0001

> **Authored:** 2026-04-28
> **Trigger:** ADR-0001 ratified singular PascalCase DDL identifiers
> (`Item`, `User`, `Mirror`, `Session`, `Template`, `Item.IsFavorite`).
> **Scope:** complete `rg`-based sweep of `spec/` for plural-table SQL,
> plural-table prose, and the forbidden `EP-FAVORITES-*` / `EP-CONTENT-*`
> endpoint families.
> **Mode:** spec-only — this ledger records findings + fixes the
> immediate **contradictions**; bulk SQL rewrites are deferred to a
> dedicated follow-up ADR.

---

## A. Resolved in P48 (contradictions with ADR-0001)

These passages **directly contradicted** ADR-0001 by asserting that
`Favorite` / `Favorites` is a real table. Fixed in this pass:

| File | Line | Issue | Resolution |
|---|---|---|---|
| `spec/31-app/06-endpoints/03-layout-structure.md` | 23 | Said *"Favorites lives at the table layer only (`Favorite` per the Spec↔DDL Alias Bridge…)"* — implies a `Favorite` table | Rewritten to: Favorites is `Item.IsFavorite` (column on `Item`), no `Favorite` table exists, citing ADR-0001 |
| `spec/31-app/07-db-diagram/04-feature-slices.md` | 394–396 | Defers an `EP-FAVORITES-*` endpoint family and a `Favorite.FractionalIndex` column | Rewritten to: no deferred family — promotion requires a new ADR superseding ADR-0001; the field is `Item.FavoriteFractionalIndex` (column on `Item`) |

---

## B. Allowed — prose aliases (no fix needed)

Plural English used in prose, **outside** SQL/DDL fences. ADR-0001
explicitly permits this.

| File | Note |
|---|---|
| `spec/00-adrs/0001-singular-ddl-vs-plural-prose.md` | Alias rule itself — uses plural in explanatory prose |
| `spec/00-adrs/00-overview.md` | Examples and anti-pattern table — plural prose intentional |
| `spec/04-database-conventions/00-overview.md` (footer) | ADR backlink — plural in prose |
| `spec/00-overview.md` | ADR table — plural in prose |
| `spec/31-app/05-conventions/00-overview.md` (174) | "a `Favorites` table to attach a policy to" — explicitly forbids it |
| `spec/31-app/01-features/00-overview.md` (242, 252) | Already says "no `Favorite` / `Favorites` table" |
| `spec/31-app/97-acceptance-criteria.md` (304, 319) | Forbids plural-table SQL in fixtures |
| `spec/31-app/06-endpoints/00-overview.md` (285, 305) | Forbids `EP-FAVORITES-*` |

---

## C. Deferred — bulk SQL plural-identifier rewrite

These files contain **SQL fragments** that use plural table names
(`FROM Items`, `UPDATE Mirrors`, `FROM Sessions`, `FROM Users`).
They violate ADR-0001 strictly speaking, but rewriting them touches
**14 spec files** with extensive workflow/AT detail and would also
require updating downstream gates whose fixtures cite the same SQL.

A bulk rewrite of this size warrants its own ADR (call it
**ADR-0006: Migrate spec SQL fragments to singular DDL identifiers**)
that documents the rename, the gate updates, and a fixture-regeneration
plan in one atomic decision. P48 records the inventory; the rewrite is
deferred to a future task (suggested as P53 below).

**Inventoried SQL-plural sites:**

| File | Approx lines | Plural identifiers used |
|---|---|---|
| `spec/02-coding-guidelines/00-overview.md` | 348 | `Sessions` (in example) |
| `spec/02-coding-guidelines/05-rust/01-naming-conventions.md` | 156 | `Sessions` |
| `spec/02-coding-guidelines/05-rust/01a-rust-json-and-decisions.md` | 163 | `Sessions` |
| `spec/04-database-conventions/05-relationship-diagrams.md` | 293 | `Users` |
| `spec/05-split-db-architecture/00-overview.md` | 152, 164, 166, 192, 193 | `Items`, `Users` |
| `spec/31-app/01-features/09a-mirror-cycle-detection.md` | 40, 103, 108 | `Items`, `Mirrors` |
| `spec/31-app/01-features/14-concurrency-and-sync.md` | 314 | `Items` |
| `spec/31-app/02-workflows/04-trash-restore-flow.md` | 49, 55, 62, 66 | `Items`, `Mirrors` |
| `spec/31-app/02-workflows/05-trash-reaper-flow.md` | 54, 61 | `Items` |
| `spec/31-app/02-workflows/06-search-query-flow.md` | 55 | `Items` |
| `spec/31-app/02-workflows/07-sync-replay-flow.md` | 66, 77 | `Items` |
| `spec/31-app/02-workflows/08-mirror-detach-flow.md` | 65, 72 | `Items` |
| `spec/31-app/02-workflows/09-mirror-create-flow.md` | 58, 59, 62, 64, 83, 85, 89 | `Items` |
| `spec/31-app/97b-acceptance-criteria-fixtures.md` | 31, 193 | `Items`, `Templates` |
| `spec/31-app/97c-acceptance-criteria-fixtures.md` | 129, 310, 371 | `Items` |
| `spec/31-app/97d-acceptance-criteria-fixtures.md` | 157, 179, 286 | `Items`, `Permissions` |

**Until the future ADR lands:** treat these SQL fragments as
"grandfathered" — do not propagate the pattern to new pages, and never
write *new* SQL using plural identifiers (gate `G-04-NO-DDL-PLURALS`
applies fully to all *new* content).

---

## D. Net P48 outcome

- **2 contradictions** with ADR-0001 fixed (the `Favorite`-as-table
  assertions in `03-layout-structure.md` and `04-feature-slices.md`).
- **0 prose-alias violations** found (alias rule is being honoured).
- **16 SQL-plural sites** inventoried; rewrite deferred to a dedicated
  ADR + follow-up task to keep the change atomic and auditable.
- **No new ADR violations introduced** by this sweep.
