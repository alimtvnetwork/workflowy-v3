# 8.5.1 Database Seeding — Initial Data from JSON Files

> **Parent:** [Phase 8 overview](./00-overview.md)  
> **Companion:** [`./05-database-migrations.md`](./05-database-migrations.md)

---

## Concept

Seeding is the process of populating database tables with **default data** on first activation and **updated data** on version upgrades. Seed data lives in JSON files inside the plugin source — not hardcoded in PHP. This allows non-developers to review and modify defaults without touching code.

## Folder structure

```
plugin-slug/
├── data/
│   └── seeds/
│       ├── manifest.json          ← Declares which seeds exist and their strategy
│       ├── settings.json          ← Default plugin settings
│       ├── templates.json         ← Default templates / presets
│       └── permissions.json       ← Default role-capability mappings
```

## manifest.json — Seed Registry

The manifest declares every seed file, which table it targets, and the strategy to apply. The optional `version` field is **metadata only** — it documents which plugin version introduced the seed but is **not used by the seeder logic**. Version tracking is handled per-file via the `seed_history` table (see `getLastSeededVersion()`).

```json
{
  "seeds": [
    {
      "file": "settings.json",
      "table": "settings",
      "version": "1.0.0",
      "strategy": "insert_if_empty"
    },
    {
      "file": "templates.json",
      "table": "templates",
      "version": "1.0.0",
      "strategy": "insert_if_empty"
    },
    {
      "file": "permissions.json",
      "table": "permissions",
      "version": "1.2.0",
      "strategy": "upsert_by_key"
    }
  ]
}
```

> **Note:** The `version` field is kept as human-readable metadata so developers can see when each seed was introduced. The seeder ignores it — re-seeding is triggered solely by comparing the plugin's current version against `seed_history.last_seeded_ver` per file.

## Seeding strategies

| Strategy | Behaviour | Use when |
|----------|-----------|----------|
| `insert_if_empty` | Only seeds if the target table has zero rows | First activation — don't overwrite user customisations |
| `upsert_by_key` | Inserts new rows, updates existing rows by primary key | Version upgrade adds new defaults without wiping user data |
| `replace_all` | Truncates table and re-inserts all rows | Non-user-editable reference data (e.g., error codes, system constants) |

## Seed file format

Each JSON file is an array of row objects. Keys match column names:

```json
[
  {
    "key": "log_level",
    "value": "info",
    "description": "Minimum log severity to persist",
    "is_user_editable": true
  },
  {
    "key": "max_upload_size_mb",
    "value": "50",
    "description": "Maximum file upload size in megabytes",
    "is_user_editable": true
  },
  {
    "key": "api_version",
    "value": "v1",
    "description": "Current REST API version",
    "is_user_editable": false
  }
]
```

## DatabaseSeeder — Complete Implementation

```php
namespace PluginName\Database;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use PluginName\Enums\PluginConfigType;
use PluginName\Enums\SeedStrategyType;
use PluginName\Helpers\PathHelper;
use PluginName\Helpers\ErrorLogHelper;

final class DatabaseSeeder
{
    private \SQLite3 $db;
    private string $seedsDir;

    /**
     * @param \SQLite3    $db       Database connection
     * @param string|null $seedsDir Path to seeds directory (default: plugin's data/seeds/)
     */
    public function __construct(\SQLite3 $db, ?string $seedsDir = null)
    {
        $this->db = $db;
        $this->seedsDir = $seedsDir ?? plugin_dir_path(dirname(__DIR__)) . 'data/seeds';
    }

    /**
     * Run all pending seeds based on the manifest and current version.
     * Called after migrations complete (schema must exist before data).
     *
     * @param string|null $version Override version (default: reads from PluginConfigType::Version)
     */
    public function seedAll(?string $version = null): void
    {
        $manifestPath = $this->seedsDir . '/manifest.json';
        $hasManifest = file_exists($manifestPath);

        if (!$hasManifest) {
            return;
        }

        $manifestRaw = file_get_contents($manifestPath);
        $manifest = json_decode($manifestRaw, true);
        $hasSeeds = (gettype($manifest) === 'array' && isset($manifest['seeds']));

        if (!$hasSeeds) {
            return;
        }

        $currentVersion = $version ?? PluginConfigType::Version->value;

        $this->ensureSeedHistoryTable();

        foreach ($manifest['seeds'] as $seedEntry) {
            $this->processSeedEntry($seedEntry, $currentVersion);
        }
    }

    /**
     * Process a single seed entry from the manifest.
     *
     * @param array<string, string> $entry          Manifest entry
     * @param string                $currentVersion Current plugin version
     */
    private function processSeedEntry(array $entry, string $currentVersion): void
    {
        $seedFile = $entry['file'] ?? '';
        $table = $entry['table'] ?? '';
        $strategyValue = $entry['strategy'] ?? 'insert_if_empty';

        // Per-file version tracking — skip if already seeded at this version or newer
        $lastSeeded = $this->getLastSeededVersion($seedFile);
        $isAlreadySeeded = (
            $lastSeeded !== null
            && version_compare($currentVersion, $lastSeeded, '<=')
        );

        if ($isAlreadySeeded) {
            return;
        }

        $filePath = $this->seedsDir . '/' . $seedFile;
        $hasFile = file_exists($filePath);

        if (!$hasFile) {
            error_log("[Seeder] Seed file not found: {$filePath}");

            return;
        }

        $strategy = SeedStrategyType::tryFrom($strategyValue);
        $hasStrategy = ($strategy !== null);

        if (!$hasStrategy) {
            error_log("[Seeder] Unknown strategy: {$strategyValue}");

            return;
        }

        try {
            $rawData = file_get_contents($filePath);
            $rows = json_decode($rawData, true);
            $hasRows = (gettype($rows) === 'array' && count($rows) > 0);

            if (!$hasRows) {
                return;
            }

            $this->db->exec('BEGIN TRANSACTION');

            match ($strategy) {
                SeedStrategyType::InsertIfEmpty => $this->seedInsertIfEmpty($table, $rows),
                SeedStrategyType::UpsertByKey   => $this->seedUpsertByKey($table, $rows),
                SeedStrategyType::ReplaceAll    => $this->seedReplaceAll($table, $rows),
            };

            $this->db->exec('COMMIT');

            // Record per-file version after successful seed
            $this->setLastSeededVersion($seedFile, $currentVersion);
        } catch (Throwable $e) {
            $this->db->exec('ROLLBACK');

            ErrorLogHelper::log($e, "Seeder:{$seedFile}:");
        }
    }

    /**
     * Insert rows only if the table is completely empty.
     */
    private function seedInsertIfEmpty(string $table, array $rows): void
    {
        $count = $this->db->querySingle("SELECT COUNT(*) FROM {$table}");
        $hasExistingData = ($count > 0);

        if ($hasExistingData) {
            return;
        }

        $this->insertRows($table, $rows);
    }

    /**
     * Insert new rows, update existing rows by primary key.
     * Uses SQLite's INSERT OR REPLACE.
     */
    private function seedUpsertByKey(string $table, array $rows): void
    {
        $this->insertRows($table, $rows, 'INSERT OR REPLACE');
    }

    /**
     * Delete all existing rows and re-insert from seed file.
     */
    private function seedReplaceAll(string $table, array $rows): void
    {
        $this->db->exec("DELETE FROM {$table}");
        $this->insertRows($table, $rows);
    }

    /**
     * Insert an array of rows into a table.
     *
     * @param string                          $table  Target table name
     * @param array<int, array<string, mixed>> $rows   Row data
     * @param string                          $verb   SQL verb (INSERT or INSERT OR REPLACE)
     */
    private function insertRows(string $table, array $rows, string $verb = 'INSERT'): void
    {
        $columns = array_keys($rows[0]);
        $columnList = implode(', ', $columns);
        $placeholders = implode(', ', array_map(fn($c) => ":{$c}", $columns));

        $sql = "{$verb} INTO {$table} ({$columnList}) VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);

        foreach ($rows as $row) {
            foreach ($columns as $column) {
                $value = $row[$column] ?? null;
                $stmt->bindValue(":{$column}", $value);
            }

            $stmt->execute();
            $stmt->reset();
        }
    }

    /**
     * Ensure the seed_history table exists.
     */
    private function ensureSeedHistoryTable(): void
    {
        $this->db->exec('
            CREATE TABLE IF NOT EXISTS seed_history (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                seed_file       TEXT    NOT NULL UNIQUE,
                last_seeded_ver TEXT    NOT NULL,
                seeded_at       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ');
    }

    /**
     * Get the last version a specific seed file was applied at.
     */
    private function getLastSeededVersion(string $seedFile): ?string
    {
        $stmt = $this->db->prepare(
            "SELECT last_seeded_ver FROM seed_history WHERE seed_file = :file"
        );
        $stmt->bindValue(':file', $seedFile, SQLITE3_TEXT);
        $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

        $hasResult = (gettype($result) === 'array' && isset($result['last_seeded_ver']));

        return $hasResult ? $result['last_seeded_ver'] : null;
    }

    /**
     * Record the version a specific seed file was applied at.
     */
    private function setLastSeededVersion(string $seedFile, string $version): void
    {
        $stmt = $this->db->prepare(
            "INSERT OR REPLACE INTO seed_history (seed_file, last_seeded_ver)
             VALUES (:file, :version)"
        );
        $stmt->bindValue(':file', $seedFile, SQLITE3_TEXT);
        $stmt->bindValue(':version', $version, SQLITE3_TEXT);
        $stmt->execute();
    }
}
```

## SeedStrategyType Enum

```php
namespace PluginName\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum SeedStrategyType: string
{
    case InsertIfEmpty = 'insert_if_empty';
    case UpsertByKey   = 'upsert_by_key';
    case ReplaceAll    = 'replace_all';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

## Integration with DatabaseMigrator

Seeding runs **after** migrations (schema must exist before data is inserted):

```php
// In DatabaseMigrator::runAllPending() — add seeding after migrations
public static function runAllPending(): void
{
    $migrator = new self();
    $migrator->runPending();

    // Seed data after schema is up to date
    $seeder = new DatabaseSeeder($migrator->db);
    $seeder->seedAll();  // Uses PluginConfigType::Version by default
}
```

## Version upgrade flow

```
1. User updates plugin from v1.0.0 to v1.2.0
2. WordPress calls register_activation_hook → Activator::activate()
3. Activator calls DatabaseMigrator::runAllPending()
4. Migrator runs migration v2 (adds is_active column)
5. Migrator calls DatabaseSeeder::seedAll()
6. Seeder reads manifest.json and checks per-file seed_history:
   - settings.json → seed_history shows last_seeded_ver "1.0.0" < "1.2.0" → RE-SEED
   - permissions.json → no seed_history entry → SEED (first run for this file)
7. Seeder records last_seeded_ver = "1.2.0" per file in seed_history table
8. Next activation at v1.2.0: seedAll() sees per-file versions unchanged → skips all
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| Seed file has invalid JSON | `json_decode` returns null → logged, skipped, no crash |
| Seed file references non-existent table | SQLite throws → caught by transaction rollback |
| User modified seeded data, then plugin upgrades | `insert_if_empty` preserves user data; `upsert_by_key` adds new rows but updates existing keys; `replace_all` only for system data the user should never edit |
| Downgrade (v1.2.0 → v1.0.0) | `lastSeededVersion` is higher than manifest entries → all seeds skipped → safe |
| Manifest missing | `seedAll()` returns immediately — no error |
| Seed file added in new version but missing from manifest | Not processed — all seeds must be declared in manifest |
| Empty seed file (empty JSON array) | Detected by `count($rows) === 0` → skipped |
