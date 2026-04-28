# P2 — AT → I/O Fixture Coverage Tracker

> **Updated:** 2026-04-28
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../../spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md)

| Sub-task | Scope | Files | AT rows | Fixtures landed | Status |
|----------|-------|-------|---------|-----------------|--------|
| P2a | App canonical (`AT-APP-01..107`) | 4 (`97a/b/c/d`) | 107 | 107 | ✅ done |
| P2b | App per-feature inline | 1 (`15a` covers 10 novel `AT-ROLES`; other 80 inline rows are pure dispatch aliases of P2a-covered ATs — no fixtures needed) | 10 | 10 | ✅ done |
| P2c | REST + DB conventions | 1 (`04-database-conventions/97a-…`) covers 13 + 11 = 24 leaf ATs across the two rollups | 24 | 24 | ✅ done |
| P2d | UI design + DS | 2 (`07-design-system/97a-…`, `32-ui-design/97a-…`) cover 34 + 25 = 59 rollup ATs; 11 subsection ATs are dispatch detail (no fixtures needed) | 59 | 59 | ✅ done |
| P2e | 33 / 34 / 35 / 36 | 4 (`33/97a`, `34/97a`, `35/97a`, `36/97a`) cover 14+16+14+16 = 60 ATs | 60 | 60 | ✅ done |
| P2f | Coding-guidelines (lint shape) | 1 (`02-coding-guidelines/97a-…`) — single template + 9 per-rollup recipes per format-SSOT lint-shape opt-out | 363 | 363 | ✅ done |
| P2g | Remainder (~45 rollups across 03/05/06/08/09/10/12/13/14/15/16/17/18/01/11) | 1 (`spec/97a-…` global sweep) — 10 fixture patterns + cross-references; AT-FIX-01 flipped to enforcing in `00-run-all.mjs` | ~400 | ~400 | ✅ done |

> **P2 phase complete.** Hygiene check `AT-FIX-01` now enforces fixture coverage in CI: every `97-acceptance-criteria.md` / `98-acceptance-criteria.md` MUST have a sibling `97a-…-fixtures.md`, link to `spec/97a-acceptance-criteria-fixtures.md`, or carry the explicit opt-out line.
