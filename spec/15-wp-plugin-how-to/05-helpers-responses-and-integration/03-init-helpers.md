# 5.1.2 InitHelpers — Bootstrap Initialization

> **Parent:** [00-overview.md](./00-overview.md)

InitHelpers handles early-boot operations where `FileLogger` may not yet be available. It uses two traits:

```
Helpers/
├── InitHelpers.php           ← Shell class, composes 2 traits
└── Traits/
    ├── InitDirTrait.php      ← Directory creation with fallback chain
    └── InitStartupTrait.php  ← Component startup tracking and diagnostics
```

## Core methods (InitHelpers shell)

| Method | Purpose |
|--------|---------|
| `initSqliteConnection($dbPath, $logger)` | Creates PDO connection with WAL mode and pragmas |
| `errorLogWithPrefix($message)` | Native `error_log()` with plugin prefix — use before FileLogger is available |
| `errorLog($e, $context)` | Log exception to native `error_log()` |
| `errorLogAndThrow($e, $context)` | Log then re-throw — for boot failures that must propagate |

## InitDirTrait — Directory creation

| Method | Purpose |
|--------|---------|
| `makeDirectory($path, $secure)` | Creates directory with deduplication cache; delegates to PathHelper when available, falls back to native `mkdir()` |
| `makeSubDirectory($baseDir, $subDir, $secure)` | Creates parent + child directory in one call |
| `resolveBaseDir()` | Resolves uploads base dir with `wp_upload_dir()` fallback |
| `addSecurityFiles($path)` | Creates `.htaccess` and `index.php` security files |

## InitStartupTrait — Component tracking

| Method | Purpose |
|--------|---------|
| `initComponent($name, $initFn)` | Wraps a boot callable with timing, error capture, and verbose logging |
| `getStartupResults()` | Returns all tracked component results |
| `getFailedStartups()` | Returns only failed components |
| `allStartupsSucceeded()` | Boolean: true if no failures |
| `logStartupSummary($logger)` | Logs total count, failures, and elapsed time |

## Boot verbose mode

Add `define('PLUGINNAME_DEBUG_BOOT', true)` to `wp-config.php` to enable per-component init logging for troubleshooting startup issues. The `isBootVerbose()` method gates these detailed log entries.

## SQLite connection pattern

```php
$pdo = InitHelpers::initSqliteConnection($dbPath, $logger);
// Internally:
// 1. Checks PDO class exists (BooleanHelpers::isClassMissing)
// 2. Checks pdo_sqlite extension loaded (BooleanHelpers::isExtensionMissing)
// 3. Creates PDO with 'sqlite:' DSN
// 4. Sets ERRMODE_EXCEPTION and FETCH_ASSOC
// 5. Applies PRAGMA journal_mode = WAL and auto_vacuum = INCREMENTAL
// 6. Returns PDO or null on failure
```

## Related

- [02-boolean-helpers.md](./02-boolean-helpers.md) — Used internally for class/extension guards
- [07-database-and-split-db.md](./07-database-and-split-db.md) — Full database initialization
