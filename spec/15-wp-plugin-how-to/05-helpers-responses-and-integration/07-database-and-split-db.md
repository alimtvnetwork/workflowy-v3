# 5.5 Database — Split DB Concept & Class Decomposition

> **Parent:** [00-overview.md](./00-overview.md)

## 5.5 Split DB Concept

Plugins that need data persistence use SQLite stored in `wp-content/uploads/{plugin-slug}/` rather than WordPress's MySQL database. This provides:

| Benefit | Detail |
|---------|--------|
| Isolation | Plugin data is completely separate from WordPress tables |
| Portability | Database file can be backed up, moved, or deleted independently |
| No migration conflicts | No interference with WordPress core or other plugin migrations |
| Schema versioning | Track migration versions inside the SQLite database itself |

### Database location

```
wp-content/uploads/{plugin-slug}/{plugin-slug}.db
```

### Multi-DB expansion (Split DB)

Larger plugins may split data across multiple SQLite files. Each database is identified by a `PathDatabaseType` enum case:

```
wp-content/uploads/{plugin-slug}/
├── {plugin-slug}.db   ← Main plugin data (PathDatabaseType::Plugin)
├── a-root.db          ← Cross-plugin registration (PathDatabaseType::Root)
├── activity.db        ← Transaction/activity logs (PathDatabaseType::Activity)
└── snapshots.db       ← Snapshot exports (PathDatabaseType::Snapshot)
```

Each database path is resolved via `PathHelper::join(PathHelper::getBaseDir(), PathDatabaseType::Plugin->value)` — never hardcoded.

> **Reference:** For the Go backend implementation of Split DB with child database connection pooling, see `backend/internal/database/Database.go`.

### Schema versioning

Store a `schema_version` value in the database (either a dedicated table or SQLite `user_version` pragma). On plugin activation or init, compare the stored version to the expected version and run any pending migrations.

---

## 5.5.1 Database Class — Trait Decomposition

The Database class follows the same shell + trait pattern as helpers. The class holds shared state (`$pdo`, `$dbPath`, `$fileLogger`) while traits provide domain-specific logic:

```
Database/
├── Database.php                        ← Shell class (singleton, shared state)
└── Traits/
    ├── DatabaseConnectionTrait.php     ← init(), getPdo(), isReady(), migration orchestrator
    ├── DatabaseConvenienceTrait.php    ← queryAll(), querySingle(), insert(), update(), delete()
    ├── DatabaseQueryTrait.php          ← Shell: composes query sub-traits
    │   ├── DatabaseQueryLogTrait.php   ← Transaction log queries
    │   └── DatabaseQuerySearchTrait.php ← Search/filter queries
    ├── DatabaseMigrationsEarlyTrait.php ← Shell: composes v1-v5 migration traits
    │   ├── DatabaseMigrationsV1V3Trait.php
    │   └── DatabaseMigrationsV4V5Trait.php
    ├── DatabaseMigrationsLateTrait.php  ← Shell: composes v6+ migration traits
    │   ├── DatabaseMigrationsV6V8Trait.php
    │   ├── DatabaseMigrationsV9V11Trait.php
    │   └── DatabaseMigrationsV12Trait.php ... V22Trait.php
    └── OrmQueryTrait.php, OrmMutationTrait.php, OrmWhereTrait.php  ← Micro-ORM
```

### Shell class pattern

```php
class Database {
    use DatabaseConnectionTrait;
    use DatabaseConvenienceTrait;
    use DatabaseMigrationsEarlyTrait;
    use DatabaseMigrationsLateTrait;
    use DatabaseQueryTrait;

    private ?PDO $pdo = null;
    private string $dbPath = '';
    private FileLogger $fileLogger;
    private static ?self $instance = null;
    private bool $isInitAttempted = false;

    public static function getInstance(): self { /* singleton */ }
    private function __construct() { $this->fileLogger = FileLogger::getInstance(); }
}
```

### ConnectionTrait responsibilities

| Method | Purpose |
|--------|---------|
| `init()` | Lazy initialization — only runs once via `$isInitAttempted` guard |
| `getDatabasePath()` | Resolves path via `PathHelper::getDbPath()`, ensures directory exists |
| `initDatabase()` | Creates PDO, configures ORM, runs migrations, logs timing |
| `createTables()` | Migration orchestrator — calls all `migrateV*()` methods in sequence |
| `ensureSchemaVersionTable()` | Creates `schema_version` table if missing |
| `getCurrentSchemaVersion()` | `SELECT MAX(version)` from schema_version |
| `recordMigration($version)` | Inserts version + UTC timestamp after successful migration |
| `getPdo()` | Returns PDO (triggers lazy init if needed) |
| `isReady()` | Boolean: is PDO connected? |

### ConvenienceTrait — Thin PDO wrappers

| Method | Purpose |
|--------|---------|
| `queryAll($sql, $params)` | SELECT → all rows as assoc arrays |
| `querySingle($sql, $params)` | SELECT → single row |
| `insert($table, $data)` | INSERT from associative array |
| `update($table, $data, $where, $whereParams)` | UPDATE with WHERE clause |
| `delete($table, $where, $whereParams)` | DELETE with WHERE clause |
| `execute($sql, $params)` | Generic exec (DDL, DML) |
| `execIfColumnMissing($table, $column, $sql)` | Safe ADD COLUMN for idempotent migrations |

### Migration trait pattern

Each migration method follows this guard pattern:

```php
private function migrateV4SourceMachine(int $current): void {
    if ($current >= 4) { return; }

    $this->pdo->exec("ALTER TABLE transactions ADD COLUMN source_machine TEXT DEFAULT ''");
    $this->recordMigration(4);
}
```

When migrations grow beyond 200 lines, split into sub-traits grouped by version range and compose them via shell traits (`DatabaseMigrationsEarlyTrait`, `DatabaseMigrationsLateTrait`).

## Related

- [01-helper-classes.md](./01-helper-classes.md) — PathHelper for `getDbPath()` resolution
- [03-init-helpers.md](./03-init-helpers.md) — `initSqliteConnection` used in `initDatabase()`
