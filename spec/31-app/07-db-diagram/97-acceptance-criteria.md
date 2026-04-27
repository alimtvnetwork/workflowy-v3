# DB Diagram — Acceptance Criteria

> **Version:** 1.0.1
> **Updated:** 2026-04-27 (UTC+8) — Patch: fixed broken link to `14-concurrency-and-sync.md` (corrected path from `../` to `../01-features/`). Closes hygiene check `03-check-links.mjs`. Prior: 2026-04-27 (UTC+8) v1.0.0 — Full curation, 21 criteria authored.
> **Status:** ✅ Curated — every ERD source file has a verifiable rollup criterion. Stub status retired.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 1. Purpose

This rollup is the **discovery anchor** for ERD-folder verification. The 7 diagram files are visual SSOTs (Mermaid + prose), so most criteria are *structural* — assertable by parsing the Mermaid block, the table list, or the index DDL — rather than runtime tests.

A criterion is *complete* when (a) it has a stable ID, (b) it cites a source file, and (c) it is verifiable by reading the source or running an automated check.

ID range: `AT-DBDIAGRAM-NN`. **Total criteria: 21** (3 per source file).

---

## 2. Coverage Map

| # | Source File | Range | Count |
|---|-------------|-------|:-----:|
| 1 | [`01-master-erd.md`](./01-master-erd.md) | `AT-DBDIAGRAM-01..03` | 3 |
| 2 | [`02-root-db-erd.md`](./02-root-db-erd.md) | `AT-DBDIAGRAM-04..06` | 3 |
| 3 | [`03-app-db-erd.md`](./03-app-db-erd.md) | `AT-DBDIAGRAM-07..09` | 3 |
| 4 | [`04-feature-slices.md`](./04-feature-slices.md) | `AT-DBDIAGRAM-10..12` | 3 |
| 5 | [`05-lifecycle-flows.md`](./05-lifecycle-flows.md) | `AT-DBDIAGRAM-13..15` | 3 |
| 6 | [`06-indexes.md`](./06-indexes.md) | `AT-DBDIAGRAM-16..18` | 3 |
| 7 | [`07-migrations.md`](./07-migrations.md) | `AT-DBDIAGRAM-19..21` | 3 |

---

## 3. Criteria

### 3.1 — `01-master-erd.md` (All tables, both DBs)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-01 | The master ERD Mermaid block | Parsed | Lists every table that appears in `02-root-db-erd.md` ∪ `03-app-db-erd.md` (no missing, no orphan) | `master-erd-completeness` |
| AT-DBDIAGRAM-02 | A new table is added to either DB-specific ERD | Static check runs | Master ERD includes the same table within the same commit | `master-erd-bidirectional-parity` |
| AT-DBDIAGRAM-03 | The master ERD is rendered | Visual review | Each table shows its DB partition (Root vs App) via colour or grouping | `master-erd-partition-marker` |

### 3.2 — `02-root-db-erd.md` (Root DB scope)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-04 | The Root-DB ERD | Parsed | Contains only tables that hold tenant-spanning state (Users, Workspaces, Sessions, RefreshTokens, MfaFactors, AuditChain) | `root-db-scope-correct` |
| AT-DBDIAGRAM-05 | A foreign-key arrow in the Root-DB ERD | Inspected | Targets only another Root-DB table (no cross-DB FKs — App DB references Root by ID copy, not constraint) | `root-db-no-cross-db-fk` |
| AT-DBDIAGRAM-06 | A new Root-DB table is added | Migration scan runs | Corresponding `Migrations/NNNN_*.sql` file exists in Root migration sequence | `root-db-migration-pairing` |

### 3.3 — `03-app-db-erd.md` (App DB, per workspace)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-07 | The App-DB ERD | Parsed | Every table includes the columns required by the unified `Items` model (Id, ParentId, Content, ItemType, FractionalSort, …) where applicable | `app-db-items-shape` |
| AT-DBDIAGRAM-08 | A workspace is provisioned | Schema check runs | A fresh App DB is created from `Migrations/` with **all** tables shown in this ERD (no missing, no extra) | `app-db-provision-parity` |
| AT-DBDIAGRAM-09 | The Mirrors table is depicted | Inspected | Self-FK (`MirrorOf → Items.Id`) is shown and `BrokenAt` column is present (per `14-concurrency-and-sync.md` §14.4 LWW rule) | `app-db-mirror-shape` |

### 3.4 — `04-feature-slices.md` (One ERD per feature)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-10 | A feature in `spec/31-app/01-features/` defines a new table | Slice scan runs | A matching ERD slice exists in this file with the same table + columns | `slice-feature-parity` |
| AT-DBDIAGRAM-11 | A slice ERD is rendered | Visual review | Slice contains only tables and FKs relevant to that feature (no global noise) | `slice-scope-narrow` |
| AT-DBDIAGRAM-12 | A column appears in two slices | Cross-slice check | Column definition (type + nullability) is byte-identical across slices | `slice-column-consistency` |

### 3.5 — `05-lifecycle-flows.md` (State transitions)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-13 | An Item lifecycle flow (created → edited → trashed → purged → restored) | Diagram parsed | Every state has at least one entry edge and one exit edge (no dead states except `purged`) | `lifecycle-no-dead-state` |
| AT-DBDIAGRAM-14 | A state transition fires in source code | Audit check runs | Corresponding `AuditChain` action exists for that transition (per `09-audit-log-policy.md`) | `lifecycle-audit-pairing` |
| AT-DBDIAGRAM-15 | The Trash → Purge transition | Inspected | Diagram cites the 30-day retention rule (per `mem://features/trash-logic`) | `lifecycle-trash-retention` |

### 3.6 — `06-indexes.md` (Index inventory)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-16 | An index declared in this file | Migration scan runs | Same `CREATE INDEX` statement exists in `Migrations/NNNN_*.sql` (byte-identical normalised) | `indexes-migration-parity` |
| AT-DBDIAGRAM-17 | A query path documented in a feature spec (`01-features/`) | Plan check | An index in this file covers it (no full table scans on hot paths) | `indexes-cover-hot-paths` |
| AT-DBDIAGRAM-18 | An index is added in a migration | Documentation check | Row added to this file in the same commit | `indexes-doc-pairing` |

### 3.7 — `07-migrations.md` (Migration roadmap)

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-DBDIAGRAM-19 | A migration listed in the roadmap | File scan runs | A matching `Migrations/NNNN_*.sql` file exists per `31-wp-plugin-folder-skeleton.md` §1 naming rule | `migrations-roadmap-parity` |
| AT-DBDIAGRAM-20 | Migration order in this file | Numeric scan | Strictly monotonic 4-digit prefixes (`0001`, `0002`, …) with no gaps and no duplicates | `migrations-monotonic` |
| AT-DBDIAGRAM-21 | A merged migration | Edit check | Never edited after merge (forward-only); changes go to a new migration | `migrations-forward-only` |

---

## 4. Verification

```bash
# Every ID 01..21 should be cited at least in this file
for n in $(seq -w 1 21); do
  hits=$(rg -c "AT-DBDIAGRAM-$n\b" spec/31-app/07-db-diagram/ 2>/dev/null | wc -l)
  echo "AT-DBDIAGRAM-$n: $hits"
done

# Hygiene runner
node scripts/spec-hygiene/00-run-all.mjs
```

---

## 5. Cross-References

| Topic | Link |
|-------|------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| Top-level app rollup | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) |
| Conventions rollup | [`../05-conventions/97-acceptance-criteria.md`](../05-conventions/97-acceptance-criteria.md) |
| WP-plugin folder skeleton (Migrations/ naming) | [`../05-conventions/31-wp-plugin-folder-skeleton.md`](../05-conventions/31-wp-plugin-folder-skeleton.md) |
| Audit-log policy (lifecycle audit pairing) | [`../05-conventions/09-audit-log-policy.md`](../05-conventions/09-audit-log-policy.md) |
| Concurrency + LWW (Mirrors.BrokenAt) | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) |
| Glossary | [`spec/19-glossary.md`](../../19-glossary.md) |
| Enum registry | [`spec/20-enums-index.md`](../../20-enums-index.md) |

---

## 6. Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-04-25 | Initial scaffold auto-generated by `13-generate-at-stubs.mjs` (closes F-09). 7 source files enumerated as `📝 To populate`. |
| 1.0.0 | 2026-04-27 | Full curation. 21 criteria authored (3 per ERD file) covering completeness, parity, scope, lifecycle audit pairing, index/migration symmetry, and forward-only migration rule. All `📝 To populate` markers retired. |
