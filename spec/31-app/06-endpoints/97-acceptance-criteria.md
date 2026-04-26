# Endpoints — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** ✅ Dispatch index — per-endpoint ACs live inline in each topic file
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for the 16 topic file(s) in this folder. ID range: `AT-ENDPOINTS-NN`.

A criterion is *complete* when (a) it has a stable ID, (b) it references a source file, and (c) it is verifiable by reading the source or running an automated check.

---

## Coverage Map

| # | Source File | ID Range | Status |
|---|-------------|----------|--------|
| 1 | [`01-information-model.md`](./01-information-model.md) | AT-ENDPOINTS-01..07 | ✅ Inline — 7 endpoint definitions (EP-ITEMS-LIST through EP-ITEMS-ROOT) |
| 2 | [`02-personas.md`](./02-personas.md) | AT-ENDPOINTS-08 | ✅ Inline — 1 endpoint (EP-PERSONAS-ME) |
| 3 | [`03-layout-structure.md`](./03-layout-structure.md) | — | ✅ N/A — UI-only feature, no server endpoints |
| 4 | [`04-page-content-area.md`](./04-page-content-area.md) | — | ✅ N/A — UI-only feature, no server endpoints |
| 5 | [`05-interactions.md`](./05-interactions.md) | — | ✅ N/A — UI-only feature, no server endpoints |
| 6 | [`06-item-context-menu.md`](./06-item-context-menu.md) | AT-ENDPOINTS-09..12 | ✅ Inline — 4 endpoints (duplicate, complete, turn-into, tags) |
| 7 | [`07-board-view.md`](./07-board-view.md) | AT-ENDPOINTS-13..14 | ✅ Inline — 2 endpoints (board projection, board move) |
| 8 | [`08-share-dialog.md`](./08-share-dialog.md) | AT-ENDPOINTS-15..19 | ✅ Inline — 5 endpoints (list shares, invite, update role, revoke, public toggle) |
| 9 | [`09-mirrors.md`](./09-mirrors.md) | AT-ENDPOINTS-20..22 | ✅ Inline — 3 endpoints (create mirror, list mirrors, detach mirror) |
| 10 | [`10-today-view.md`](./10-today-view.md) | AT-ENDPOINTS-23 | ✅ Inline — 1 endpoint (today aggregation) |
| 11 | [`11-trash-view.md`](./11-trash-view.md) | AT-ENDPOINTS-24..27 | ✅ Inline — 4 endpoints (list trash, restore, hard-delete, empty trash) |
| 12 | [`12-multi-select.md`](./12-multi-select.md) | AT-ENDPOINTS-28..31 | ✅ Inline — 4 bulk endpoints (bulk move, bulk delete, bulk complete, bulk tags) |
| 13 | [`13-templates.md`](./13-templates.md) | AT-ENDPOINTS-32..36 | ✅ Inline — 5 endpoints (list, save, fetch, apply, delete template) |
| 14 | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | AT-ENDPOINTS-37..39 | ✅ Inline — 3 endpoints (SSE stream, poll fallback, sync ack) |
| 15 | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | AT-ENDPOINTS-40..42 | ✅ Inline — 3 endpoints (list roles, assign role, revoke role) |

---

## Criteria

Per-topic criteria are tracked inline in each source file's per-endpoint sections. Each endpoint definition includes:
- Stable ID (e.g. `EP-ITEMS-LIST`)
- Method + Path
- Auth requirements
- Request/response shapes
- Error codes
- Side effects
- AC refs linking to canonical `AT-APP-NN` criteria

---

## Verification

```bash
# List all endpoint IDs in this folder
grep -rn "EP-" spec/31-app/06-endpoints/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Endpoint catalogue + load-bearing rules
- [`../01-features/00-overview.md`](../01-features/00-overview.md) — Feature behavior contracts
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Canonical `AT-APP-NN` criteria
- [`../../04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/00-overview.md) — Universal envelope format

---

*Dispatch index v1.0.0 — promoted from scaffold 2026-04-26. All 15 topic files have inline endpoint definitions with stable IDs.*
