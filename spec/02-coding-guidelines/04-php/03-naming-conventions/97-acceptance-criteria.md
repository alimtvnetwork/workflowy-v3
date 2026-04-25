# PHP Naming Conventions — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Baseline:** PSR-12 / PSR-1 (project-specific overrides win)

---

## ID Range

`AT-NAMINGCONVENTIONS-01` … `AT-NAMINGCONVENTIONS-13`

---

## Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AT-NAMINGCONVENTIONS-01 | All classes, interfaces, traits, and enums declared in PHP source files use **PascalCase** identifiers. | [`01-symbols.md`](./01-symbols.md), [`04-summary-table.md`](./04-summary-table.md) |
| AT-NAMINGCONVENTIONS-02 | All enum class names end with the `Type` suffix (e.g., `UploadSourceType`, `HookType`). | [`01-symbols.md`](./01-symbols.md), [`04-summary-table.md`](./04-summary-table.md) |
| AT-NAMINGCONVENTIONS-03 | All methods and free functions use **camelCase** (e.g., `processUpload()`, never `process_upload`). | [`01-symbols.md`](./01-symbols.md) |
| AT-NAMINGCONVENTIONS-04 | All non-boolean variables use **camelCase** with a leading `$` (e.g., `$maxRetries`). | [`01-symbols.md`](./01-symbols.md), [`04-summary-table.md`](./04-summary-table.md) |
| AT-NAMINGCONVENTIONS-05 | All boolean variables use the `$is`/`$has` positive prefix (e.g., `$isActive`, `$hasErrors`). Negative prefixes (`$not*`, `$no*`) are forbidden. | [`04-summary-table.md`](./04-summary-table.md), [`02-coding-guidelines/01-cross-language/02-boolean-principles/00-overview.md`](../../01-cross-language/02-boolean-principles/00-overview.md) |
| AT-NAMINGCONVENTIONS-06 | All constants use **UPPER_SNAKE_CASE** (e.g., `MAX_RETRIES`). | [`01-symbols.md`](./01-symbols.md) |
| AT-NAMINGCONVENTIONS-07 | All enum cases inside a `Type` enum use **PascalCase** (e.g., `case RestApi`). | [`01-symbols.md`](./01-symbols.md), [`02-coding-guidelines/04-php/01-enums/00-overview.md`](../01-enums/00-overview.md) |
| AT-NAMINGCONVENTIONS-08 | All namespaces use **PascalCase** segments separated by `\` (e.g., `RiseupAsia\Enums`); they map 1-to-1 to a PSR-4 directory under PascalCase folders. | [`02-files-and-namespaces.md`](./02-files-and-namespaces.md) |
| AT-NAMINGCONVENTIONS-09 | Files declaring a class, trait, interface, or enum are named **`PascalCase.php`** matching the contained symbol exactly (`SnapshotFactory.php`, `UploadSourceType.php`). | [`02-files-and-namespaces.md`](./02-files-and-namespaces.md), [`04-summary-table.md`](./04-summary-table.md) |
| AT-NAMINGCONVENTIONS-10 | Procedural / config-only PHP files (no class) use **lowercase_with_underscores.php** (e.g., `constants.php`, `bootstrap.php`). | [`02-files-and-namespaces.md`](./02-files-and-namespaces.md) |
| AT-NAMINGCONVENTIONS-11 | Domain folders (one per namespace segment) use **PascalCase** (e.g., `Snapshot/`, `Database/`); this is the documented exception to the cross-language lowercase-folders rule for PHP. | [`02-files-and-namespaces.md`](./02-files-and-namespaces.md), [`02-coding-guidelines/08-file-folder-naming/02-php-wordpress.md`](../../08-file-folder-naming/02-php-wordpress.md) |
| AT-NAMINGCONVENTIONS-12 | Log context array keys use **camelCase** (`'postId'`, `'masterDir'`); they are NOT persisted and therefore exempt from the PascalCase Golden Rule. | [`03-array-keys.md`](./03-array-keys.md), [`04-summary-table.md`](./04-summary-table.md) |
| AT-NAMINGCONVENTIONS-13 | DB column array keys and API response array keys use **PascalCase** (`'PluginSlug'`, `'PluginVersion'`, `'CreatedAt'`); enforced by the PascalCase Golden Rule. | [`03-array-keys.md`](./03-array-keys.md), [`04-summary-table.md`](./04-summary-table.md), [`04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) |

---

## Verification

```bash
# Lint negative-prefixed PHP booleans
grep -RIn --include='*.php' -E '\$(not|no)[A-Z]' src/ tests/

# Verify class file ↔ symbol parity
grep -RIn --include='*.php' -E '^(class|interface|trait|enum)\s+\w+' src/

# Run hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/04-database-conventions/06-rest-api-format/00-overview.md`](../../../../04-database-conventions/06-rest-api-format/00-overview.md) — PascalCase Golden Rule
- [`spec/02-coding-guidelines/08-file-folder-naming/00-overview.md`](../../08-file-folder-naming/00-overview.md) — File & folder naming SSOT

---

*Curated 2026-04-25 — closes A-16 (batch 5).*
