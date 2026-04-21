# 20.10 Step 9 — Database Migration (SQLite)

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 8, §8.5** — SQLite migrations via traits.

---

**File: `includes/Database/DatabaseMigrationsTrait.php`**

```php
<?php
namespace TaskTracker\Database;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;

trait DatabaseMigrationsTrait
{
    /**
     * Run all pending migrations. Called from Activator::activate().
     *
     * @param \PDO $pdo The SQLite connection
     */
    private function runMigrations(\PDO $pdo): void
    {
        // ── Migration 001: Tasks table ──
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS tasks (
                Id         INTEGER PRIMARY KEY AUTOINCREMENT,
                Title      TEXT    NOT NULL,
                Priority   INTEGER NOT NULL DEFAULT 0,
                Status     TEXT    NOT NULL DEFAULT 'pending',
                CreatedAt  TEXT    NOT NULL DEFAULT (datetime('now')),
                UpdatedAt  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        ");

        $this->fileLogger->info('Database migrations complete');
    }
}
```

## Rules applied

| Rule | Detail | Phase |
|------|--------|-------|
| `CREATE TABLE IF NOT EXISTS` | Idempotent migrations | Phase 8, §8.5 |
| Status column uses enum value | `'pending'` = `TaskStatusType::Pending->value` | Phase 2 |
| Datetime defaults use SQLite `datetime('now')` | UTC timestamps | Phase 4, §4.13 |
