# CLI Examples (Split-DB) — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-CLIEXAMPLES-01` … `AT-CLIEXAMPLES-13`

> Examples in this folder demonstrate split-DB usage from CLI tools (aibridge, gsearch, brun, nexusflow). Every example MUST be runnable copy-paste against the reference schema.

---

## Criteria

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CLIEXAMPLES-01 | Every CLI example MUST resolve DB paths via the `DbManager` gateway (NOT hardcoded `*.sqlite` paths); hardcoded paths are a Code-Red split-DB bug. | [`00-overview.md`](./00-overview.md), [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) |
| AT-CLIEXAMPLES-02 | All CLI examples open per-DB pools (NOT one global pool); a single pool spanning Root/Domain/History/Cache is forbidden. | [`00-overview.md`](./00-overview.md) |

### AIBridge examples (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CLIEXAMPLES-03 | AIBridge examples write request/response audit rows ONLY to the History DB (NOT Root or Domain); writes to the wrong DB are a Code-Red separation bug. | [`01-aibridge-examples.md`](./01-aibridge-examples.md) |
| AT-CLIEXAMPLES-04 | AIBridge cache lookups query the Cache DB before falling back to the upstream provider; bypassing the Cache DB is a cost-control regression. | [`01-aibridge-examples.md`](./01-aibridge-examples.md) |

### GSearch examples (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CLIEXAMPLES-05 | GSearch indexes live in the Domain DB; querying the Root DB for search payloads is forbidden (it leaks search shape into shared metadata). | [`02-gsearch-examples.md`](./02-gsearch-examples.md) |
| AT-CLIEXAMPLES-06 | GSearch examples use parameterized FTS queries; user-supplied search terms concatenated into SQL are a Code-Red SQL-injection bug. | [`02-gsearch-examples.md`](./02-gsearch-examples.md), [`../../../15-wp-plugin-how-to/19-micro-orm-and-root-db/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/19-micro-orm-and-root-db/97-acceptance-criteria.md) |

### BRun examples (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CLIEXAMPLES-07 | BRun examples MUST write batch progress to the History DB and final results to the Domain DB; collapsing both to one DB violates split-DB separation. | [`03-brun-examples.md`](./03-brun-examples.md) |
| AT-CLIEXAMPLES-08 | BRun examples checkpoint after every batch (configurable via seedable-config), allowing resume; non-resumable batches are a reliability bug. | [`03-brun-examples.md`](./03-brun-examples.md) |

### Nexusflow examples (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CLIEXAMPLES-09 | Nexusflow node-execution traces land in History; node configurations land in Domain; cross-mixing is forbidden. | [`04-nexusflow-examples.md`](./04-nexusflow-examples.md) |
| AT-CLIEXAMPLES-10 | Nexusflow examples close DB handles deterministically (`defer db.Close()` in Go) — leaking handles across long-running flows is a Code-Red resource bug. | [`04-nexusflow-examples.md`](./04-nexusflow-examples.md) |

### Reset API tables (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CLIEXAMPLES-11 | The reset-API examples MUST follow the `02-reset-api-standard.md` envelope contract; ad-hoc reset endpoints are forbidden. | [`05-reset-api-tables.md`](./05-reset-api-tables.md), [`../02-reset-api-standard.md`](../02-reset-api-standard.md) |
| AT-CLIEXAMPLES-12 | Reset operations are scoped per-DB (`reset(scope: 'history')`) and MUST emit a structured log entry naming the scope + row counts before/after; silent resets are forbidden. | [`05-reset-api-tables.md`](./05-reset-api-tables.md) |
| AT-CLIEXAMPLES-13 | Reset MUST require an explicit confirmation flag (`--confirm`) at the CLI; one-shot reset without confirmation is a Code-Red operational bug. | [`05-reset-api-tables.md`](./05-reset-api-tables.md) |

---

## Verification

```bash
# Hardcoded *.sqlite paths
rg -nP "['\"][^'\"]+\\.sqlite['\"]" examples/ cmd/ | grep -v 'DbManager\|tests/'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) — Split-DB fundamentals
- [`../02-reset-api-standard.md`](../02-reset-api-standard.md) — Reset API SSOT

---

*Curated 2026-04-25 — closes A-25 (batch 14). Replaces v0.1.0 stub.*
