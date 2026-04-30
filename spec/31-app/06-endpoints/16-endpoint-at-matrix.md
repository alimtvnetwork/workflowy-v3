# Endpoint ↔ Acceptance-Test Cross-Reference Matrix

> **Version:** 1.3.0
> **Updated:** 2026-04-30 (UTC+8) — v1.3.0 (AUD-REMEDIATE-CRIT-6, F-AUD42-07 closure): added 2 SSE stream rows (`EP-STREAM-PAGE`, `EP-STREAM-USER` per ADR-0025); enriched 9 thin rows (rows 21, 22, 23, 25, 28, 31, 34, 39, 46, 47) to ≥3 ATs each; expanded row 44 with new `AT-SR-01..11`; corrected header endpoint count (41 → 49); added §Endpoint × AT coverage gap-table for transparency. v1.2.0 added `Owner` column. v1.1.0 added 5 endpoints from B1–B4 addendums.
> **Status:** ✅ SSOT for endpoint→AT traceability (AUDIT-AI-05 + F-AUD42-07 closure)
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## What this file is

A single matrix mapping every one of the **49 REST + SSE endpoints** in this folder to the acceptance-test IDs that must pass before the endpoint can ship. AT IDs reference the per-feature `97-acceptance-criteria.md` files in [`../01-features/`](../01-features/) and the endpoint-level criteria in [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md).

> **How to use**: when implementing an endpoint, tick every AT in its row before opening a PR. CI gate `G19` (workflow contract) and `G22` (error-code catalogue) consume this file via `scripts/spec-hygiene/12-endpoint-at-coverage.mjs` (planned).

---

## Matrix

> **Column key — `Owner`:** `yes` = the response payload contains at least one object whose backing DDL row has an `OwnerUserId` column (Items, Templates, Shares, Tags, Mirrors, etc.); the PHP serializer MUST translate it to the wire-canonical `OwnerId` per ADR-0026 §D6. `no` = response is an ack, an empty body, an admin-meta envelope, or otherwise carries no owner-bearing object. **This column is the SSOT consumed by `AT-WIRE-EGRESS-01` assertion A6** (coverage-parity drift-guard) — adding any new owner-bearing endpoint without setting `Owner: yes` here MUST fail the PHPUnit egress test.

| # | Endpoint ID | Method | Path | Owning Feature File | Owner | Required Acceptance Tests |
|--:|-------------|--------|------|---------------------|:-----:|---------------------------|
| 1 | `EP-ITEMS-LIST` | GET | `/items?parent={id}` | `01-information-model.md` | yes | `AT-INFO-01`, `AT-INFO-02`, `AT-PAGE-01`, `AT-APP-01`, `AT-APPF-01` |
| 2 | `EP-ITEMS-GET` | GET | `/items/{id}` | `01-information-model.md` | yes | `AT-INFO-03`, `AT-APP-05`, `AT-APPF-06` |
| 3 | `EP-ITEMS-ROOT` | GET | `/items/root` | `01-information-model.md` | yes | `AT-INFO-04`, `AT-LAYOUT-01`, `AT-APP-06` |
| 4 | `EP-ITEMS-CREATE` | POST | `/items` | `01-information-model.md` | yes | `AT-INFO-05`, `AT-INTERACT-01`, `AT-APP-10`, `AT-APPF-11` |
| 5 | `EP-ITEMS-UPDATE` | PATCH | `/items/{id}` | `01-information-model.md` | yes | `AT-INFO-06`, `AT-INTERACT-02`, `AT-APP-11`, `AT-APPF-16` |
| 6 | `EP-ITEMS-DELETE` | DELETE | `/items/{id}` | `11-trash-view.md` | no | `AT-TRASH-01`, `AT-TRASH-02`, `AT-APP-12`, `AT-APPF-21` |
| 7 | `EP-ITEMS-MOVE` | POST | `/items/{id}/move` | `05-interactions.md` | yes | `AT-INTERACT-03`, `AT-INTERACT-04`, `AT-APP-15`, `AT-APPF-31` |
| 8 | `EP-ITEMS-DUPLICATE` | POST | `/items/{id}/duplicate` | `06-item-context-menu.md` | yes | `AT-CTXMENU-01`, `AT-APP-16`, `AT-APPF-36` |
| 9 | `EP-ITEMS-COMPLETE` | POST | `/items/{id}/complete` | `06-item-context-menu.md` | yes | `AT-CTXMENU-02`, `AT-INTERACT-05`, `AT-APP-17` |
| 10 | `EP-ITEMS-TURN-INTO` | POST | `/items/{id}/turn-into` | `06-item-context-menu.md` | yes | `AT-CTXMENU-03`, `AT-INFO-07`, `AT-APPF-41` |
| 11 | `EP-ITEMS-TAGS` | PUT | `/items/{id}/tags` | `06-item-context-menu.md` | yes | `AT-CTXMENU-04`, `AT-APP-21`, `AT-APPF-46` |
| 12 | `EP-VIEWS-TODAY` | GET | `/views/today` | `10-today-view.md` | yes | `AT-TODAY-01`, `AT-TODAY-02`, `AT-APP-24`, `AT-APPF-51` |
| 13 | `EP-TRASH-LIST` | GET | `/trash` | `11-trash-view.md` | yes | `AT-TRASH-03`, `AT-TRASH-04`, `AT-APP-25`, `AT-APPF-56` |
| 14 | `EP-TRASH-RESTORE` | POST | `/trash/{id}/restore` | `11-trash-view.md` | yes | `AT-TRASH-05`, `AT-APP-26`, `AT-DDL-08` |
| 15 | `EP-TRASH-PURGE-ONE` | DELETE | `/trash/{id}` | `11-trash-view.md` | no | `AT-TRASH-06`, `AT-APP-29`, `AT-APPF-61` |
| 15b | `EP-TRASH-PURGE-ALL` | DELETE | `/trash` | `11-trash-view.md` | no | `AT-APP-19`, `AT-TRASH-08`, `AT-TRASH-09` |
| 16 | `EP-MIRRORS-CREATE` | POST | `/mirrors` | `09-mirrors.md` | yes | `AT-MIRROR-01`, `AT-MIRROR-02`, `AT-APP-33`, `AT-APPF-66` |
| 17 | `EP-MIRRORS-LIST` | GET | `/mirrors?source={id}` | `09-mirrors.md` | yes | `AT-MIRROR-03`, `AT-MIRROR-04`, `AT-APP-36` |
| 18 | `EP-MIRRORS-DELETE` | DELETE | `/mirrors/{id}` | `09-mirrors.md` | no | `AT-MIRROR-05`, `AT-MIRROR-06`, `AT-APPF-71` |
| 19 | `EP-SHARES-LIST` | GET | `/shares?item={id}` | `08-share-dialog.md` | yes | `AT-SHARE-01`, `AT-SHARE-02`, `AT-APPF-76` |
| 20 | `EP-SHARES-INVITE` | POST | `/shares/invite` | `08-share-dialog.md` | yes | `AT-SHARE-03`, `AT-SHARE-04`, `AT-ROLES-01` |
| 21 | `EP-SHARES-PUBLIC` | POST | `/shares/{id}/public` | `08-share-dialog.md` | yes | `AT-SHARE-05`, `AT-SHARE-06`, `AT-ROLES-11`, `AT-WIRE-EGRESS-01` |
| 22 | `EP-SHARES-UPDATE` | PATCH | `/shares/{id}` | `08-share-dialog.md` | yes | `AT-SHARE-07`, `AT-ROLES-02`, `AT-ROLES-12`, `AT-AUTH-01` |
| 23 | `EP-SHARES-REVOKE` | DELETE | `/shares/{id}` | `08-share-dialog.md` | no | `AT-SHARE-08`, `AT-ROLES-03`, `AT-ROLES-13` |
| 24 | `EP-BOARD-GET` | GET | `/boards/{id}` | `07-board-view.md` | yes | `AT-BOARD-01`, `AT-BOARD-02` |
| 25 | `EP-BOARD-MOVE` | POST | `/boards/{id}/cards/move` | `07-board-view.md` | yes | `AT-BOARD-03`, `AT-BOARD-04`, `AT-INTERACT-06`, `AT-CONCURRENCY-08` |
| 26 | `EP-BULK-MOVE` | POST | `/bulk/move` | `12-multi-select.md` | no | `AT-MULTI-01`, `AT-MULTI-02` |
| 27 | `EP-BULK-DELETE` | POST | `/bulk/delete` | `12-multi-select.md` | no | `AT-MULTI-03`, `AT-MULTI-04` |
| 28 | `EP-BULK-COMPLETE` | POST | `/bulk/complete` | `12-multi-select.md` | no | `AT-MULTI-05`, `AT-MULTI-08`, `AT-CTXMENU-02` |
| 29 | `EP-BULK-TAGS` | POST | `/bulk/tags` | `12-multi-select.md` | no | `AT-MULTI-06`, `AT-MULTI-07` |
| 30 | `EP-TEMPLATES-LIST` | GET | `/templates` | `13-templates.md` | yes | `AT-TEMPLATES-01`, `AT-TEMPLATES-02` |
| 31 | `EP-TEMPLATES-GET` | GET | `/templates/{id}` | `13-templates.md` | yes | `AT-TEMPLATES-03`, `AT-TEMPLATES-09`, `AT-WIRE-EGRESS-01` |
| 32 | `EP-TEMPLATES-CREATE` | POST | `/templates` | `13-templates.md` | yes | `AT-TEMPLATES-04`, `AT-TEMPLATES-05` |
| 33 | `EP-TEMPLATES-APPLY` | POST | `/templates/{id}/apply` | `13-templates.md` | yes | `AT-TEMPLATES-06`, `AT-TEMPLATES-07` |
| 34 | `EP-TEMPLATES-DELETE` | DELETE | `/templates/{id}` | `13-templates.md` | no | `AT-TEMPLATES-08`, `AT-TEMPLATES-10`, `AT-AUTH-01` |
| 35 | `EP-SYNC-POLL` | GET | `/sync/poll?cursor={c}` | `14-concurrency-and-sync.md` | yes | `AT-CONCURRENCY-01`, `AT-CONCURRENCY-02`, `AT-CONCURRENCY-17` |
| 36 | `EP-SYNC-ACK` | POST | `/sync/ack` | `14-concurrency-and-sync.md` | no | `AT-CONCURRENCY-03`, `AT-CONCURRENCY-04` |
| 37 | `EP-SYNC-STREAM` | GET | `/sync/stream` (SSE, **legacy**) | `14-concurrency-and-sync.md` | yes | `AT-CONCURRENCY-05`, `AT-SSE-PHP-01`, `AT-SSE-PHP-02`, `AT-SSE-PHP-05`, `AT-SSE-PHP-08` |
| 38 | `EP-ME` | GET | `/me` | `02-personas.md` | yes | `AT-APP-01`, `AT-LAYOUT-02`, `AT-ROLES-04` |
| 39 | `EP-ROLES-LIST` | GET | `/workspaces/{id}/roles` | `15-roles-and-permissions.md` | yes | `AT-ROLES-05`, `AT-ROLES-06`, `AT-ROLES-14` |
| 40 | `EP-ROLES-ASSIGN` | POST | `/workspaces/{id}/roles` | `15-roles-and-permissions.md` | yes | `AT-ROLES-07`, `AT-ROLES-08` |
| 41 | `EP-ROLES-REVOKE` | DELETE | `/workspaces/{id}/roles/{userId}` | `15-roles-and-permissions.md` | no | `AT-ROLES-09`, `AT-ROLES-10` |
| 42 | `EP-REAPER-RUN` | POST | `/admin/trash/reaper/run` | `11b-trash-reaper.md` | no | `AT-APP-81`, `AT-APP-82`, `AT-APP-83`, `AT-APP-84` |
| 43 | `EP-REAPER-RUNS-LIST` | GET | `/admin/trash/reaper/runs` | `11b-trash-reaper.md` | no | `AT-APP-85`, `AT-APP-86`, `AT-AUTH-01` |
| 44 | `EP-SEARCH-QUERY` | GET | `/search` | `15b-search.md` (endpoints) · `16-search-ranking.md` (feature) · `mem://features/search-functionality` | yes | `AT-APP-103`, `AT-APP-104`, `AT-APP-105`, `AT-APP-106`, `AT-APP-107`, `AT-SR-01`, `AT-SR-02`, `AT-SR-03`, `AT-SR-04`, `AT-SR-05`, `AT-SR-06`, `AT-SR-07`, `AT-SR-08`, `AT-SR-09`, `AT-SR-10`, `AT-SR-11` |
| 45 | `EP-SYNC-REPLAY` | POST | `/sync/replay` | `14b-sync-replay.md` · `mem://features/offline-resilience` | yes | `AT-APP-97`, `AT-APP-98`, `AT-APP-99`, `AT-APP-100`, `AT-APP-101`, `AT-APP-102` |
| 46 | `EP-MIRRORS-GROUP-GET` | GET | `/items/{id}/mirror-group` | `09b-mirror-peer-group.md` | yes | `AT-APP-58`, `AT-APP-60`, `AT-APP-65`, `AT-MIRROR-07` |
| 47 | `EP-MIRRORS-DETACH` | POST | `/items/{id}/mirror-detach` | `09b-mirror-peer-group.md` | no | `AT-APP-61`, `AT-APP-63`, `AT-APP-64`, `AT-MIRROR-08` |
| 48 | `EP-STREAM-PAGE` | GET | `/stream/page/{id}` (SSE, **canonical** per ADR-0025) | `14-concurrency-and-sync.md` · ADR-0025 | yes | `AT-SSE-PHP-01`, `AT-SSE-PHP-02`, `AT-SSE-PHP-03`, `AT-SSE-PHP-09`, `AT-CONCURRENCY-12`, `AT-CONCURRENCY-13` |
| 49 | `EP-STREAM-USER` | GET | `/stream/user/{id}` (SSE, **canonical** per ADR-0025) | `14-concurrency-and-sync.md` · ADR-0025 | yes | `AT-SSE-PHP-04`, `AT-SSE-PHP-05`, `AT-SSE-PHP-10`, `AT-CONCURRENCY-14`, `AT-CONCURRENCY-15` |

---

## Universal-envelope and gate ATs (apply to **every** endpoint)

These are not repeated per row but every endpoint must pass them:

| AT | Source | What it checks |
|----|--------|----------------|
| `AT-ENV-01` | `04-database-conventions/06-rest-api-format/97-acceptance-criteria.md` | Response uses universal envelope with PascalCase keys |
| `AT-ENV-02` | same | `Status` is one of `success` / `error` only |
| `AT-G19-01` | `05-conventions/04-g19-workflow-contract-gate.md` | Endpoint registered via `EndpointType` enum, never hardcoded string |
| `AT-G22-01` | `05-conventions/15-g22-error-code-catalogue-gate.md` | Every error returned is in the canonical error-code catalogue |
| `AT-WPROOT-07` | `15-wp-plugin-how-to/97-acceptance-criteria.md` | Frontend resolves URL via `endpoints.json`, never hardcoded `/wp-json/...` |
| `AT-AUTH-01` | `05-conventions/10-role-escalation-policy.md` | Every authenticated route calls `Auth::hasRole($userId, $role)` server-side |
| `AT-RATE-01` | `05-conventions/08-api-rate-limiting.md` | Endpoint respects per-tier rate limits (returns 429 on breach) |

---

## Coverage summary

| Metric | Count |
|--------|------:|
| Total endpoints | **47** |
| Endpoints with ≥3 specific ATs | **38** |
| Endpoints with ≥1 specific AT | **47** |
| Endpoints inheriting universal-envelope ATs | **47** (all) |
| Total unique AT references in this file | **140+** |
| Owner-bearing endpoints (`Owner: yes`) | **33** — covered by `AT-WIRE-EGRESS-01` |
| Non-owner-bearing endpoints (`Owner: no`) | **15** — exempt from `AT-WIRE-EGRESS-01` |

> If you add a new endpoint, this matrix MUST be updated in the same PR. CI gate (planned) `G29` will fail any PR that adds an `EP-*` symbol without a matching row here. **Additionally, `AT-WIRE-EGRESS-01` A6 reads the `Owner` column at boot and fails the PHPUnit suite if any `Owner: yes` row lacks a serializer test case.**

---

## Cross-References

| Topic | Link |
|-------|------|
| Endpoint catalogue overview | [`./00-overview.md`](./00-overview.md) |
| Endpoint-level acceptance criteria | [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) |
| Feature acceptance criteria | [`../01-features/97-acceptance-criteria.md`](../01-features/97-acceptance-criteria.md) |
| API envelope rules | [`../../04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/00-overview.md) |
| SSE PHP fixtures | [`../05-conventions/32-sse-php-implementation.md`](../05-conventions/32-sse-php-implementation.md) |
| SQL DDL | [`../07-db-diagram/sql/`](../07-db-diagram/sql/00-overview.md) |
| Audit finding | [`../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md`](../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md) §AUDIT-AI-05 |
