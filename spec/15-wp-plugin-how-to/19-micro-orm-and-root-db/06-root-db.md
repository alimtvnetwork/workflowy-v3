# 19.7 Cross-Plugin Root Database (RootDb)

> **Parent:** [Phase 19 overview](./00-overview.md)

The Root Database (`a-root.db`) is a **cross-plugin coordination database** used during snapshot exports. It serves as a manifest that records which tables were exported, their checksums, dependency graphs, and plugin versions.

## Architecture

```
Database/
├── RootDb.php                        ← Shell class (singleton, create/read)
└── Traits/
    ├── RootDbSchemaTrait.php         ← Schema creation, metadata population, dependency graph
    └── RootDbRegistrationTrait.php   ← Table registration, stats, incrementals, plugin snapshots
```

## Shell class — RootDb.php

```php
class RootDb {
    use RootDbSchemaTrait;
    use RootDbRegistrationTrait;

    private FileLogger $logger;
    private DependencyAnalyzer $analyzer;
    private static ?self $instance = null;

    public static function getInstance(?FileLogger $logger = null, ?DependencyAnalyzer $analyzer = null): self;
    public function create(string $filepath): PDO;   // Creates a-root.db with schema
}
```

**Key:** Unlike the main `Database` class, `RootDb` creates a **separate PDO connection** per snapshot — it does not share the plugin's main PDO. Each `a-root.db` is an independent, self-contained manifest file.

## Schema (RootDbSchemaTrait)

The root database contains 5 tables:

### SnapshotMeta — Export metadata

| Column | Type | Purpose |
|--------|------|---------|
| Id | INTEGER PK | Always 1 (single row) |
| Title | TEXT | Snapshot title |
| Type | TEXT | `Full` or `Incremental` (from `SnapshotModeType` enum) |
| CreatedAt | TEXT | ISO 8601 UTC timestamp |
| CreatedBy | TEXT | Hostname |
| MysqlVersion | TEXT | Source MySQL version |
| WpVersion | TEXT | Source WordPress version |
| PluginVersion | TEXT | Plugin version at export time |
| TableCount | INTEGER | Total tables exported |
| TotalRows | INTEGER | Total rows across all tables |
| ConfigJson | TEXT | Export configuration as JSON |

### SnapshotTables — Per-table export records

| Column | Type | Purpose |
|--------|------|---------|
| TableName | TEXT UNIQUE | WordPress table name |
| RowCount | INTEGER | Rows exported |
| SqliteFile | TEXT | Relative path to the table's SQLite file |
| FileSizeBytes | INTEGER | File size |
| ChecksumMd5 | TEXT | MD5 checksum for integrity verification |
| ExportedAt | TEXT | When this table was exported |

### TableDependencies — Foreign key dependency graph

| Column | Type | Purpose |
|--------|------|---------|
| ParentTable | TEXT | Referenced table |
| ChildTable | TEXT | Table with the foreign key |
| FkColumn | TEXT | Foreign key column name |
| RefColumn | TEXT | Referenced column name |

### IncrementalBackups — Incremental backup log

| Column | Type | Purpose |
|--------|------|---------|
| SequenceNum | INTEGER | Monotonic sequence number |
| FolderName | TEXT | Backup folder name |
| CreatedAt | TEXT | When created |
| TablesChanged | INTEGER | Number of changed tables |
| TotalNewRows | INTEGER | New rows since last backup |
| RelativePath | TEXT | Path relative to snapshots dir |

### PluginSnapshots — Plugin ZIP archives

| Column | Type | Purpose |
|--------|------|---------|
| PluginSlug | TEXT | Plugin identifier |
| PluginName | TEXT | Display name |
| PluginVersion | TEXT | Version at snapshot time |
| ZipFile | TEXT | Path to ZIP archive |
| FileSizeBytes | INTEGER | Archive size |
| ChecksumMd5 | TEXT | Archive checksum |

## Registration methods (RootDbRegistrationTrait)

| Method | Purpose |
|--------|---------|
| `registerTable($pdo, $tableName, $rowCount, $sqliteFile, ...)` | Record a table export with checksum |
| `updateStats($pdo, $tableCount, $totalRows)` | Update final counts in SnapshotMeta |
| `registerIncremental($pdo, $info)` | Log an incremental backup entry |
| `registerPluginSnapshot($pdo, $info)` | Record a plugin ZIP export |
| `readMetadata($filepath)` | Read full metadata from an existing `a-root.db` |

## Backward compatibility — Legacy table/column resolution

The RootDb supports reading older snapshots that used `snake_case` naming (before the PascalCase migration):

```php
public function resolveRootDbTableName(PDO $pdo, string $pascalName): string {
    // 1. Check if PascalCase table exists → use it
    // 2. Look up legacy map (SnapshotMeta → snapshot_meta)
    // 3. Check if legacy table exists → use it
    // 4. Fall back to PascalCase name
}
```

Legacy maps are maintained for both table names and column names, ensuring the plugin can read snapshots from any version.

## Metadata population flow

```php
$rootDb = RootDb::getInstance($logger, $analyzer);
$pdo = $rootDb->create($snapshotDir . '/a-root.db');

// 1. Populate metadata (MySQL/WP/plugin versions, title, config)
$rootDb->populateMetadata($pdo, $config);

// 2. Populate dependency graph (foreign key analysis)
$rootDb->populateDependencies($pdo, 'all');

// 3. Register each exported table
foreach ($exportedTables as $table) {
    $rootDb->registerTable($pdo, $table['name'], $table['rows'], $table['file'], ...);
}

// 4. Update final stats
$rootDb->updateStats($pdo, count($exportedTables), $totalRows);
```
