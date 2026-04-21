# 16.13 ErrorSessions Table — SQLite Migration

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Error sessions require a dedicated SQLite table. This migration follows the pattern from Phase 8, §8.5.

## Migration trait: `DatabaseMigrationsErrorSessionsTrait.php`

```php
namespace PluginName\Database\Traits;

if (!defined('ABSPATH')) {
    exit;
}

use PDOException;
use PluginName\Enums\TableType;

trait DatabaseMigrationsErrorSessionsTrait
{
    /**
     * Create ErrorSessions table for grouped error tracking.
     * Version: Assign the next sequential migration number in your plugin.
     */
    private function migrateErrorSessions(int $current, int $version): void
    {
        if ($current >= $version) {
            return;
        }

        $this->fileLogger->info("Applying migration v{$version}: ErrorSessions table");
        $table = TableType::ErrorSessions->value;

        $sql = <<<SQL
            CREATE TABLE IF NOT EXISTS {$table} (
                Id              INTEGER PRIMARY KEY AUTOINCREMENT,
                SessionId       TEXT    NOT NULL UNIQUE,
                ErrorCount      INTEGER NOT NULL DEFAULT 0,
                FirstErrorType  TEXT    DEFAULT '',
                FirstMessage    TEXT    DEFAULT '',
                Severity        TEXT    NOT NULL DEFAULT 'error',
                IsSeen          INTEGER NOT NULL DEFAULT 0,
                PluginVersion   TEXT    DEFAULT '',
                CreatedAt       TEXT    NOT NULL DEFAULT (datetime('now')),
                UpdatedAt       TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        SQL;

        $this->pdo->exec($sql);

        $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_es_session_id ON {$table}(SessionId)");
        $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_es_is_seen ON {$table}(IsSeen)");
        $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_es_created ON {$table}(CreatedAt)");
        $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_es_severity ON {$table}(Severity)");

        $this->recordMigration($version);
    }
}
```

## Required TableType enum case

```php
enum TableType: string
{
    case Settings = 'Settings';
    case ErrorSessions = 'ErrorSessions';
}
```

## Column reference

| Column | Type | Description |
|--------|------|-------------|
| `Id` | INTEGER PK | Auto-increment primary key |
| `SessionId` | TEXT UNIQUE | UUID or timestamp-based session identifier |
| `ErrorCount` | INTEGER | Number of errors captured in this session |
| `FirstErrorType` | TEXT | PHP error type label (e.g., `E_WARNING`) |
| `FirstMessage` | TEXT | First error message in the session |
| `Severity` | TEXT | Highest severity: `fatal`, `error`, `warning` |
| `IsSeen` | INTEGER | `0` = unseen (shows badge), `1` = dismissed |
| `PluginVersion` | TEXT | Plugin version that generated the errors |
| `CreatedAt` | TEXT | Session creation timestamp |
| `UpdatedAt` | TEXT | Last error added timestamp |

## Integration points

| Component | How it uses ErrorSessions |
|-----------|--------------------------|
| Shutdown handler (Phase 4, §4.13) | Creates new session or increments `ErrorCount` |
| Admin menu badge (Phase 8, §8.1) | Counts rows where `IsSeen = 0` |
| Flash banner (§16.6) | Queries unseen count |
| Dismiss AJAX (§16.5) | Sets `IsSeen = 1` for all rows |
| Clear all (§16.11) | Deletes all rows from table |
| Error detail modal (§16.12) | Queries single session by `SessionId` |
