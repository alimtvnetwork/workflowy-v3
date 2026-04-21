# 8. Snapshot Progress, Cron/Audit & Manifest Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Snapshot Progress & Worker Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `CompletedAt` | `CompletedAt` | ~3 files | Snapshot completion timestamps |
| `ExportedAt` | `ExportedAt` | ~2 files | Export completion timestamps |
| `Format` | `Format` | ~2 files | Snapshot format identifier |
| `FormatVersion` | `FormatVersion` | ~2 files | Snapshot format version metadata |
| `JobId` | `JobId` | ~3 files | Worker job identifiers |
| `TotalTables` | `TotalTables` | ~4 files | Export total table counts |
| `TablesExported` | `TablesExported` | ~3 files | Export progress tracking |
| `PoolSize` | `PoolSize` | ~2 files | Worker pool configuration |
| `TotalBatches` | `TotalBatches` | ~2 files | Batch processing totals |
| `CurrentBatch` | `CurrentBatch` | ~2 files | Batch processing progress |
| `TableProgress` | `TableProgress` | ~3 files | Per-table export progress |
| `IncrementalsApplied` | `IncrementalsApplied` | ~2 files | Incremental restore applied count |
| `SkippedMaster` | `SkippedMaster` | ~2 files | Skipped master snapshot flag |
| `ExportedTables` | `ExportedTables` | ~3 files | List of exported table names |
| `SnapshotDir` | `SnapshotDir` | ~3 files | Snapshot directory path |
| `DirName` | `DirName` | ~2 files | Directory name references |
| `RowCount` | `RowCount` | ~3 files | Per-table row counts |

---

## Cron & Audit Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `TriggeredBy` | `TriggeredBy` | ~3 files | SchedulerCronTrait, audit logging |
| `AuditData` | `AuditData` | ~2 files | Audit data payloads |
| `LogDataKey` | `LogData` | ~3 files | Log data payloads |

---

## Manifest & Import Metadata Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `OriginalId` | `OriginalId` | ~2 files | Import source record ID |
| `OriginalCreatedAt` | `OriginalCreatedAt` | ~2 files | Import source timestamp |
| `SourceSite` | `SourceSite` | ~2 files | Import source site identifier |
| `OriginalTitle` | `OriginalTitle` | ~2 files | Import source title |
| `OriginalType` | `OriginalType` | ~2 files | Import source snapshot type |
| `WpVersion` | `WpVersion` | ~2 files | WordPress version in manifest |
| `PhpVersion` | `PhpVersion` | ~2 files | PHP version in manifest |
| `MysqlVersion` | `MysqlVersion` | ~2 files | MySQL version in manifest |
| `SiteUrl` | `SiteUrl` | ~3 files | Site URL in manifest |
| `DbPrefix` | `DbPrefix` | ~2 files | Database table prefix |
| `PluginCount` | `PluginCount` | ~2 files | Plugin count in manifest |
| `DurationMs` | `DurationMs` | ~3 files | Duration in milliseconds |
| `TableCounts` | `TableCounts` | ~2 files | Per-table row count map |

---

## Sync Manifest Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `DownloadUrl` | `DownloadUrl` | ~3 files | SyncManifestTrait, file download URLs |
| `FileCount` | `FileCount` | ~2 files | Manifest file count |
| `GeneratedAt` | `GeneratedAt` | ~2 files | Manifest generation timestamp |
| `CacheStats` | `CacheStats` | ~2 files | FileCache statistics |
| `FromCache` | `FromCache` | ~2 files | Cache hit indicator |
