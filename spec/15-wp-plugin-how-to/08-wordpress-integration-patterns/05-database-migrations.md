# 8.5 Database Migrations (SQLite)

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## Migration runner pattern

```php
namespace PluginName\Database;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use PluginName\Helpers\PathHelper;
use PluginName\Helpers\ErrorLogHelper;

final class DatabaseMigrator
{
    private \SQLite3 $db;

    /** @var array<int, callable> Migrations keyed by version number. */
    private array $migrations = [];

    public function __construct()
    {
        $dbPath = PathHelper::getBaseDir() . '/plugin-name.db';
        PathHelper::ensureFileParentDirectory($dbPath);

        $this->db = new \SQLite3($dbPath);
        $this->db->enableExceptions(true);

        // Ensure migrations table exists
        $this->db->exec('
            CREATE TABLE IF NOT EXISTS migrations (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
            )
        ');

        $this->registerMigrations();
    }

    /**
     * Register all migrations. Each migration is a callable that receives the SQLite3 instance.
     */
    private function registerMigrations(): void
    {
        $this->migrations[1] = function (\SQLite3 $db): void {
            $db->exec('
                CREATE TABLE IF NOT EXISTS widgets (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    slug TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ');
        };

        $this->migrations[2] = function (\SQLite3 $db): void {
            $db->exec('ALTER TABLE widgets ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1');
        };

        // Add new migrations here with incrementing version numbers
    }

    /**
     * Run all pending migrations in order.
     */
    public function runPending(): void
    {
        $currentVersion = $this->getCurrentVersion();

        foreach ($this->migrations as $version => $migration) {
            $isAlreadyApplied = ($version <= $currentVersion);

            if ($isAlreadyApplied) {
                continue;
            }

            try {
                $this->db->exec('BEGIN TRANSACTION');

                $migration($this->db);

                $stmt = $this->db->prepare(
                    'INSERT INTO migrations (version, applied_at) VALUES (:version, :applied_at)'
                );
                $stmt->bindValue(':version', $version, SQLITE3_INTEGER);
                $stmt->bindValue(':applied_at', gmdate('c'), SQLITE3_TEXT);
                $stmt->execute();

                $this->db->exec('COMMIT');
            } catch (Throwable $e) {
                $this->db->exec('ROLLBACK');

                ErrorLogHelper::logAndThrow($e, "Migration v{$version}:");
            }
        }
    }

    /**
     * Get the highest applied migration version.
     */
    private function getCurrentVersion(): int
    {
        $result = $this->db->querySingle('SELECT MAX(version) FROM migrations');
        $hasVersion = ($result !== null && $result !== false);

        return $hasVersion ? (int) $result : 0;
    }

    /**
     * Static entry point for Activator.
     */
    public static function runAllPending(): void
    {
        $migrator = new self();
        $migrator->runPending();
    }
}
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| SQLite3 extension not installed | Check `extension_loaded('sqlite3')` in Activator, fail gracefully |
| Migration fails midway | Transaction + ROLLBACK ensures no partial schema changes |
| Database file locked (concurrent access) | SQLite handles this with WAL mode; enable via `$db->exec('PRAGMA journal_mode=WAL')` |
| Database file deleted while plugin active | Recreate on next access — check file exists before opening |
| Adding column to existing table | SQLite doesn't support `DROP COLUMN` — use `ALTER TABLE ADD COLUMN` only |

> See also: [`./06-database-seeding.md`](./06-database-seeding.md) — runs after migrations to populate initial data.
