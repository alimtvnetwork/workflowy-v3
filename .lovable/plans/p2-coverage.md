# P2 — AT → I/O Fixture Coverage Tracker

> **Updated:** 2026-04-28
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../../spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md)

| Sub-task | Scope | Files | AT rows | Fixtures landed | Status |
|----------|-------|-------|---------|-----------------|--------|
| P2a | App canonical (`AT-APP-01..107`) | 4 (`97a/b/c/d`) | 107 | 107 | ✅ done |
| P2b | App per-feature inline | 1 (`15a` covers 10 novel `AT-ROLES`; other 80 inline rows are pure dispatch aliases of P2a-covered ATs — no fixtures needed) | 10 | 10 | ✅ done |
| P2c | REST + DB conventions | 1 (`04-database-conventions/97a-…`) covers 13 + 11 = 24 leaf ATs across the two rollups | 24 | 24 | ✅ done |
| P2d | UI design + DS | ~14 | ~120 | 0 | todo |
| P2e | 33 / 34 / 35 / 36 | 4 | ~60 | 0 | todo |
| P2f | Coding-guidelines etc. (lint shape) | ~50 | ~400 | 0 | todo |
| P2g | Remainder | ~45 | ~300 | 0 | todo |

> Each `next` advances one sub-task. When all rows show ✅, hygiene check **AT-FIX-01** flips from report-only to enforcing and P2 is closed.
