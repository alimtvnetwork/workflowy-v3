# 7. Scheduler, Error Enrichment, Sync & Export Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Scheduler Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `ScheduleEnabled` | `ScheduleEnabled` | ~3 files | SchedulerCronTrait, settings responses |
| `NextScheduledSnapshot` | `NextScheduledSnapshot` | ~2 files | Scheduler status responses |
| `NextCleanup` | `NextCleanup` | ~2 files | Cleanup schedule responses |
| `RetentionType` | `RetentionType` | ~3 files | Retention policy settings (days/count/none) |
| `RetentionDays` | `RetentionDays` | ~2 files | Days-based retention value |
| `RetentionCount` | `RetentionCount` | ~2 files | Count-based retention value |
| `SnapshotType` | `SnapshotType` | ~4 files | Full/incremental type indicator |

---

## Error Enrichment Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `ErrorCategory` | `ErrorCategory` | ~2 files | Categorized error reporting |
| `LogHint` | `LogHint` | ~2 files | Contextual hint for log analysis |

---

## Sync Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `FilesUpdated` | `FilesUpdated` | ~3 files | SyncManifestTrait, sync results |
| `FilesDeleted` | `FilesDeleted` | ~3 files | SyncManifestTrait, sync results |
| `FilesIgnored` | `FilesIgnored` | ~2 files | Sync filter results |
| `IgnoredFiles` | `IgnoredFiles` | ~2 files | Sync ignored file list |

---

## Export & Plugin Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `PluginZip` | `PluginZip` | ~2 files | Plugin ZIP export responses |
| `ResolvedUrl` | `ResolvedUrl` | ~2 files | URL resolution for remote resources |
| `TraceLines` | `TraceLines` | ~2 files | Error trace line extraction |
