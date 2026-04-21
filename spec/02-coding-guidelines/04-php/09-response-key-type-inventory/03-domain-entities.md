# 3. Domain Entity & Snapshot Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Domain Entity Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Posts` | `Posts` | ~3 files | Post list responses, content sync |
| `Categories` | `Categories` | ~2 files | Category list responses |
| `Category` | `Category` | ~2 files | Single category payloads |
| `Export` | `Export` | ~3 files | Export operation results |
| `Incrementals` | `Incrementals` | ~3 files | Incremental snapshot list results |
| `TotalSize` | `TotalSize` | ~3 files | Storage summary responses, ErrorLogHandlerTrait |
| `Applied` | `Applied` | ~2 files | Incremental apply results |
| `Folder` | `Folder` | ~3 files | Snapshot directory references |

---

## Snapshot-Domain Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `SnapshotId` | `SnapshotId` | ~12 files | All snapshot operations, export, import, restore, audit |
| `Sequence` | `Sequence` | ~6 files | Incremental backups, export manifests, registration |
| `FolderName` | `FolderName` | ~5 files | Incremental backup directories, registration |
| `TablesChanged` | `TablesChanged` | ~4 files | Incremental registration, export results |
| `TotalRows` | `TotalRows` | ~15 files | Snapshot records, worker progress, restore, import |
| `TotalNewRows` | `TotalNewRows` | ~4 files | Incremental registration, export results |
| `ZipPath` | `ZipPath` | ~3 files | ZIP file path references |
| `ZipSize` | `ZipSize` | ~4 files | Backup exec responses, export results |
| `BackupId` | `BackupId` | ~3 files | Pre-restore backup references |
| `ZipFailed` | `ZipFailed` | ~3 files | Snapshot creation error flags |
| `SkipAudit` | `SkipAudit` | ~4 files | Scheduler cron results, no-op cleanup |
| `TablesRestored` | `TablesRestored` | ~4 files | Restore engine results, audit logging |
