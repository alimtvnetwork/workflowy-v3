# §8 ResponseKeyType & §9 PluginConfigType

## 8. Magic Strings — Structured Array Keys (`ResponseKeyType`)

> **Added:** 2026-02-20 — Eliminates magic string fragmentation across API responses, log context arrays, and inter-service data transfer.

### Why This Matters

Structured response arrays (`['success' => true, 'error' => '...']`) appear in **every** REST handler, logger call, and service return value. When these keys are raw strings, typos silently break consumers and grep-based audits miss variants (`'errors'` vs `'error'`).

`ResponseKeyType` centralizes all envelope and domain keys so that:
- A single rename propagates everywhere.
- IDE autocompletion prevents typos.
- The Go proxy and TypeScript frontend can mirror the same enum for end-to-end type safety.

### Forbidden Patterns

| # | ❌ Forbidden | ✅ Required | Enum Case |
|---|-------------|------------|-----------|
| 8.1  | `['success']` or `=> 'success'` | `[ResponseKeyType::Success->value]` | `Success` |
| 8.2  | `['error']` | `[ResponseKeyType::Error->value]` | `Error` |
| 8.3  | `['message']` | `[ResponseKeyType::Message->value]` | `Message` |
| 8.4  | `['data']` | `[ResponseKeyType::Data->value]` | `Data` |
| 8.5  | `['code']` | `[ResponseKeyType::Code->value]` | `Code` |
| 8.6  | `['valid']` | `[ResponseKeyType::Valid->value]` | `Valid` |
| 8.7  | `['errors']` | `[ResponseKeyType::Errors->value]` | `Errors` |
| 8.8  | `['cached']` | `[ResponseKeyType::Cached->value]` | `Cached` |
| 8.9  | `['phase']` | `[ResponseKeyType::Phase->value]` | `Phase` |
| 8.10 | `['reason']` | `[ResponseKeyType::Reason->value]` | `Reason` |
| 8.11 | `['total']` | `[ResponseKeyType::Total->value]` | `Total` |
| 8.12 | `['agents']` | `[ResponseKeyType::Agents->value]` | `Agents` |
| 8.13 | `['actions']` | `[ResponseKeyType::Actions->value]` | `Actions` |
| 8.14 | `['logs']` | `[ResponseKeyType::Logs->value]` | `Logs` |
| 8.15 | `['snapshots']` | `[ResponseKeyType::Snapshots->value]` | `Snapshots` |
| 8.16 | `['sql']` | `[ResponseKeyType::Sql->value]` | `Sql` |
| 8.17 | `['params']` | `[ResponseKeyType::Params->value]` | `Params` |
| 8.18 | `['sets']` | `[ResponseKeyType::Sets->value]` | `Sets` |
| 8.19 | `['plugins']` | `[ResponseKeyType::Plugins->value]` | `Plugins` |
| 8.20 | `['tables']` | `[ResponseKeyType::Tables->value]` | `Tables` |
| 8.21 | `['rows']` | `[ResponseKeyType::Rows->value]` | `Rows` |
| 8.22 | `['bytes']` | `[ResponseKeyType::Bytes->value]` | `Bytes` |
| 8.23 | `['size']` | `[ResponseKeyType::Size->value]` | `Size` |
| 8.24 | `['file_size']` | `[ResponseKeyType::FileSize->value]` | `FileSize` |
| 8.25 | `['path']` | `[ResponseKeyType::Path->value]` | `Path` |
| 8.26 | `['filename']` | `[ResponseKeyType::Filename->value]` | `Filename` |
| 8.27 | `['checksum']` | `[ResponseKeyType::Checksum->value]` | `Checksum` |
| 8.28 | `['duration']` | `[ResponseKeyType::Duration->value]` | `Duration` |
| 8.29 | `['count']` | `[ResponseKeyType::Count->value]` | `Count` |
| 8.30 | `['files']` | `[ResponseKeyType::Files->value]` | `Files` |
| 8.31 | `['directory']` | `[ResponseKeyType::Directory->value]` | `Directory` |
| 8.32 | `['scope']` | `[ResponseKeyType::Scope->value]` | `Scope` |
| 8.33 | `['exported']` | `[ResponseKeyType::Exported->value]` | `Exported` |
| 8.34 | `['entry']` | `[ResponseKeyType::Entry->value]` | `Entry` |
| 8.35 | `['snapshot_id']` | `[ResponseKeyType::SnapshotId->value]` | `SnapshotId` |
| 8.36 | `['sequence']` | `[ResponseKeyType::Sequence->value]` | `Sequence` |
| 8.37 | `['folder_name']` | `[ResponseKeyType::FolderName->value]` | `FolderName` |
| 8.38 | `['tables_changed']` | `[ResponseKeyType::TablesChanged->value]` | `TablesChanged` |
| 8.39 | `['total_rows']` | `[ResponseKeyType::TotalRows->value]` | `TotalRows` |
| 8.40 | `['total_new_rows']` | `[ResponseKeyType::TotalNewRows->value]` | `TotalNewRows` |
| 8.41 | `['zip_size']` | `[ResponseKeyType::ZipSize->value]` | `ZipSize` |
| 8.42 | `['backup_id']` | `[ResponseKeyType::BackupId->value]` | `BackupId` |
| 8.43 | `['zip_failed']` | `[ResponseKeyType::ZipFailed->value]` | `ZipFailed` |
| 8.44 | `['skip_audit']` | `[ResponseKeyType::SkipAudit->value]` | `SkipAudit` |
| 8.45 | `['tables_restored']` | `[ResponseKeyType::TablesRestored->value]` | `TablesRestored` |

### Scope

This rule applies to **all** array key access where the key matches a `ResponseKeyType` case value:

- REST handler response arrays (`new WP_REST_Response(array(...))`)
- Service return arrays (`return array(ResponseKeyType::Success->value => true, ...)`)
- Log context arrays (`$this->fileLogger->info('...', array(ResponseKeyType::Phase->value => '...'))`)
- Internal data transfer between traits/classes

### Exceptions

Keys that are **not** in `ResponseKeyType` remain as literal strings (e.g., domain-specific keys like `'retention'`, `'orphans'`, `'stuck'`, `'settings'`, `'providers'`, `'content'`). If a key appears in 3+ files, consider adding it to the enum.

Keys inside `$_FILES` superglobal access (e.g., `$files['file']['size']`) and WordPress hook/filter names are exempt — these are PHP/WordPress API contracts.

### Example

```php
// ❌ FORBIDDEN — magic string keys
return array(
    'success' => true,
    'snapshot_id' => $id,
    'total_rows' => $rows,
    'duration' => $elapsed,
    'errors' => $errors,
);

// ✅ REQUIRED — ResponseKeyType enum
return array(
    ResponseKeyType::Success->value => true,
    ResponseKeyType::SnapshotId->value => $id,
    ResponseKeyType::TotalRows->value => $rows,
    ResponseKeyType::Duration->value => $elapsed,
    ResponseKeyType::Errors->value => $errors,
);
```

## 9. Magic Strings — Plugin Identity (`PluginConfigType`)

> **Added:** 2026-02-23 — Eliminates hardcoded plugin name and log prefix strings scattered across the codebase.

### Why This Matters

The plugin name (`'Riseup Asia Uploader'`) and log prefix (`'[Riseup Asia]'`) are already centralized in `PluginConfigType::Name` and `PluginConfigType::LogPrefix`. Hardcoding these strings in class constants, email subjects, admin notices, or generated file comments creates maintenance debt — a rebrand or rename requires a full codebase grep instead of a single enum update.

### Forbidden Patterns

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 9.1 | `private const LOG_PREFIX = '[Riseup Asia] ClassName: '` | Derive from `PluginConfigType::LogPrefix->value` at runtime | Hardcoded prefix duplicates enum value |
| 9.2 | `'[Riseup Asia] Plugin Boot Errors on ' . $site` | `PluginConfigType::LogPrefix->value . ' Plugin Boot Errors on ' . $site` | Email subject uses hardcoded prefix |
| 9.3 | `'Riseup Asia Uploader — Boot Error Report'` | `PluginConfigType::Name->value . ' — Boot Error Report'` | User-facing text uses hardcoded name |
| 9.4 | `'⚠️ Riseup Asia Uploader:'` in admin notices | `'⚠️ ' . PluginConfigType::Name->value . ':'` | Admin HTML uses hardcoded name |
| 9.5 | `'# Riseup Asia Uploader - Security'` in generated files | `'# ' . PluginConfigType::Name->value . ' - Security'` | Generated file comments use hardcoded name |
| 9.6 | `'from the Riseup Asia Uploader plugin.'` | `'from the ' . PluginConfigType::Name->value . ' plugin.'` | Email body uses hardcoded name |
| 9.7 | `'riseup-asia-uploader'` as inline string in templates | `PluginConfigType::Slug->value` passed via controller or used directly | Template uses hardcoded slug |
| 9.8 | `'Riseup Asia Uploader'` as inline string in template HTML | `<?= esc_html(PluginConfigType::Name->value) ?>` | Template uses hardcoded plugin name |

### PHP Const Limitation

PHP `const` expressions cannot reference enum cases (`PluginConfigType::LogPrefix->value`). For classes that previously used `private const LOG_PREFIX = '[Riseup Asia] ClassName: '`, replace with a private static method:

```php
// ❌ FORBIDDEN — hardcoded prefix in const
private const LOG_PREFIX = '[Riseup Asia] AdminMailer: ';

// ✅ REQUIRED — derived from enum at runtime
private static function logPrefix(): string {
    return PluginConfigType::LogPrefix->value . ' AdminMailer: ';
}
```

### Exception

The `Autoloader` class is **exempt** — it loads before enums are available and explicitly cannot depend on `PluginConfigType`. Its hardcoded `LOG_PREFIX` is acceptable.

PHPDoc `@package` headers and file-level doc block comments (e.g., `* Riseup Asia Uploader - File Logger`) are documentation, not logic — they are exempt from this rule.

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — §8, §9*
