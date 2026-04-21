# 9. Statistics, Backup/Scheduler Options & Storage Stats

> **Parent:** [00-overview.md](./00-overview.md)

---

## Statistics Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `TotalTransactions` | `TotalTransactions` | ~2 files | Log statistics responses |
| `ByAction` | `ByAction` | ~2 files | Stats grouped by action type |
| `ByStatus` | `ByStatus` | ~2 files | Stats grouped by status |
| `Last24h` | `Last24h` | ~2 files | Recent activity window |

---

## Backup Option Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `IncludePlugins` | `IncludePlugins` | ~3 files | Snapshot options, SchedulerTriggerTrait |
| `PluginSelection` | `PluginSelection` | ~2 files | Selective plugin backup list |
| `Compression` | `Compression` | ~2 files | Compression toggle |
| `Async` | `Async` | ~3 files | Async execution flag |
| `Trigger` | `Trigger` | ~2 files | Trigger source identifier |
| `MasterSnapshotId` | `MasterSnapshotId` | ~3 files | SchedulerTriggerTrait, incremental parent ref |
| `MasterDir` | `MasterDir` | ~2 files | Master snapshot directory |
| `Confirm` | `Confirm` | ~2 files | Restore confirmation flag |
| `CreateBackup` | `CreateBackup` | ~2 files | Pre-restore backup creation |
| `RequireBackup` | `RequireBackup` | ~2 files | Backup requirement flag |
| `Mode` | `Mode` | ~5 files | Restore mode, snapshot mode, SnapshotCrudRestoreTrait |

---

## Scheduler Response Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Frequency` | `Frequency` | ~3 files | SchedulerTriggerTrait, schedule settings |
| `Time` | `Time` | ~2 files | Schedule time setting |
| `Day` | `Day` | ~2 files | Schedule day setting |
| `Scheduled` | `Scheduled` | ~2 files | Scheduling confirmation flag |
| `Trace` | `Trace` | ~2 files | Error trace payloads |
| `Options` | `Options` | ~3 files | Snapshot/restore option payloads |

---

## Storage Stats Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `TotalSizeFormatted` | `TotalSizeFormatted` | ~2 files | CleanerStorageTrait, formatted size string |
| `OldestTimestamp` | `OldestTimestamp` | ~2 files | CleanerStorageTrait, oldest snapshot date |
| `NewestTimestamp` | `NewestTimestamp` | ~2 files | CleanerStorageTrait, newest snapshot date |
| `DiskFreeBytes` | `DiskFreeBytes` | ~2 files | CleanerStorageTrait, disk space |
| `DiskFreeFormatted` | `DiskFreeFormatted` | ~2 files | CleanerStorageTrait, formatted disk space |
| `SnapshotsCount` | `SnapshotsCount` | ~2 files | CleanerStorageTrait, snapshot count |
| `BytesFormatted` | `BytesFormatted` | ~2 files | Formatted byte strings |
