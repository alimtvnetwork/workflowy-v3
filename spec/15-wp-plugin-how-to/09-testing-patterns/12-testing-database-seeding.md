# 9.14 Testing Database Seeding

> **Parent:** [Phase 9 overview](./00-overview.md)  
> **Ref:** [Phase 8 §8.5.1 — Database Seeding patterns](../08-wordpress-integration-patterns/06-database-seeding.md)

---

## 9.14.1 Test Fixtures

Create minimal seed fixtures under `tests/Fixtures/seeds/`:

**`tests/Fixtures/seeds/manifest.json`**
```json
{
    "version": "1.0.0",
    "seeds": [
        {
            "file": "settings.json",
            "table": "test_settings",
            "strategy": "insert_if_empty",
            "key_column": "setting_key"
        }
    ]
}
```

**`tests/Fixtures/seeds/settings.json`**
```json
[
    { "setting_key": "color_primary", "setting_value": "#3B82F6" },
    { "setting_key": "max_uploads",   "setting_value": "10" }
]
```

## 9.14.2 DatabaseSeederTest

```php
<?php

declare(strict_types=1);

namespace PluginName\Tests\Unit\Database;

use PHPUnit\Framework\TestCase;
use PluginName\Database\DatabaseSeeder;

final class DatabaseSeederTest extends TestCase
{
    private \SQLite3 $db;
    private string   $seedDir;

    protected function setUp(): void
    {
        parent::setUp();

        $this->db = new \SQLite3(':memory:');
        $this->db->exec('PRAGMA foreign_keys = ON');

        // Create the seed_history tracking table
        $this->db->exec('
            CREATE TABLE seed_history (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                seed_file        TEXT    NOT NULL UNIQUE,
                last_seeded_ver  TEXT    NOT NULL,
                seeded_at        TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ');

        // Create a target table for seed data
        $this->db->exec('
            CREATE TABLE test_settings (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key   TEXT NOT NULL UNIQUE,
                setting_value TEXT NOT NULL
            )
        ');

        $this->seedDir = __DIR__ . '/../../Fixtures/seeds';
    }

    protected function tearDown(): void
    {
        $this->db->close();
        parent::tearDown();
    }

    // ── insert_if_empty ─────────────────────────────────────

    public function testInsertIfEmptyPopulatesEmptyTable(): void
    {
        $seeder = new DatabaseSeeder($this->db, $this->seedDir);
        $seeder->seedAll('1.0.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        $this->assertSame(2, $result);
    }

    public function testInsertIfEmptySkipsNonEmptyTable(): void
    {
        // Pre-populate — seeder should leave it alone
        $this->db->exec(
            "INSERT INTO test_settings (setting_key, setting_value)
             VALUES ('existing_key', 'existing_value')"
        );

        $seeder = new DatabaseSeeder($this->db, $this->seedDir);
        $seeder->seedAll('1.0.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        $this->assertSame(1, $result, 'insert_if_empty must skip non-empty tables');
    }

    // ── upsert_by_key ───────────────────────────────────────

    public function testUpsertByKeyUpdatesExistingRows(): void
    {
        // Insert a row the seed will match on key_column
        $this->db->exec(
            "INSERT INTO test_settings (setting_key, setting_value)
             VALUES ('color_primary', '#000000')"
        );

        $seeder = $this->createSeederWithStrategy('upsert_by_key');
        $seeder->seedAll('1.0.0');

        $value = $this->db->querySingle(
            "SELECT setting_value FROM test_settings
             WHERE setting_key = 'color_primary'"
        );
        $this->assertSame('#3B82F6', $value, 'upsert must update existing row');
    }

    public function testUpsertByKeyInsertsNewRows(): void
    {
        // Table exists but has no matching key
        $this->db->exec(
            "INSERT INTO test_settings (setting_key, setting_value)
             VALUES ('unrelated_key', 'value')"
        );

        $seeder = $this->createSeederWithStrategy('upsert_by_key');
        $seeder->seedAll('1.0.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        // 1 existing + 2 from seed
        $this->assertSame(3, $result, 'upsert must insert non-existent rows');
    }

    // ── replace_all ─────────────────────────────────────────

    public function testReplaceAllTruncatesAndReinserts(): void
    {
        // Pre-populate with data that should be wiped
        $this->db->exec(
            "INSERT INTO test_settings (setting_key, setting_value)
             VALUES ('old_key', 'old_value')"
        );

        $seeder = $this->createSeederWithStrategy('replace_all');
        $seeder->seedAll('1.0.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        $this->assertSame(2, $result, 'replace_all must truncate then insert seed data');

        // Old row must be gone
        $old = $this->db->querySingle(
            "SELECT setting_value FROM test_settings
             WHERE setting_key = 'old_key'"
        );
        $this->assertNull($old, 'replace_all must remove pre-existing rows');
    }

    // ── Version tracking ────────────────────────────────────

    public function testSeedingRecordsVersionInHistory(): void
    {
        $seeder = new DatabaseSeeder($this->db, $this->seedDir);
        $seeder->seedAll('1.0.0');

        $version = $this->db->querySingle(
            "SELECT last_seeded_ver FROM seed_history
             WHERE seed_file = 'settings.json'"
        );
        $this->assertSame('1.0.0', $version);
    }

    public function testSameVersionDoesNotReseed(): void
    {
        $seeder = new DatabaseSeeder($this->db, $this->seedDir);
        $seeder->seedAll('1.0.0');

        // Modify data manually
        $this->db->exec(
            "UPDATE test_settings SET setting_value = 'CHANGED'
             WHERE setting_key = 'color_primary'"
        );

        // Run seeder again with same version
        $seeder->seedAll('1.0.0');

        $value = $this->db->querySingle(
            "SELECT setting_value FROM test_settings
             WHERE setting_key = 'color_primary'"
        );
        $this->assertSame(
            'CHANGED',
            $value,
            'Same version must NOT re-seed — user changes preserved'
        );
    }

    public function testNewerVersionTriggersReseed(): void
    {
        $seeder = new DatabaseSeeder($this->db, $this->seedDir);
        $seeder->seedAll('1.0.0');

        // Wipe so insert_if_empty can re-populate
        $this->db->exec('DELETE FROM test_settings');

        // Bump version
        $seeder->seedAll('1.1.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        $this->assertSame(2, $result, 'Newer version must trigger re-seed');

        $version = $this->db->querySingle(
            "SELECT last_seeded_ver FROM seed_history
             WHERE seed_file = 'settings.json'"
        );
        $this->assertSame('1.1.0', $version);
    }

    public function testOlderVersionDoesNotReseed(): void
    {
        $seeder = new DatabaseSeeder($this->db, $this->seedDir);
        $seeder->seedAll('2.0.0');

        $this->db->exec('DELETE FROM test_settings');

        // Attempt with older version
        $seeder->seedAll('1.0.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        $this->assertSame(
            0,
            $result,
            'Older version must NOT re-seed'
        );
    }

    // ── Edge cases ──────────────────────────────────────────

    public function testMissingSeedFileThrowsException(): void
    {
        $seeder = new DatabaseSeeder($this->db, '/nonexistent/path');

        $this->expectException(\RuntimeException::class);
        $seeder->seedAll('1.0.0');
    }

    public function testMalformedJsonThrowsException(): void
    {
        $tmpDir = sys_get_temp_dir() . '/bad_seeds_' . uniqid();
        mkdir($tmpDir, 0755, true);

        file_put_contents($tmpDir . '/manifest.json', json_encode([
            'version' => '1.0.0',
            'seeds'   => [[
                'file'       => 'bad.json',
                'table'      => 'test_settings',
                'strategy'   => 'insert_if_empty',
                'key_column' => 'setting_key',
            ]],
        ]));
        file_put_contents($tmpDir . '/bad.json', '{ invalid json !!!');

        $seeder = new DatabaseSeeder($this->db, $tmpDir);

        $this->expectException(\RuntimeException::class);
        $seeder->seedAll('1.0.0');

        // Cleanup
        array_map('unlink', glob($tmpDir . '/*'));
        rmdir($tmpDir);
    }

    public function testEmptySeedArrayInsertsNothing(): void
    {
        $tmpDir = sys_get_temp_dir() . '/empty_seeds_' . uniqid();
        mkdir($tmpDir, 0755, true);

        file_put_contents($tmpDir . '/manifest.json', json_encode([
            'version' => '1.0.0',
            'seeds'   => [[
                'file'       => 'empty.json',
                'table'      => 'test_settings',
                'strategy'   => 'insert_if_empty',
                'key_column' => 'setting_key',
            ]],
        ]));
        file_put_contents($tmpDir . '/empty.json', '[]');

        $seeder = new DatabaseSeeder($this->db, $tmpDir);
        $seeder->seedAll('1.0.0');

        $result = $this->db->querySingle(
            "SELECT COUNT(*) FROM test_settings"
        );
        $this->assertSame(0, $result, 'Empty seed array must insert nothing');

        array_map('unlink', glob($tmpDir . '/*'));
        rmdir($tmpDir);
    }

    // ── Helper ──────────────────────────────────────────────

    /**
     * Creates a seeder with a modified manifest that uses the given strategy.
     */
    private function createSeederWithStrategy(string $strategy): DatabaseSeeder
    {
        $tmpDir = sys_get_temp_dir() . '/seeds_' . $strategy . '_' . uniqid();
        mkdir($tmpDir, 0755, true);

        // Copy seed data file
        copy($this->seedDir . '/settings.json', $tmpDir . '/settings.json');

        // Write manifest with overridden strategy
        file_put_contents($tmpDir . '/manifest.json', json_encode([
            'version' => '1.0.0',
            'seeds'   => [[
                'file'       => 'settings.json',
                'table'      => 'test_settings',
                'strategy'   => $strategy,
                'key_column' => 'setting_key',
            ]],
        ]));

        return new DatabaseSeeder($this->db, $tmpDir);
    }
}
```

## 9.14.3 What Each Test Proves

| Test | Strategy | Assertion |
|------|----------|-----------|
| `testInsertIfEmptyPopulatesEmptyTable` | `insert_if_empty` | Seeds populate empty tables |
| `testInsertIfEmptySkipsNonEmptyTable` | `insert_if_empty` | Existing data is never overwritten |
| `testUpsertByKeyUpdatesExistingRows` | `upsert_by_key` | Matching `key_column` rows get updated values |
| `testUpsertByKeyInsertsNewRows` | `upsert_by_key` | Non-matching keys are inserted alongside existing data |
| `testReplaceAllTruncatesAndReinserts` | `replace_all` | Table is wiped and re-populated from seed JSON |
| `testSeedingRecordsVersionInHistory` | — | `seed_history` table tracks `last_seeded_ver` |
| `testSameVersionDoesNotReseed` | — | Identical version skips seeding (user changes preserved) |
| `testNewerVersionTriggersReseed` | — | Bumped version triggers re-seed |
| `testOlderVersionDoesNotReseed` | — | Downgraded version is ignored |
| `testMissingSeedFileThrowsException` | — | Missing `data/seeds/` directory throws `RuntimeException` |
| `testMalformedJsonThrowsException` | — | Invalid JSON in seed file throws `RuntimeException` |
| `testEmptySeedArrayInsertsNothing` | — | Empty `[]` seed file inserts zero rows |
