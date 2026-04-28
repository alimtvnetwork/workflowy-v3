# State & Data — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-UISTATE-01` … `AT-UISTATE-15`

---

## Criteria

### State management (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UISTATE-01 | The global store MUST be Zustand with one slice per concern (selection, focus, drag, expansion, search); a single monolithic slice is forbidden because it forces every consumer to re-render on any change. | [`01-state-management.md`](./01-state-management.md), [`mem://architecture/tech-stack`](mem://architecture/tech-stack) |
| AT-UISTATE-02 | Component state MUST use `useState` / `useReducer` for local-only concerns; promoting local state to the global store without a documented cross-component need fails review. | [`01-state-management.md`](./01-state-management.md) |
| AT-UISTATE-03 | Selectors MUST return primitives or stable references (use `shallow` equality for objects); selectors that build a new object on every call cause re-render storms and are a Code-Red perf bug. | [`01-state-management.md`](./01-state-management.md) |
| AT-UISTATE-04 | Async actions MUST go through documented thunks/handlers (NOT inline `set` calls inside `await`); inline async-`set` is a Code-Red race-condition bug. | [`01-state-management.md`](./01-state-management.md) |

### Data flow (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UISTATE-05 | Data flow MUST be unidirectional: store → selector → component → action → store; two-way binding (component-mutates-prop-back-up) is FORBIDDEN as a Code-Red architecture bug. | [`02-data-flow.md`](./02-data-flow.md) |
| AT-UISTATE-06 | Every action MUST be named verb-first (`addItem`, `moveNode`, NOT `itemAdded` / `nodeMover`); past-tense and noun-named actions fail review because they obscure intent. | [`02-data-flow.md`](./02-data-flow.md) |
| AT-UISTATE-07 | NO backend runtime MAY be named in any data-flow file — the persistence layer is an injected `Persistence` interface, NOT a concrete backend; naming WordPress/Supabase/sql.js fails review. | [`02-data-flow.md`](./02-data-flow.md), [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) |
| AT-UISTATE-08 | Optimistic updates MUST include rollback on failure; one-way optimistic-only updates are a Code-Red data-integrity bug. | [`02-data-flow.md`](./02-data-flow.md) |

### Data types (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UISTATE-09 | Every domain type MUST extend the unified `Item` interface (`id`, `parentId`, `content`, `itemType`); separate "Bullet" / "Todo" / "Heading" interfaces are FORBIDDEN — discriminate via `itemType`. | [`03-data-types.md`](./03-data-types.md), [`mem://architecture/data-model`](mem://architecture/data-model) |
| AT-UISTATE-10 | All type names, JSON keys, AND DB column names MUST be PascalCase singular; deviations fail review per cross-language naming SSOT. | [`03-data-types.md`](./03-data-types.md), [`../../02-coding-guidelines/01-cross-language/07-database-naming.md`](../../02-coding-guidelines/01-cross-language/07-database-naming.md) |
| AT-UISTATE-11 | Boundary parsing MUST use Zod schemas (`z.infer<typeof Schema>` as the type SSOT); hand-rolled type-guards in business code fail review. | [`03-data-types.md`](./03-data-types.md), [`../../35-enforcement-rules/97-acceptance-criteria.md`](../../35-enforcement-rules/97-acceptance-criteria.md) |
| AT-UISTATE-12 | Discriminated unions for `itemType` MUST have an `assertNever(x)` exhaustiveness default in every switch; missing default is a Code-Red maintainability bug. | [`03-data-types.md`](./03-data-types.md), [`../../02-coding-guidelines/02-typescript/97-acceptance-criteria.md`](../../02-coding-guidelines/02-typescript/97-acceptance-criteria.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UISTATE-13 | The viewport MUST cap at 250 items per render (per data-model SSOT); breaking the cap is a Code-Red perf bug because it tanks 60fps target. | [`00-overview.md`](./00-overview.md), [`mem://architecture/data-model`](mem://architecture/data-model) |
| AT-UISTATE-14 | Item ordering MUST use fractional indexing (NOT integer position re-numbering on every move); integer-renumber-on-move is a Code-Red perf bug at 250 items. | [`02-data-flow.md`](./02-data-flow.md), [`mem://features/editor-core`](mem://features/editor-core) |
| AT-UISTATE-15 | Mirrored nodes MUST share the same source `Item` reference (NOT deep clones); deep-cloning mirrors is a Code-Red sync-divergence bug. | [`03-data-types.md`](./03-data-types.md), [`mem://features/mirroring`](mem://features/mirroring) |

---

## Verification

```bash
# Backend leak scan
rg -nP "supabase|sql\.js|IndexedDB|wordpress" spec/32-ui-design/02-state-and-data/

# Discriminated union default
rg -nP "switch\s*\(.*itemType\)" src/ -A 30 | grep -L "assertNever"

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-architecture/97-acceptance-criteria.md`](../01-architecture/97-acceptance-criteria.md) — Architecture contract
- [`../../02-coding-guidelines/02-typescript/97-acceptance-criteria.md`](../../02-coding-guidelines/02-typescript/97-acceptance-criteria.md) — TS rules
- [`../../35-enforcement-rules/97-acceptance-criteria.md`](../../35-enforcement-rules/97-acceptance-criteria.md) — Zod boundary SSOT
- [`mem://architecture/data-model`](mem://architecture/data-model) — Item interface SSOT

---

*Curated 2026-04-25 — closes batch-18 item 2. Replaces v1.0.1 scaffold.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
