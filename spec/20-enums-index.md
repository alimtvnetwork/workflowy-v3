# Enums Index — Cross-Language Registry

> **Version:** 1.0.0
> **Updated:** 2026-04-20
> **Status:** Active
> **Purpose:** Single source of truth for every named enum across Go, PHP, and TypeScript. Maps each enum to its language-specific spec, canonical case naming, and usage rules.

---

## 1. Universal Enum Rules

These rules apply across **all three languages**. Language-specific extensions are documented in the per-language spec files.

| # | Rule | Applies To |
|---|------|-----------|
| 1 | **PascalCase case names** in code (`Success`, `PerTable`, `SingleDb`) | Go, PHP, TS |
| 2 | **PascalCase string label** in `variantLabels` table (`"Success"`, `"PerTable"`) | Go (PHP/TS use enum-native string serialisation) |
| 3 | **Zero magic strings** — every domain string must reference an enum case | All |
| 4 | **`isEqual()` for comparison** (PHP), `==` is allowed in Go for typed enums | PHP, Go |
| 5 | **`Parse()` is case-insensitive** via `strings.EqualFold()` | Go |
| 6 | **`Invalid` is the zero value** (Go) or default fallback (PHP/TS) | Go, PHP, TS |
| 7 | **Single `variantLabels` table** — dual-table pattern (`variantStrings` + `variantLabels`) is deprecated as of v2.1.0 | Go |
| 8 | **Protocol-driven enums** (`content_type`, `endpoint`, `header`, `response_key`, `response_message`) are exempt from PascalCase string rule | Go |
| 9 | **TS shape is `as const` object + derived union** — the `enum` keyword and bare literal string unions are both forbidden for named enums. See §5 for the worked pattern. | TS |

See [Glossary](./19-glossary.md) for term definitions.

---

## 2. Per-Language Spec Files

| Language | Primary Spec | Standards Reference |
|----------|--------------|---------------------|
| **Go** | [`02-coding-guidelines/03-golang/01-enum-specification/`](./02-coding-guidelines/03-golang/01-enum-specification/00-overview.md) | [`04-golang-standards-reference/`](./02-coding-guidelines/03-golang/04-golang-standards-reference/00-overview.md) |
| **PHP** | [`02-coding-guidelines/04-php/01-enums/`](./02-coding-guidelines/04-php/01-enums/00-overview.md) | [`07-php-standards-reference/`](./02-coding-guidelines/04-php/07-php-standards-reference/00-overview.md) |
| **TypeScript** | [`02-coding-guidelines/02-typescript/`](./02-coding-guidelines/02-typescript/00-overview.md) | [`08-typescript-standards-reference/`](./02-coding-guidelines/02-typescript/08-typescript-standards-reference/00-overview.md) |
| **WordPress plugin** | [`15-wp-plugin-how-to/02-enums-and-coding-style/`](./15-wp-plugin-how-to/02-enums-and-coding-style/01-enum-architecture.md) | — |

---

## 3. Universal Domain Enums

These enums exist (or should exist) in all three languages with matching case names. Use this table as the ground truth when adding new cases.

### 3.1 Status & Result

| Enum | Cases | Used For |
|------|-------|----------|
| `StatusType` | `Success`, `Failed`, `Pending`, `Skipped` | Operation result classification |
| `LogLevelType` | `Trace`, `Debug`, `Info`, `Warn`, `Error`, `Fatal` | Logger severity |
| `HttpMethodType` | `Get`, `Post`, `Put`, `Patch`, `Delete`, `Options`, `Head` | HTTP request methods |
| `ErrorCategoryType` | `Connection`, `RemoteSite`, `Resource`, `Validation`, `Server`, `WpRemote`, `Scheduler`, `Delegated`, `Frontend` | Error code range buckets (E1000–E9999) |

### 3.2 Snapshot & Backup

| Enum | Cases | Used For |
|------|-------|----------|
| `SnapshotScopeType` | `All`, `PerTable`, `SingleDb` | Backup scope |
| `SnapshotTriggerType` | `Manual`, `Scheduled`, `Api`, `WebhookExternal`, `Recovery` | Why snapshot was taken |
| `BackupStrategyType` | `Full`, `Incremental`, `Differential` | Backup algorithm |

### 3.3 WordPress / Plugin

| Enum | Cases | Used For |
|------|-------|----------|
| `CapabilityType` | `ManageOptions`, `EditPosts`, `UploadFiles`, … | WP capability strings (`current_user_can()`) |
| `PluginConfigType` | `Version`, `Slug`, `MainFile`, `TextDomain` | Plugin metadata constants |
| `PostStatusType` | `Publish`, `Draft`, `Pending`, `Trash`, `Future`, `Private` | WP post status |

### 3.4 Database

| Enum | Cases | Used For |
|------|-------|----------|
| `TableType` | `Transactions`, `AgentSites`, `SnapshotProgress`, `PluginSettings`, … | Type-safe table-name accessor (matches PascalCase SQLite tables) |
| `LogColumnType` | `Id`, `CreatedAt`, `UpdatedAt`, `Status`, `Sequence`, … | Type-safe column-name accessor for log tables |
| `MigrationStatusType` | `Pending`, `Running`, `Completed`, `Failed`, `Rolledback` | Migration runner state |

### 3.5 WorkFlowy (Outliner)

| Enum | Cases | Used For |
|------|-------|----------|
| `ItemType` | `bullet`, `h1`, `h2`, `h3`, `paragraph`, `todo`, `numbered`, `board`, `quote`, `code`, `divider`, `mirror` | 12 distinct outliner node types — see [`32-ui-design/02-state-and-data/03-data-types.md`](./32-ui-design/02-state-and-data/03-data-types.md) for the UI taxonomy SSOT. Lowercase per DB column convention; the heading split (h1/h2/h3) matches what users actually create. |
| `SortDirectionType` | `Asc`, `Desc`, `Manual` | Sibling ordering |
| `ZoomLevelType` | `Root`, `Single`, `Filtered` | View focus mode |
| `SharePermissionType` | `View`, `Comment`, `Edit`, `Owner` | Share-link role |
| `TrashRetentionType` | `Days30`, `Permanent` | Soft-delete TTL bucket |

### 3.6 Cast / Type-Safety (GEN-600 family)

| Constant | Registry Code | Emitted By |
|----------|---------------|------------|
| `ECast001` | `GEN-600-01` (`CAST_TYPE_ASSERTION_FAILED`) | `typecast.CastOrFail[T]()` |
| `ECast002` | `GEN-600-02` (`CAST_SLICE_ELEMENT_FAILED`) | `typecast.CastSliceOrFail[T]()` |

See [Casting Elimination Patterns §9](./02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/04-cast-or-fail-utility.md).

---

## 4. Protocol-Driven Enums (PascalCase Exemption)

These enums **must** keep wire-format strings (snake_case, lowercase, mixed) because they cross HTTP/JSON boundaries and an external party defines their casing.

| Enum | Casing | Why |
|------|--------|-----|
| `ContentType` | `application/json`, `multipart/form-data` | MIME wire format |
| `HeaderType` | `Content-Type`, `Authorization`, `X-Request-Id` | HTTP header names (case-insensitive but conventional Train-Case) |
| `EndpointType` | `/api/v1/sites/{id}/snapshots` | URL path templates |
| `ResponseKeyType` | `Status`, `Data`, `Errors`, `Attributes` | Universal Envelope JSON keys (PascalCase by spec, not enum violation) |
| `ResponseMessageType` | `success`, `failed`, `pending` (lowercase) | Frontend-consumed string slugs |

---

## 5. Adding a New Enum — Checklist

1. **Add to this index** (Section 3 if domain, Section 4 if protocol).
2. **Implement in Go** under `internal/enums/<package>/` with `variantLabels` table + `String()`, `Label()`, `Parse()`, `IsValid()`, `IsInvalid()`.
3. **Mirror in PHP** as a `string`-backed enum with `isEqual()` method.
4. **Mirror in TS** as a `const` object + union type (no `enum` keyword — see TS standards).
5. **Update consumers** to replace any magic-string usage.
6. **Add acceptance criterion** to the relevant `97-acceptance-criteria.md`.

---

## 6. Cross-References

- [Glossary](./19-glossary.md) — Terminology SSOT
- [Issues & Fixes Log §4 (Enum Standards)](./02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/04-enum-standards.md)
- [Casting Elimination Patterns](./02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/00-overview.md)
- [Error Code Ranges](./03-error-manage/02-error-architecture/01-error-handling-reference/05-error-codes-and-fallbacks.md)
- [Go Enum Specification](./02-coding-guidelines/03-golang/01-enum-specification/00-overview.md)
- [PHP Enums](./02-coding-guidelines/04-php/01-enums/00-overview.md)

---

*Enums index v1.0.0 — created 2026-04-20 as cross-language enum SSOT (H-5.2).*
