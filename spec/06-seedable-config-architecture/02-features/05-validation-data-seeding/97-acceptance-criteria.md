# Validation Data Seeding — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-VALIDATIONDATASEEDING-01` … `AT-VALIDATIONDATASEEDING-14`

---

## Criteria

### Anti-pattern enforcement (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-01 | Hardcoded validation arrays in Go source files (e.g., `var allowedModels = []string{…}` with literal members) are FORBIDDEN — every such array MUST be sourced from `config.seed.json` via the `ValidationDataService`. Violations are a Code-Red configurability bug. | [`01-anti-pattern.md`](./01-anti-pattern.md) |
| AT-VALIDATIONDATASEEDING-02 | A static-analysis check (lint or grep) MUST flag any new hardcoded validation slice/map outside `config.seed.json`; bypassing the check requires an explicit `// SEED-EXEMPT: <reason>` comment that is reviewed in PR. | [`01-anti-pattern.md`](./01-anti-pattern.md) |

### Seed JSON format (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-03 | `config.seed.json` MUST be the single source of truth for validation arrays/lookups; duplicating the same list in code OR another seed file is forbidden (canonicalization rule). | [`02-config-seed-json.md`](./02-config-seed-json.md) |
| AT-VALIDATIONDATASEEDING-04 | Each entry MUST carry `category`, `key`, `value`, and `version` fields; missing any field MUST fail seed-load with a typed error (NOT a panic). | [`02-config-seed-json.md`](./02-config-seed-json.md) |

### Database storage (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-05 | Validation data MUST persist in the **Root DB** under a `validation_data` table with `(category, key)` as the composite primary key; per-user copies are forbidden (this data is global). | [`03-database-storage.md`](./03-database-storage.md), [`../../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-VALIDATIONDATASEEDING-06 | Schema migrations for `validation_data` MUST be idempotent (safe to re-run) and MUST NOT drop user-edited rows on upgrade. | [`03-database-storage.md`](./03-database-storage.md) |

### Typed constants (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-07 | Categories MUST be expressed as a typed Go enum (`type Category string` with named constants) — magic strings like `"embedding_models"` scattered through call-sites are forbidden. | [`04-go-typed-constants.md`](./04-go-typed-constants.md) |
| AT-VALIDATIONDATASEEDING-08 | Constant names MUST be `PascalCase` and grouped in a single `categories.go` file per package; alphabetical order is mandatory for diff-stability. | [`04-go-typed-constants.md`](./04-go-typed-constants.md) |

### Service implementation (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-09 | `ValidationDataService` MUST be the SOLE read path; bespoke `SELECT … FROM validation_data` queries in business code are forbidden. | [`05-validation-data-service.md`](./05-validation-data-service.md) |
| AT-VALIDATIONDATASEEDING-10 | The service MUST cache reads in-memory with a documented TTL (default 5 min) and MUST expose an `Invalidate(category)` hook so admin edits propagate within the next request. | [`05-validation-data-service.md`](./05-validation-data-service.md) |

### Categories & versioning (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-11 | Seed-version conflicts (DB version > seed version) MUST keep the DB row (user wins); version regressions MUST be logged at WARN level — silent overwrite is a Code-Red data-loss bug. | [`06-categories-and-versioning.md`](./06-categories-and-versioning.md) |
| AT-VALIDATIONDATASEEDING-12 | Each category MUST have a documented owner (team or individual) recorded in `06-categories-and-versioning.md`; orphan categories fail review. | [`06-categories-and-versioning.md`](./06-categories-and-versioning.md) |

### Runtime API & checklist (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VALIDATIONDATASEEDING-13 | The runtime API MUST expose `Get(category, key)` returning `(value, ok)` and `List(category)` returning `[]Entry`; mutation APIs (write/delete) MUST be admin-gated via the RBAC layer. | [`07-api-and-checklist.md`](./07-api-and-checklist.md), [`../../../05-split-db-architecture/02-features/04-rbac-casbin/97-acceptance-criteria.md`](../../../05-split-db-architecture/02-features/04-rbac-casbin/97-acceptance-criteria.md) |
| AT-VALIDATIONDATASEEDING-14 | Every new validation feature MUST tick all 7 boxes of the per-feature checklist (define → seed → store → enum → service → validator → tests); merging without the checklist completed is forbidden. | [`07-api-and-checklist.md`](./07-api-and-checklist.md) |

---

## Verification

```bash
# Hardcoded slice scan
rg -nP 'var\s+\w+\s*=\s*\[\](string|int)\{' --type go internal/ | grep -v 'SEED-EXEMPT'

# Magic-string category scan
rg -nP '"(embedding_models|similarity_thresholds|topk_caps)"' --type go internal/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) — Seedable-config fundamentals
- [`../../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) — Root DB placement
- [`../../../05-split-db-architecture/02-features/04-rbac-casbin/97-acceptance-criteria.md`](../../../05-split-db-architecture/02-features/04-rbac-casbin/97-acceptance-criteria.md) — Admin-only write gating

---

*Curated 2026-04-25 — closes batch-15 item 2. Replaces v0.1.0 stub.*
