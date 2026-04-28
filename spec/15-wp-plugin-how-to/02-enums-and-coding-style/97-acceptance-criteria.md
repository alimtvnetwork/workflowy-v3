# Enums And Coding Style — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ENUMSANDCODINGSTYLE-01` … `AT-ENUMSANDCODINGSTYLE-13`

---

## Criteria

### Enum architecture (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSANDCODINGSTYLE-01 | Every enum is a **PHP 8.1+ backed enum** (`enum X: string`); class-with-constants is forbidden. | [`01-enum-architecture.md`](./01-enum-architecture.md) |
| AT-ENUMSANDCODINGSTYLE-02 | Enums live in `includes/Enums/<Name>.php`; one enum per file with class-name = file-name (PascalCase). | [`01-enum-architecture.md`](./01-enum-architecture.md), [`../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) |
| AT-ENUMSANDCODINGSTYLE-03 | Backing values use **PascalCase** (`'Pending'`, `'InProgress'`); kebab/snake/lowercase forbidden. | [`01-enum-architecture.md`](./01-enum-architecture.md), [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) |

### Metadata pattern (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSANDCODINGSTYLE-04 | Per-case metadata (label, color, icon, description) is exposed via methods on the enum (`label()`, `color()`); a parallel `const META = [...]` array is forbidden. | [`02-enum-metadata-pattern.md`](./02-enum-metadata-pattern.md) |
| AT-ENUMSANDCODINGSTYLE-05 | `match($this)` is used for metadata dispatch; nested `if`/`switch` chains are forbidden. | [`02-enum-metadata-pattern.md`](./02-enum-metadata-pattern.md), [`../../02-coding-guidelines/01-cross-language/04-code-style/97-acceptance-criteria.md`](../../02-coding-guidelines/01-cross-language/04-code-style/97-acceptance-criteria.md) |
| AT-ENUMSANDCODINGSTYLE-06 | Every enum implements at minimum: `label()`, `values()` (= `array_column(self::cases(), 'value')`), `tryFromOrThrow(string)`. | [`02-enum-metadata-pattern.md`](./02-enum-metadata-pattern.md) |

### SelfUpdateStatus enum (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSANDCODINGSTYLE-07 | `SelfUpdateStatus` defines exactly the documented cases (Idle, Checking, Available, Downloading, Installing, Success, Failed); adding/removing cases is a minor-version bump. | [`03-self-update-status-enum.md`](./03-self-update-status-enum.md) |
| AT-ENUMSANDCODINGSTYLE-08 | Each case has a documented terminal/transient classification (`isTerminal()`); UI uses this method (NOT a hardcoded array). | [`03-self-update-status-enum.md`](./03-self-update-status-enum.md) |

### ActionType enum (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSANDCODINGSTYLE-09 | `ActionType` is the SSOT for audit-log action verbs; new actions MUST be added to the enum (not free-string in callers). | [`04-action-type-enum.md`](./04-action-type-enum.md) |
| AT-ENUMSANDCODINGSTYLE-10 | `ActionType::from()` is the only entry point for deserializing audit rows; `tryFrom()` is reserved for user-supplied input where unknowns are tolerated. | [`04-action-type-enum.md`](./04-action-type-enum.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSANDCODINGSTYLE-11 | All enum string-comparisons use `$value === EnumX::Case->value` (NOT loose `==`); strict comparison is enforced. | [`00-overview.md`](./00-overview.md), [`../../02-coding-guidelines/04-php/`](../../02-coding-guidelines/04-php/) |
| AT-ENUMSANDCODINGSTYLE-12 | Enums are registered in `spec/20-enums-index.md`; missing registration fails the spec-hygiene cross-ref check. | [`spec/20-enums-index.md`](../../20-enums-index.md) |
| AT-ENUMSANDCODINGSTYLE-13 | The consistency report (`99-consistency-report.md`) is regenerated whenever an enum is added/changed; a stale report blocks merge. | [`99-consistency-report.md`](./99-consistency-report.md) |

---

## Verification

```bash
# Class-with-constants masquerading as enums
rg -nP 'class\s+\w+(Status|Type|Mode)\s*\{[^}]*const\s+\w+\s*=' includes/

# Loose comparison on enum values
rg -nP '==\s*\w+::\w+->value' includes/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) — Response key inventory
- [`../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) — Types folder
- [`spec/20-enums-index.md`](../../20-enums-index.md) — Enum registry

---

*Curated 2026-04-25 — closes A-22 (batch 11). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
