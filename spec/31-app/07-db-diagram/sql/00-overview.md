# SQLite DDL — Reference Implementation

> **Version:** 1.0.0  
> **Updated:** 2026-04-27 (UTC+8)  
> **Status:** ✅ SSOT for `.sql` schema files (AUDIT-AI-03 closure)  
> **Parent:** [`../00-overview.md`](../00-overview.md)

---

## What this folder contains

Concrete, executable **`.sql` files** the WordPress plugin runs at install/activate time. Every CREATE/INDEX/TRIGGER mirrors the ERDs in [`../02-root-db-erd.md`](../02-root-db-erd.md), [`../03-app-db-erd.md`](../03-app-db-erd.md), and [`../06-indexes.md`](../06-indexes.md), but in the **exact form SQLite parses**.

| File | Target DB | Purpose |
|------|-----------|---------|
| [`01-root-schema.sql`](./01-root-schema.sql) | `workflowy_root.db` | Identity, workspaces, system roles |
| [`02-app-schema.sql`](./02-app-schema.sql) | `workflowy_app_{WorkspaceId}.db` | Items, mirrors, shares, comments, etc. |
| [`03-app-indexes.sql`](./03-app-indexes.sql) | App DB | All performance indexes (run AFTER `02-app-schema.sql`) |
| [`04-app-triggers.sql`](./04-app-triggers.sql) | App DB | `UpdatedAt` auto-touch + soft-delete/restore cascade |
| [`05-root-seeds.sql`](./05-root-seeds.sql) | Root DB | Lookup seeds: `RoleType`, `WorkspaceRoleType` |
| [`06-app-seeds.sql`](./06-app-seeds.sql) | App DB | Lookup seeds: `ItemType` (12), `ShareRoleType` (3) |

> **Why split seeds**: SQLite parses an `executescript()` block in one pass before executing it. A single seed file referencing both Root-only and App-only tables fails on whichever DB is missing the tables. Two files keep each script self-contained and parseable.

---

## SQLite-specific rules these files enforce

These are the failure modes the AI must NOT introduce:

| ❌ Forbidden | ✅ Required | Why |
|--------------|-------------|-----|
| `BOOLEAN` | `INTEGER` storing `0`/`1` with `CHECK (col IN (0, 1))` | SQLite has **no** boolean type — it silently accepts any text/blob into a `BOOLEAN` column |
| `DATETIME` / `TIMESTAMP` | `TEXT` storing ISO-8601 (`YYYY-MM-DDTHH:MM:SS.sssZ`) | SQLite stores datetimes as TEXT under the hood; explicit TEXT prevents driver coercion bugs |
| `VARCHAR(n)` / `CHAR(n)` | `TEXT` (no length suffix) | SQLite ignores length on TEXT; suffix lies about enforcement |
| `AUTO_INCREMENT` | `INTEGER PRIMARY KEY` (autoincrements automatically as ROWID alias) | MySQL syntax; SQLite uses `AUTOINCREMENT` only when gap-free IDs are mandatory |
| `ON DELETE CASCADE` without `PRAGMA foreign_keys = ON;` | Schema MUST start with `PRAGMA foreign_keys = ON;` | SQLite ships with FKs **disabled** by default — every connection must enable |
| `ENUM(...)` column type | `INTEGER FK → {Lookup}Type` table | SQLite has no native enum; lookup tables + FKs are the canonical pattern |
| `ALTER TABLE ... DROP COLUMN` (pre 3.35) | Use migration recipe in [`../07-migrations.md`](../07-migrations.md) | Older SQLite builds lack DROP COLUMN; rebuild-and-copy required |

---

## How the plugin loads these files

```php
// wp-content/plugins/workflowy/includes/Schema/Installer.php
// Pseudocode — see 15-wp-plugin-how-to/01-foundation-and-architecture.md for full impl

public static function install(\PDO $pdo, string $kind): void {
    $pdo->exec('PRAGMA foreign_keys = ON;');
    $pdo->exec('PRAGMA journal_mode = WAL;');
    $pdo->exec('PRAGMA busy_timeout = 5000;');

    $base = __DIR__ . '/../../sql/';
    $files = $kind === 'root'
        ? ['01-root-schema.sql', '05-root-seeds.sql']
        : ['02-app-schema.sql', '03-app-indexes.sql', '04-app-triggers.sql', '06-app-seeds.sql'];

    foreach ($files as $file) {
        $sql = file_get_contents($base . $file);
        $pdo->exec($sql);
    }
}
```

---

## Verification

A green install MUST satisfy these queries (the harness from [`../../../15-wp-plugin-how-to/24-local-dev-harness.md`](../../../15-wp-plugin-how-to/24-local-dev-harness.md) runs them automatically):

```sql
-- (1) FKs are on
PRAGMA foreign_keys;             -- expects 1

-- (2) WAL is on
PRAGMA journal_mode;             -- expects "wal"

-- (3) All expected tables exist (Root)
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;
-- expects: RoleType, User, UserRole, Workspace, WorkspaceMember, WorkspaceRoleType

-- (4) All expected tables exist (App)
-- expects: ActivityLog, Attachment, Comment, Favorite, Item, ItemTag, ItemType,
--          Mention, Mirror, Share, ShareRoleType, SyncCursor, Tag, Template

-- (5) Required indexes exist
SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'Idx%' ORDER BY name;
-- expects 21 App-DB indexes per ../06-indexes.md
```

---

## Acceptance Tests

| ID | Statement |
|----|-----------|
| `AT-DDL-01` | Running `01-root-schema.sql` against an empty `:memory:` DB produces all 6 Root tables with the column types listed in [`../02-root-db-erd.md`](../02-root-db-erd.md). |
| `AT-DDL-02` | Running `02-app-schema.sql` then `03-app-indexes.sql` then `04-app-triggers.sql` produces all 14 App tables and 21 indexes from [`../06-indexes.md`](../06-indexes.md). |
| `AT-DDL-03` | No column uses `BOOLEAN`, `DATETIME`, `TIMESTAMP`, `VARCHAR`, or `ENUM`; static grep returns zero matches. |
| `AT-DDL-04` | `PRAGMA foreign_keys` returns `1` and `PRAGMA journal_mode` returns `wal` after install. |
| `AT-DDL-05` | Both `05-root-seeds.sql` and `06-app-seeds.sql` are idempotent (`INSERT OR IGNORE`); running each twice does not duplicate rows. |
| `AT-DDL-06` | Triggers in `04-app-triggers.sql` set `Item.UpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ','now')` on every UPDATE. |
| `AT-DDL-07` | Inserting `Item.IsCompleted = 2` (out of 0/1 range) raises a `CHECK` constraint violation. |
| `AT-DDL-08` | `Item.MirrorOfItemId` enforces `ON DELETE SET NULL` so deleting a source breaks (does not cascade-delete) its mirrors. |

---

## Related

| Topic | Link |
|-------|------|
| Logical ERDs | [`../02-root-db-erd.md`](../02-root-db-erd.md), [`../03-app-db-erd.md`](../03-app-db-erd.md) |
| Index catalogue | [`../06-indexes.md`](../06-indexes.md) |
| Migrations | [`../07-migrations.md`](../07-migrations.md) |
| WP plugin install hook | [`../../../15-wp-plugin-how-to/02-bootstrap-files.md`](../../../15-wp-plugin-how-to/02-bootstrap-files.md) |
| Local dev harness | [`../../../15-wp-plugin-how-to/24-local-dev-harness.md`](../../../15-wp-plugin-how-to/24-local-dev-harness.md) |
| Naming conventions | [`../../../04-database-conventions/01-naming-conventions.md`](../../../04-database-conventions/01-naming-conventions.md) |
