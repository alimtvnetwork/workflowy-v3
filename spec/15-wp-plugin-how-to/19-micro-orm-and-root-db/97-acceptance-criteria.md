# Micro ORM And Root DB — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-MICROORMANDROOTDB-01` … `AT-MICROORMANDROOTDB-14`

---

## Criteria

### ORM shell & traits (files 01, 02, 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MICROORMANDROOTDB-01 | The ORM shell class is **fluent + immutable** — every chained call returns a new instance (NOT mutates `$this`); shared mutable query state is forbidden. | [`01-orm-shell-class.md`](./01-orm-shell-class.md) |
| AT-MICROORMANDROOTDB-02 | `WhereTrait` produces parameterized SQL ONLY (placeholders + bindings array); string concatenation of user input into WHERE clauses is a Code-Red SQL-injection bug. | [`02-orm-where-trait.md`](./02-orm-where-trait.md), [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) |
| AT-MICROORMANDROOTDB-03 | `QueryTrait` exposes `get`, `first`, `count`, `exists`, `pluck`; arbitrary `raw()` SQL is permitted ONLY behind a `Db::raw()` value object — bare strings are forbidden. | [`03-orm-query-trait.md`](./03-orm-query-trait.md) |
| AT-MICROORMANDROOTDB-04 | `MutationTrait` (`insert`/`update`/`upsert`/`delete`) requires an explicit WHERE on `update`/`delete`; an unconstrained `update`/`delete` (no WHERE) MUST throw a typed exception. | [`04-orm-mutation-trait.md`](./04-orm-mutation-trait.md) |

### Usage examples & root DB (files 05, 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MICROORMANDROOTDB-05 | Every example in §05 MUST be runnable copy-paste against the reference schema (CI doc-test verifies); broken examples fail review. | [`05-usage-examples.md`](./05-usage-examples.md) |
| AT-MICROORMANDROOTDB-06 | The Root DB is the WP `$wpdb` connection wrapped by the ORM; direct `$wpdb` access in business code is forbidden — go through the ORM. | [`06-root-db.md`](./06-root-db.md), [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) |
| AT-MICROORMANDROOTDB-07 | Root DB tables use the WP table prefix from `$wpdb->prefix` + plugin-scoped suffix (`{$prefix}riseup_<table>`); hardcoded `wp_` prefixes are a Code-Red multi-site bug. | [`06-root-db.md`](./06-root-db.md) |

### Key patterns summary (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MICROORMANDROOTDB-08 | The §07 patterns checklist (parameterized SQL, immutable chain, explicit WHERE on mutations, prefixed tables, typed return) is the merge gate for ORM PRs; a PR violating any pattern fails review. | [`07-key-patterns-summary.md`](./07-key-patterns-summary.md) |
| AT-MICROORMANDROOTDB-09 | Identifier casing in the Root DB MUST match the cross-language naming SSOT — PascalCase columns; snake_case columns in new tables fail review. | [`07-key-patterns-summary.md`](./07-key-patterns-summary.md), [`../../02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/02-database-casing.md`](../../02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/02-database-casing.md) |

### Typed query (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MICROORMANDROOTDB-10 | Typed query returns hydrate into `readonly` value-object DTOs (NOT associative arrays); a service method declared `: array` for a row result is forbidden in new code. | [`08-typed-query.md`](./08-typed-query.md), [`../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) |
| AT-MICROORMANDROOTDB-11 | Typed query MUST throw a typed exception on column-mismatch between DB row and DTO (missing/extra columns); silent ignores are forbidden. | [`08-typed-query.md`](./08-typed-query.md) |

### File cache (file 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MICROORMANDROOTDB-12 | File cache uses an atomic write-then-rename pattern (write to `<file>.tmp` then `rename`); partial-write corruption is a Code-Red durability bug. | [`09-file-cache.md`](./09-file-cache.md) |
| AT-MICROORMANDROOTDB-13 | Cache files store an explicit version stamp + TTL header; reading a cache file without checking version+TTL is forbidden (stale-data risk). | [`09-file-cache.md`](./09-file-cache.md) |
| AT-MICROORMANDROOTDB-14 | Cache invalidation MUST be exposed via a single `Cache::invalidate(key)` API — scattered `unlink()` calls outside the cache helper are forbidden. | [`09-file-cache.md`](./09-file-cache.md), [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) |

---

## Verification

```bash
# Raw $wpdb in business code
rg -n '\$wpdb->' includes/ | grep -v 'Helpers/Db/\|tests/\|Orm/'

# String-concatenated WHERE clauses
rg -nP "WHERE\s+\\\$\\w+\s*=\s*['\"]?\\\$" includes/

# Hardcoded wp_ prefix
rg -nP "['\"]wp_[a-z]" includes/ | grep -v 'wp_check\|wp_remote\|wp_send\|wp_verify\|wp_date'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) — DB access policy
- [`../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) — Split DB architecture
- [`../../02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/02-database-casing.md`](../../02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/02-database-casing.md) — DB casing rules

---

*Curated 2026-04-25 — closes A-24 (batch 13). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
