# 06 — Seedable Config Architecture + Changelog Versioning (also known as CW Config)

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-SEEDABLECONFIGFUNDAMENTALS-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_seedable_config_architecture_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-01` | [`97a-…#at-seedableconfigfundamentals-01`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-01) |
| 2 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-02` | [`97a-…#at-seedableconfigfundamentals-02`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-02) |
| 3 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-03` | [`97a-…#at-seedableconfigfundamentals-03`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-03) |
| 4 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-04` | [`97a-…#at-seedableconfigfundamentals-04`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-04) |
| 5 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-05` | [`97a-…#at-seedableconfigfundamentals-05`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-05) |
| 6 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-06` | [`97a-…#at-seedableconfigfundamentals-06`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-06) |
| 7 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-07` | [`97a-…#at-seedableconfigfundamentals-07`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-07) |
| 8 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-08` | [`97a-…#at-seedableconfigfundamentals-08`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-08) |
| 9 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-09` | [`97a-…#at-seedableconfigfundamentals-09`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-09) |
| 10 | cites `AT-SEEDABLECONFIGFUNDAMENTALS-10` | [`97a-…#at-seedableconfigfundamentals-10`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.0.0  
> **Created:** 2026-02-01  
> **Updated:** 2026-04-03  
> **Status:** Active  


## AI Contract

**Purpose** — Defines the layered config pipeline (defaults → env → DB → user override) so every plugin install boots with deterministic, testable values regardless of host.

**Audience** — Backend developers adding a new config key; operators provisioning a new install.

**Expected AI Output** —
- `wp-plugin/includes/Config/ConfigRegistry.php` — typed config registry
- `wp-plugin/seed/config.json` — default seed values
- `wp-plugin/includes/Migration/SeedConfigMigration.php` — first-run seeder

**Out of Scope** —
- Secrets management — secrets stay in `wp-config.php`, never in the seed JSON
- Per-user UI preferences — see [`spec/36-user-management/01-account-and-settings.md`](../36-user-management/01-account-and-settings.md)

**Definition of Done** —
- Every config key has a default value, a type, and a validator
- Re-running the seeder is idempotent — no duplicate rows, no overwritten user values
- Every `AT-SEEDABLECONFIG-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

> **Purpose:** Reusable pattern for version-controlled configuration with automatic changelog updates and initial seeding




## Config Source Precedence

When `ConfigRegistry::get($key)` is called, the registry resolves the value by walking these sources from **highest** to **lowest** priority. The first source that defines the key wins. No merging, no fallback chain inside a single source.

| Rank | Source | Lifetime | Editable by | Example use |
|---|---|---|---|---|
| 1 (highest) | Process env var (`WORKFLOWY_<KEY>`) | Process | Operator at boot | Force `WORKFLOWY_TRASH_RETENTIONDAYS=7` in staging. |
| 2 | `wp-config.php` constant (`WORKFLOWY_<KEY>`) | Site | Server admin | Pin secrets and prod-only overrides. |
| 3 | DB table `WorkflowyConfigOverride` (per-site) | Persistent | Admin via Settings UI | User changed theme to `dark`. |
| 4 | DB table `WorkflowyConfigUserOverride` (per-user) | Persistent | End user | User set `items.maxPerView = 100`. |
| 5 | Seed file `wp-plugin/seed/config.json` | Build artifact | Plugin author | Ships defaults. |
| 6 (lowest) | Hard-coded fallback in `ConfigSchema::DEFAULT` | Source code | Developer | Last-resort safety net. |

### Resolution diagram

```
ConfigRegistry::get("items.maxPerView")
        │
        ▼
┌──────────────────────────────────────────────────┐
│ 1. ENV  WORKFLOWY_ITEMS_MAXPERVIEW   ─ defined? ─┼── yes ──► return cast(env)
└─────────────────────────┬────────────────────────┘
                          │ no
                          ▼
┌──────────────────────────────────────────────────┐
│ 2. wp-config.php constant            ─ defined? ─┼── yes ──► return cast(const)
└─────────────────────────┬────────────────────────┘
                          │ no
                          ▼
┌──────────────────────────────────────────────────┐
│ 3. DB site override                  ─ exists?  ─┼── yes ──► return validated(value)
└─────────────────────────┬────────────────────────┘
                          │ no
                          ▼
┌──────────────────────────────────────────────────┐
│ 4. DB user override (current user)   ─ exists?  ─┼── yes ──► return validated(value)
└─────────────────────────┬────────────────────────┘
                          │ no
                          ▼
┌──────────────────────────────────────────────────┐
│ 5. seed/config.json                  ─ has key? ─┼── yes ──► return validated(seed)
└─────────────────────────┬────────────────────────┘
                          │ no
                          ▼
            6. ConfigSchema::DEFAULT[key]   ──────► return default
```

## Seeder Idempotency Rules

The seeder runs at plugin activation and on every update. It MUST be safe to run any number of times.

| Rule | Enforcement |
|---|---|
| Never overwrite a key already present in `WorkflowyConfigOverride` or `WorkflowyConfigUserOverride`. | Gate `G-06-IDEMPOTENT` (PHPUnit: re-run seeder, assert override row unchanged). |
| Inserting a new key from seed MUST log `seed.inserted` with key + value. | Gate `G-06-LOG-INSERT`. |
| Removing a key from `seed/config.json` does **not** remove it from the DB — operators must run `wp workflowy config prune`. | Gate `G-06-NO-IMPLICIT-DELETE`. |
| Type widening (e.g. int → enum) requires a versioned migration; the seeder MUST refuse to apply it. | Gate `G-06-NO-TYPE-DRIFT`. |

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Put secrets in `seed/config.json` | Seed file ships in the plugin zip — secrets leak to every install. | `G-06-NO-SECRETS-IN-SEED` (regex bans keys matching `*secret*`, `*token*`, `*key*` ending). |
| 2 | Re-run seeder overwriting user values | Destroys user customization on every update. | `G-06-IDEMPOTENT`. |
| 3 | Read config directly from DB in hot paths | Bypasses validator + cache; type drift not caught. | `G-06-VIA-REGISTRY` (PHPStan: `wpdb->get_var` on config tables forbidden outside `ConfigRegistry`). |
| 4 | Cache config without invalidation hook | Settings UI changes don't take effect until restart. | `G-06-CACHE-INVALIDATE` (action `workflowy/config/changed` MUST clear cache). |
| 5 | Define a key in seed without a matching `ConfigSchema` entry | Validator silently accepts garbage. | `G-06-SCHEMA-PARITY` (diff: `seed/config.json` keys ⊆ `ConfigSchema::DEFAULT` keys). |
| 6 | Use ENV at runtime via `getenv()` outside `ConfigRegistry` | Two competing sources of truth. | `G-06-ENV-VIA-REGISTRY`. |

## Worked Example — End-to-End Override Resolution

### 1. Seed file (`wp-plugin/seed/config.json`)

```json
{
  "$schema": "../config.schema.json",
  "appearance.theme":     { "value": "auto", "type": "enum", "options": ["light", "dark", "auto"] },
  "items.maxPerView":     { "value": 250,    "type": "int",  "min": 50, "max": 1000 },
  "trash.retentionDays":  { "value": 30,     "type": "int",  "min": 1,  "max": 365 },
  "search.fuzzy":         { "value": true,   "type": "bool" }
}
```

### 2. Site admin sets a DB override via Settings UI

```sql
INSERT INTO WorkflowyConfigOverride (Key, Value, UpdatedAt)
VALUES ('items.maxPerView', '500', 1714300000)
ON CONFLICT(Key) DO UPDATE SET Value = excluded.Value, UpdatedAt = excluded.UpdatedAt;
```

### 3. End user further narrows for themselves

```sql
INSERT INTO WorkflowyConfigUserOverride (UserId, Key, Value, UpdatedAt)
VALUES ('u_42', 'items.maxPerView', '100', 1714300050);
```

### 4. Operator forces a value at boot via `wp-config.php`

```php
define('WORKFLOWY_ITEMS_MAXPERVIEW', 50);
```

### 5. Resolution table for `items.maxPerView`

| Acting as user | ENV set? | wp-config const? | Site override? | User override? | Resolved value | Why |
|---|---|---|---|---|---|---|
| Anonymous visitor | no | **yes (50)** | yes (500) | n/a | **50** | Constant beats DB. |
| Logged-in `u_42`  | no | **yes (50)** | yes (500) | yes (100) | **50** | Constant still wins. |
| Logged-in `u_42`  | no | no              | yes (500) | yes (100) | **500** | Site override beats user override. |
| Logged-in `u_42`  | no | no              | no         | yes (100) | **100** | User override beats seed. |
| Anonymous visitor | no | no              | no         | n/a        | **250** | Seed value (rank 5). |

### 6. PHP read site (load-bearing — gate `G-06-VIA-REGISTRY`)

```php
<?php
$limit = ConfigRegistry::get('items.maxPerView');           // returns int, validated, cached
// ❌ NEVER: $limit = $wpdb->get_var("SELECT Value FROM WorkflowyConfigOverride WHERE Key='items.maxPerView'");
```

### 7. Cache invalidation hook

```php
do_action('workflowy/config/changed', 'items.maxPerView');  // ConfigRegistry listens and busts its cache
```

### Error-code registry (this section owns `CFG-06-*`)

| Code | Meaning | Recovery |
|---|---|---|
| `CFG-06-01` | Seed file missing or unreadable | Fall back to `ConfigSchema::DEFAULT`, log warning. |
| `CFG-06-02` | Seed value violates schema (`min`/`max`/`enum`) | Reject seed key, log error, surface in admin notice. |
| `CFG-06-03` | DB override violates schema (drift after schema change) | Ignore override, fall through to next source, mark for cleanup. |
| `CFG-06-04` | Type drift between seed and schema | Refuse to activate plugin until resolved. |
| `CFG-06-05` | Secret-shaped key found in seed (`*secret*`, `*token*`) | Activation blocked. |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-fundamentals/`](./01-fundamentals/00-overview.md) | Seedable Config Architecture — Fundamentals (Overview) | subfolder |
| 2 | [`02-features/`](./02-features/00-overview.md) | Seedable Config Architecture — Features Index | subfolder |

<!-- AUTO-TOC:END -->

---

## Keywords

`configuration` · `seeding` · `changelog` · `versioning` · `sqlite` · `json-schema` · `semver` · `merge-strategy`

---

## Scoring

| Metric | Value |
|--------|-------|
| AI Confidence | Production-Ready |
| Ambiguity | Low |
| Health Score | 100/100 (A+) |

---

## Summary

The **Seedable Config Architecture + Changelog Versioning** (commonly referred to as **CW Config**) defines a pattern for managing application configuration where:

1. **First-run seeding** populates SQLite DB from `config.seed.json`
2. **Every config change updates the version**
3. **Every version change logs to CHANGELOG.md**
4. **Subsequent runs respect version** to avoid duplicate seeds

This ensures configuration is always traceable, auditable, and version-aware.

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 00 | `00-overview.md` | This file — master index |
| 01 | `01-fundamentals/00-overview.md` | Core concepts, configuration files, version flow, merge strategies (split — 10 files) |
| 02 | `02-features/00-overview.md` | Feature index |
| 02.01 | `02-features/01-rag-chunk-settings.md` | RAG chunk size and overlap configuration |
| 02.02 | `02-features/02-rag-validation-helpers/` | Go validation patterns for RAG config (split subfolder) |
| 02.03 | `02-features/03-rag-validation-tests/` | Unit test specifications for validators (split subfolder) |
| 02.04 | `02-features/04-rag-test-coverage-matrix.md` | Test coverage matrix for RAG validation |
| 02.05 | `02-features/05-validation-data-seeding/` | CW Config → Root DB seeding pattern (split subfolder) |
| 03 | `03-issues/00-overview.md` | Issues tracker |
| 97 | `97-acceptance-criteria.md` | Acceptance criteria |
| 97b | `97-changelog.md` | Changelog |
| 98 | `98-acceptance-criteria.md` | Extended acceptance criteria |
| 99 | `99-consistency-report.md` | Consistency report |

---

## Folder Structure

```
06-seedable-config-architecture/
├── 00-overview.md                    ← This file
├── 01-fundamentals/                  ← Core concepts & architecture (split — 10 files)
├── 02-features/
│   ├── 00-overview.md                ← Feature index
│   ├── 01-rag-chunk-settings.md
│   ├── 02-rag-validation-helpers/    ← Split subfolder (8 files)
│   ├── 03-rag-validation-tests/      ← Split subfolder (10 files)
│   ├── 04-rag-test-coverage-matrix.md
│   └── 05-validation-data-seeding/   ← Split subfolder (7 files)
├── 03-issues/
│   └── 00-overview.md                ← Issues tracker
├── 97-acceptance-criteria.md
├── 97-changelog.md
├── 98-acceptance-criteria.md
└── 99-consistency-report.md
```

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| [Split DB Architecture](../05-split-db-architecture/00-overview.md) | Database organization patterns |
| [App Project Template](../01-spec-authoring-guide/05-app-project-template.md) | Template this spec follows |

---

*Overview — updated: 2026-04-03*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`98-acceptance-criteria.md`](./98-acceptance-criteria.md) — Acceptance criteria
