# Worked Example Fixtures — DB Split Decision Matrix + ATTACH (P27)

> **Audit gap closed:** P26 flagged "split decision matrix in prose, no `ATTACH` orchestration pseudocode + cross-DB JOIN fixtures". This file binds `AT-SPLITDBFUNDAMENTALS-01..10` to a concrete decision matrix, byte-exact `ATTACH` sequence, and 3 cross-DB query fixtures.

---

## 1. Split decision matrix (binding)

A SQLite database MUST be split into multiple files when **any** row's threshold is exceeded:

| Trigger | Threshold | Resulting split | Migration trigger |
|---|---:|---|---|
| File size | ≥ 1.0 GB | Domain-shard by table prefix | nightly cron `wf-db-split` |
| Row count (single table) | ≥ 5,000,000 | Hash-shard by `(workspace_id % 4)` | manual via `wf db split <table>` |
| Workspace count | ≥ 100 | One DB per workspace | on workspace creation |
| Write contention (writes/sec sustained 60 s) | ≥ 50 | Shard by `(item_id MOD 4)` | runtime auto-split alert |
| Backup duration | > 5 min | Domain-shard | automatic if 3 consecutive backups exceed |

**Anti-trigger (do NOT split):** total file size < 200 MB AND row count < 100k AND workspace count < 10. Premature splits add ATTACH overhead.

## 2. `db-split.json` (binding configuration)

```json
{
  "Status": "OK",
  "Attributes": {
    "Schema": "https://workflowy.local/schemas/db-split.v1.json",
    "GeneratedAt": "2026-04-28T10:00:00Z",
    "Strategy": "domain-shard"
  },
  "Results": {
    "Primary": {
      "Path": "/var/lib/workflowy/db/main.sqlite",
      "Tables": ["Workspace", "User", "UserRole", "Setting", "SettingHistory"]
    },
    "Attachments": [
      {
        "Alias": "items",
        "Path": "/var/lib/workflowy/db/items.sqlite",
        "Tables": ["Item", "ItemMirror", "ItemTag"],
        "Mode": "rw"
      },
      {
        "Alias": "activity",
        "Path": "/var/lib/workflowy/db/activity.sqlite",
        "Tables": ["ActivityLog", "FeedbackReport"],
        "Mode": "rw"
      },
      {
        "Alias": "trash",
        "Path": "/var/lib/workflowy/db/trash.sqlite",
        "Tables": ["TrashedItem"],
        "Mode": "rw"
      }
    ]
  }
}
```

## 3. `Connection.php` orchestration pseudocode (binding)

```php
final class Connection {
  public function __construct(
    private readonly string $primaryPath,
    private readonly array $attachments,   // from db-split.json Results.Attachments
  ) {}

  public function open(): \PDO {
    $pdo = new \PDO("sqlite:{$this->primaryPath}");
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA journal_mode = WAL');

    foreach ($this->attachments as $att) {
      // Order is binding: ATTACH must succeed before ANY query runs
      $stmt = $pdo->prepare('ATTACH DATABASE :path AS :alias');
      $stmt->execute([':path' => $att['Path'], ':alias' => $att['Alias']]);
    }
    return $pdo;
  }
}
```

**Negative (FAIL):** issuing `SELECT * FROM items.Item` BEFORE the corresponding `ATTACH` returns SQLite error `no such table: items.Item`.

## 4. Cross-DB JOIN fixtures (3 binding examples)

### 4.1 Item × Workspace (primary ⋈ attachment)
```sql
-- Allowed via repo method ItemRepository::listByWorkspace()
SELECT i.id, i.content, w.name AS workspace_name
FROM items.Item AS i
INNER JOIN main.Workspace AS w ON w.id = i.workspace_id
WHERE w.id = :workspace_id
ORDER BY i.position
LIMIT 250;
```

### 4.2 Item × ActivityLog (attachment ⋈ attachment)
```sql
-- Allowed via repo method ItemRepository::recentActivity()
SELECT i.id, i.content, a.action, a.occurred_at
FROM items.Item AS i
INNER JOIN activity.ActivityLog AS a ON a.item_id = i.id
WHERE a.occurred_at >= :since
ORDER BY a.occurred_at DESC
LIMIT 250;
```

### 4.3 Soft-delete restore (trash → items)
```sql
-- Allowed via repo method ItemRepository::restore()
BEGIN IMMEDIATE;
INSERT INTO items.Item SELECT * FROM trash.TrashedItem WHERE id = :id;
DELETE FROM trash.TrashedItem WHERE id = :id;
COMMIT;
```

**Anti-pattern:** raw cross-DB `JOIN` written outside a `*Repository` class. Detected by gate G-DB-01 (AST grep for `FROM items\.` outside `app/Repositories/`).

## 5. `SplitMigrator.php` algorithm (split + merge)

### 5.1 Split (move table from primary → new attachment)
```
1. Open primary (write lock)
2. CREATE TABLE in new file with identical schema
3. INSERT INTO new.Table SELECT * FROM primary.Table
4. Verify row counts match (ABORT if mismatch)
5. ATTACH new file as alias
6. DROP TABLE primary.Table
7. Update db-split.json (atomic write via tmpfile + rename)
8. Restart connection pool
```

### 5.2 Merge (move attachment table back into primary)
```
1. Open primary (write lock) + ATTACH source
2. CREATE TABLE primary.Table with identical schema
3. INSERT INTO primary.Table SELECT * FROM source.Table
4. Verify row counts match (ABORT if mismatch)
5. DROP TABLE source.Table
6. DETACH source; rm source.sqlite
7. Update db-split.json
```

**Both flows are atomic at the db-split.json layer**: tmpfile + `rename(2)` so a crash mid-migration leaves the file in a valid prior state.

## 6. Anti-patterns

| Anti-pattern | Detected by |
|---|---|
| Splitting before threshold (premature optimisation) | gate G-SPLIT-01 (decision matrix lint) |
| `ATTACH` issued lazily (per-query) instead of once at connection open | gate G-SPLIT-02 (`ATTACH` count per request = 0) |
| Cross-DB `JOIN` in raw SQL outside repository | gate G-DB-01 |
| Editing `db-split.json` without atomic rename | gate G-SPLIT-03 (file-watch test) |
| `DETACH` while transaction is open | SQLite native error → gate G-SPLIT-04 |

## 7. Test-name slugs

| Bind | AT id (cited) | Vitest/PHPUnit slug |
|---|---|---|
| – | cites `AT-SPLITDBFUNDAMENTALS-01` | `at_splitdb_01_decision_matrix_thresholds` |
| – | cites `AT-SPLITDBFUNDAMENTALS-02` | `at_splitdb_02_db_split_json_schema_valid` |
| – | cites `AT-SPLITDBFUNDAMENTALS-03` | `at_splitdb_03_attach_at_connection_open` |
| – | cites `AT-SPLITDBFUNDAMENTALS-04` | `at_splitdb_04_cross_db_join_via_repo_only` |
| – | cites `AT-SPLITDBFUNDAMENTALS-05` | `at_splitdb_05_split_migrator_atomic_renames` |
| – | cites `AT-SPLITDBFUNDAMENTALS-06` | `at_splitdb_06_merge_migrator_row_count_verify` |
| – | cites `AT-SPLITDBFUNDAMENTALS-07` | `at_splitdb_07_premature_split_blocked` |
| – | cites `AT-SPLITDBFUNDAMENTALS-08` | `at_splitdb_08_no_lazy_attach_per_query` |
| – | cites `AT-SPLITDBFUNDAMENTALS-09` | `at_splitdb_09_detach_blocked_during_tx` |
| – | cites `AT-SPLITDBFUNDAMENTALS-10` | `at_splitdb_10_db_split_json_atomic_write` |
