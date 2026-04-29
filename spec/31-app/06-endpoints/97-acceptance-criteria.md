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


---

## Fixtures

- **Per-endpoint envelope JSON fixtures (P3):** [`./97b-endpoint-envelope-fixtures.md`](./97b-endpoint-envelope-fixtures.md) — canonical request/response samples for all 47 endpoints in [`./16-endpoint-at-matrix.md`](./16-endpoint-at-matrix.md), satisfying `AT-ENV-01`, `AT-ENV-02`, `AT-G19-01`, `AT-G22-01`, `AT-WPROOT-07`, `AT-AUTH-01`, `AT-RATE-01`.
- Remaining narrative ATs are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md).


---

## P13 stub rows

> Auto-appended by [`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs`](../../../scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [`40-generate-contract-json.mjs`](../../../scripts/spec-hygiene/40-generate-contract-json.mjs). Each row is a **placeholder definition** — replace the body with concrete Given/When/Then + JSON fixture during P2 (I/O table conversion). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-ENDPOINTS-01 — Endpoint coverage — Information model

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-08 — Endpoint coverage — Personas

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-09 — Endpoint coverage — Item context menu (duplicate)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-13 — Endpoint coverage — Board view (projection)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-15 — Endpoint coverage — Share dialog (list shares)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-20 — Endpoint coverage — Mirrors (create)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-23 — Endpoint coverage — Today view

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-24 — Endpoint coverage — Trash list

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-28 — Endpoint coverage — Search

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-32 — Endpoint coverage — Templates

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-37 — Endpoint coverage — Multi-select bulk ops

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENDPOINTS-40 — Endpoint coverage — Concurrency / sync

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

---

### AT-WIRE-EGRESS-01 — PHP serializer egress test (OwnerId canonical wire key)

| AT ID | Summary | Source |
|---|---|---|
| `AT-WIRE-EGRESS-01` | PHP serializer egress: every wire payload emits `OwnerId`, never `OwnerUserId`. | [`97b-endpoint-envelope-fixtures.md` §AT-WIRE-EGRESS-01](./97b-endpoint-envelope-fixtures.md#at-wire-egress-01--php-serializer-egress-test-ownerid-canonical) |

**Canonical definition:** see source above — registered here per APP-FIX-14 / G-30 (every cited AT MUST resolve to a table-row declaration in a `97-acceptance-criteria.md` file in scope).

**Bound gate:** `G-26-WIRE-OWNERID-ONLY` (CI + TEST dual tier; this AT is the TEST half).

**Coverage source:** [`16-endpoint-at-matrix.md`](./16-endpoint-at-matrix.md) `Owner` column (33 owner-bearing endpoints as of v1.2.0).

**One-line assertion:** Every owner-bearing REST/SSE response payload emits the canonical key `OwnerId` and **never** the DDL spelling `OwnerUserId`, verified by PHPUnit dispatch through `rest_do_request()` against an in-memory SQLite fixture seeded with at least one row per owner-bearing table. Authority: [ADR-0026 §D6](../../00-adrs/0026-lww-canonical-tiebreak.md).

