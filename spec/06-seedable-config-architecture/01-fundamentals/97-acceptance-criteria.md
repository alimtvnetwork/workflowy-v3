# Seedable Config Architecture — Fundamentals — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-SEEDABLECONFIGFUNDAMENTALS-01` … `AT-SEEDABLECONFIGFUNDAMENTALS-15`

---

## Criteria

### Version flow (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-01 | The version-detection flow in §01 decides **merge vs skip** by comparing `config.seed.json.version` against `ConfigMeta.version` in the DB; no other input is consulted. | [`01-version-flow.md`](./01-version-flow.md) |
| AT-SEEDABLECONFIGFUNDAMENTALS-02 | Merge is **additive**: new keys are inserted, existing user-overridden values are preserved (NEVER overwritten); the merge algorithm in §01 is the SSOT. | [`01-version-flow.md`](./01-version-flow.md) |

### File specifications (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-03 | The pattern requires exactly three artifacts: `config.seed.json`, `config.schema.json`, `CHANGELOG.md`; missing any of the three fails project bootstrap. | [`02-file-specifications.md`](./02-file-specifications.md) |
| AT-SEEDABLECONFIGFUNDAMENTALS-04 | `config.seed.json` MUST validate against `config.schema.json` at build time (CI gate); a schema-invalid seed fails CI. | [`02-file-specifications.md`](./02-file-specifications.md) |
| AT-SEEDABLECONFIGFUNDAMENTALS-05 | `CHANGELOG.md` follows the documented Keep-a-Changelog-style format; missing entries for the current version block release. | [`02-file-specifications.md`](./02-file-specifications.md) |

### Database schema (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-06 | The schema defines exactly three tables: `ConfigMeta`, `Setting`, `SettingHistory` — all in **PascalCase** with `{TableName}Id` primary keys. | [`03-database-schema.md`](./03-database-schema.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-SEEDABLECONFIGFUNDAMENTALS-07 | `SettingHistory` MUST capture every change to `Setting` (insert, update, delete) with `(settingKey, oldValue, newValue, changedAt, changedBy)`; missing audit rows is a Code-Red bug. | [`03-database-schema.md`](./03-database-schema.md) |

### Strongly-typed values (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-08 | `SettingValue` is a **typed union** (string, number, boolean, JSON-object); `interface{}` / `any` containers are forbidden. | [`04-strongly-typed-values.md`](./04-strongly-typed-values.md), [`../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md`](../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md) |
| AT-SEEDABLECONFIGFUNDAMENTALS-09 | Each setting in `config.seed.json` declares its `valueType` matching one of the union variants; runtime type mismatch triggers a typed `apperror`. | [`04-strongly-typed-values.md`](./04-strongly-typed-values.md) |

### Go implementation — ConfigService (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-10 | All config access goes through `ConfigService`; direct queries against the `Setting` table from handlers/services are forbidden. | [`05-go-implementation.md`](./05-go-implementation.md) |
| AT-SEEDABLECONFIGFUNDAMENTALS-11 | `ConfigService.SeedWithVersionCheck()` is idempotent — running it twice on the same seed version performs zero writes. | [`05-go-implementation.md`](./05-go-implementation.md) |

### Version bumping rules (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-12 | Bump rules: **major** = removed keys or breaking type change; **minor** = new keys; **patch** = description/help-text only. Releasing a bump that violates these rules fails review. | [`06-version-bumping-rules.md`](./06-version-bumping-rules.md) |

### UI integration (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-13 | The version badge (showing current `ConfigMeta.version`) AND the new-settings highlight (rendered for keys added in the last bump) are mandatory React components when the project ships a settings UI. | [`07-ui-integration.md`](./07-ui-integration.md) |

### Theme support (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-14 | Theme settings use the documented CSS-variable contract (light + dark) and integrate with the project theme provider; raw hex/rgb values in theme settings are forbidden. | [`08-theme-support.md`](./08-theme-support.md), [`mem://design/theme`](mem://design/theme) |

### Policy (file 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SEEDABLECONFIGFUNDAMENTALS-15 | The **no-hardcoded-arrays policy** forbids enumerated value sets (e.g., a list of supported providers) being hardcoded in business code — they MUST live in `config.seed.json` and be loaded via `ConfigService`. | [`09-applicable-projects-and-policy.md`](./09-applicable-projects-and-policy.md) |

---

## Verification

```bash
# Direct Setting table access outside ConfigService
rg -n 'FROM Setting|UPDATE Setting|INSERT INTO Setting' --type go server/ | grep -v 'internal/config/'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-features/`](../02-features/) — Feature-level specs (RAG validation, seeding)
- [`../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md`](../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md) — Go standards
- [`../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) — Split DB fundamentals (consumes the same `Setting` storage layer)

---

*Curated 2026-04-25 — closes A-21 (batch 10). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
