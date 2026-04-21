# 5.1 Helper Classes

> **Parent:** [00-overview.md](./00-overview.md)

Helpers are **stateless static utility classes**. They never hold instance state, never depend on `$this`, and never access WordPress hooks.

## Standard helpers

| Helper | Responsibility |
|--------|---------------|
| `DateHelper` | All timestamp formatting and timezone conversion (see Phase 4, §4.13) |
| `PathHelper` | File path resolution, directory creation, uploads dir resolution (§5.1) |
| `BooleanHelpers` | Semantic boolean guards — readable negation wrappers ([§5.1.1](./02-boolean-helpers.md)) |
| `InitHelpers` | Bootstrap initialization, SQLite connection, component tracking ([§5.1.2](./03-init-helpers.md)) |
| `ErrorLogHelper` | Native `error_log()` wrapper with stack traces (see Phase 4, §4.11) |
| `EnvelopeBuilder` | Constructs the standard API response envelope ([§5.3](./05-response-envelope.md)) |
| `HttpConfigType` | HTTP request option factories for `wp_remote_*()` ([§5.1.3](./04-http-config-type.md)) — note: this is an enum with static factory methods |
| `TypeCheckerTrait` | Syntax-validator-safe type checking (see Phase 3, §3.8) — note: this is a trait, not a helper, because it needs `$this` context |

## PathHelper specification

PathHelper centralises all file system path resolution. It uses trait decomposition for large helpers:

```
Helpers/
├── PathHelper.php              ← Shell class, composes 3 traits
└── Traits/
    ├── PathHelperCoreTrait.php  ← Base dir, join(), typed accessors
    ├── PathHelperDirTrait.php   ← Directory guards, creation, security files
    └── PathHelperFileTrait.php  ← File guards, delete, relative paths
```

### Core methods (PathHelperCoreTrait)

| Method | Returns |
|--------|---------|
| `join(string ...$segments)` | Normalised path from segments (forward slashes, no doubles) |
| `getBaseDir()` | `wp-content/uploads/{plugin-slug}` via `wp_upload_dir()` |
| `getLogsDir()` | `{baseDir}/logs` — uses `PathSubdirType::Logs` enum |
| `getTempDir()` | `{baseDir}/temp` — uses `PathSubdirType::Temp` enum |
| `getDbPath()` | `{baseDir}/riseup-asia-uploader.db` — uses `PathDatabaseType::Plugin` enum |
| `getPluginDir()` | `WP_PLUGIN_DIR/{slug}` |
| `getPluginMainFile()` | `{pluginDir}/{slug}.php` |
| `getConstantsFile()` | `{pluginDir}/includes/constants.php` |
| `getEndpointsJsonPath()` | `{pluginDir}/data/endpoints.json` |

### Directory methods (PathHelperDirTrait)

| Method | Purpose |
|--------|---------|
| `isDirExists($path)` | Guard: non-empty and `is_dir()` |
| `isDirMissing($path)` | Negation of `isDirExists()` |
| `isDirWritable($path)` | Guard: exists and writable |
| `isDirReadonly($path)` | Negation of `isDirWritable()` |
| `makeDirectory($path, $secure)` | Creates dir via `wp_mkdir_p()`, optionally adds security files |
| `addSecurityFiles($path)` | Creates `.htaccess` (deny all) and `index.php` (silence) |
| `ensureDirectory($dir)` | Recursively creates directory if missing; returns `bool` |
| `ensureFileParentDirectory($filePath)` | Ensures parent dir exists for a file path |
| `isSafePath($path, $basePath)` | Path traversal guard — prevents `../` attacks |
| `isDirEmpty($path)` | True when directory has no entries |

### File methods (PathHelperFileTrait)

| Method | Purpose |
|--------|---------|
| `isFileExists($path)` | Guard: non-empty and `file_exists()` |
| `isFileMissing($path)` | Negation wrapper |
| `isFileUnreadable($path)` | Missing or not readable |
| `deleteFile($path)` | Safe unlink with chmod retry and clearstatcache |
| `deleteDir($path)` | Recursive directory removal |
| `getRelativePath($fullPath)` | Strips base dir prefix |
| `formatBytes($bytes)` | Human-readable file size |

### Typed path accessors via enums

All subdirectory names and database file names come from enums — no magic strings:

```php
enum PathSubdirType: string {
    case Logs      = '/logs';
    case Temp      = '/temp';
    case Snapshots = '/snapshots';
    case Exports   = '/exports';
    case Backups   = '/backups';
}

enum PathDatabaseType: string {
    case Root     = '/a-root.db';
    case Activity = '/activity.db';
    case Snapshot = '/snapshots.db';
    case Plugin   = '/riseup-asia-uploader.db';
}
```

Usage: `self::join(self::getBaseDir(), PathSubdirType::Logs->value)` — never hardcode `/logs`.

## Key design principle

Path resolution uses `wp_upload_dir()` for the base and caches the result. If `wp_upload_dir()` returns an invalid result, it falls back to `WP_CONTENT_DIR . '/uploads'`.

## Related

- [02-boolean-helpers.md](./02-boolean-helpers.md) — Semantic boolean guards
- [03-init-helpers.md](./03-init-helpers.md) — Bootstrap initialization
- [07-database-and-split-db.md](./07-database-and-split-db.md) — Database class structure
