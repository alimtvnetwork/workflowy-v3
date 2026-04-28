# Seedable Config Architecture — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`98-acceptance-criteria.md`](./98-acceptance-criteria.md). Replaces P20 stub seed.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P22.

---

## `AT-SEEDABLECONFIGFUNDAMENTALS-01` — Version-detection inputs are exactly two

| Given | `config.seed.json.version="2.3.0"`, `ConfigMeta.version="2.2.0"` in DB. |
|---|---|
| **When** | `ConfigService.detectAction()` is called. |
| **Then** | Returns `{Action:"merge", From:"2.2.0", To:"2.3.0"}`. With identical versions → `{Action:"skip"}`. With seed `<` DB → `{Action:"skip", Reason:"seed_older"}`. |
| **Negative** | A code path that consults env vars, file mtimes, or git SHA in this decision MUST fail the input-purity test. |
| **Test name** | `at_seedableconfigfundamentals_01_two_inputs_only` |

## `AT-SEEDABLECONFIGFUNDAMENTALS-02` — Merge is additive (no overwrites)

| Given | DB has `Setting.theme="dark"` (user override); seed v2.3.0 declares `theme="light"` and new key `density="cozy"`. |
|---|---|
| **When** | Merge runs. |
| **Then** | `Setting.theme="dark"` (preserved); `Setting.density="cozy"` (inserted); `SettingHistory` gets exactly 1 INSERT row for `density`, 0 rows for `theme`. |
| **Negative** | Any UPDATE to `theme` is **Code Red** and MUST fail the additive-merge invariant. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-03` — Three-artifact requirement

| Linter command | `for f in config.seed.json config.schema.json CHANGELOG.md; do test -f "$f" || { echo "missing: $f"; exit 1; }; done` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | Project bootstrap with only 2 of the 3 files MUST fail. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-04` — Seed validates against schema in CI

| Linter command | `npx ajv validate -s config.schema.json -d config.seed.json --strict=true` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | A seed with an extra key not declared in schema MUST fail with `additionalProperties=false` violation. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-05` — CHANGELOG covers current version

| Given | `config.seed.json.version="2.3.0"`. |
|---|---|
| **When** | Release gate parses `CHANGELOG.md`. |
| **Then** | A `## [2.3.0] — YYYY-MM-DD` heading exists with non-empty body containing at least one `### Added`/`### Changed`/`### Removed` subsection. |
| **Negative** | Tagging `2.3.0` with no CHANGELOG entry MUST fail release. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-06` — Schema = exactly 3 tables, PascalCase

| Linter command | `sqlite3 config.db ".tables" | tr -s ' ' '\n' | sort` |
|---|---|
| **Expected** | Output is exactly: `ConfigMeta\nSetting\nSettingHistory\n`. PRAGMA table_info confirms `{TableName}Id INTEGER PRIMARY KEY` on each. |
| **Negative** | A snake_case `setting_history` or a 4th table MUST fail the schema-shape gate. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-07` — SettingHistory captures every mutation

| Given | `Setting.fontSize=14` (existing). |
|---|---|
| **When** | UPDATE sets it to `16`, then DELETE removes it. |
| **Then** | `SELECT count(*) FROM SettingHistory WHERE settingKey='fontSize'` = `2`; rows: `(fontSize,14,16,<ts>,<user>)` then `(fontSize,16,NULL,<ts>,<user>)`. |
| **Negative** | A direct write to `Setting` that bypasses the trigger leaving 0 history rows is **Code Red** and MUST fail. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-08` — Typed-union value, no `any`

| Linter command | `rg -nP "interface\\{\\}\|any\b" $(go env GOPATH)/src/.../config/ -g '!*_test.go'` |
|---|---|
| **Expected exit code** | `1` (no matches in production code). |
| **Negative** | A `map[string]interface{}` for SettingValue MUST fail the typed-union gate. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-09` — `valueType` declared per setting

| Given | A `config.seed.json` setting `{ "key":"theme", "value":"dark" }` (missing `valueType`). |
|---|---|
| **When** | Schema validation runs. |
| **Then** | Validation fails with envelope `{"Status":"error","Errors":[{"Code":"CFG-1101","Message":"missing valueType","Details":{"Key":"theme"}}]}`. Runtime type mismatch (e.g. `valueType:"number"` + `value:"hi"`) → `CFG-1102`. |
| **Negative** | A missing or wrong `valueType` accepted as valid MUST fail. |

## `AT-SEEDABLECONFIGFUNDAMENTALS-10` — All access through ConfigService

| Linter command | `rg -nP "FROM\s+Setting\b\|UPDATE\s+Setting\b\|INSERT\s+INTO\s+Setting\b" --type go | rg -v "internal/config/"` |
|---|---|
| **Expected exit code** | `1` (no direct queries outside `internal/config/`). |
| **Negative** | A handler in `internal/api/` that issues `SELECT * FROM Setting` MUST fail the encapsulation gate. |

---

## Verification

```bash
grep -c "^## \`AT-SEEDABLECONFIGFUNDAMENTALS-" spec/06-seedable-config-architecture/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`98-acceptance-criteria.md`](./98-acceptance-criteria.md) — Source AT prose
- [`spec/03-error-manage/03-error-code-registry/`](../03-error-manage/03-error-code-registry/) — `CFG-11xx` range
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
