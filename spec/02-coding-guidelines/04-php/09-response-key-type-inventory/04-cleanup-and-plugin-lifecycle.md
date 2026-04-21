# 4. Cleanup Pipeline & Plugin Lifecycle Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Cleanup-Pipeline Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `DeletedByPolicy` | `DeletedByPolicy` | ~3 files | SnapshotCleaner::runCleanup, AdminAjaxSnapshotTrait, SchedulerExecutorTrait |
| `DeletedOrphans` | `DeletedOrphans` | ~3 files | SnapshotCleaner::runCleanup, AdminAjaxSnapshotTrait, SchedulerExecutorTrait |
| `DeletedFailed` | `DeletedFailed` | ~3 files | SnapshotCleaner::runCleanup, AdminAjaxSnapshotTrait, SchedulerExecutorTrait |
| `SpaceFreedBytes` | `SpaceFreedBytes` | ~3 files | SnapshotCleaner::runCleanup, AdminAjaxSnapshotTrait, SchedulerExecutorTrait |
| `Retention` | `Retention` | ~3 files | SnapshotCleaner, SnapshotBackupOpsTrait, cleanup settings |
| `Orphans` | `Orphans` | ~3 files | CleanerOrphanTrait, SnapshotCleaner |
| `Stuck` | `Stuck` | ~2 files | SnapshotCleaner stuck-snapshot detection |
| `DryRun` | `DryRun` | ~2 files | SnapshotCleaner dry-run mode flag |
| `BytesFreed` | `BytesFreed` | ~2 files | CleanerStorageTrait, cleanup audit |
| `Deleted` | `Deleted` | ~3 files | PluginLifecycleDeleteTrait, cleanup results |
| `Cleaned` | `Cleaned` | ~2 files | CleanerOrphanTrait orphan cleanup results |

---

## Plugin Lifecycle Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Activated` | `Activated` | ~3 files | UploadInstallActivateTrait, plugin lifecycle responses |
| `PluginSlug` | `PluginSlug` | ~4 files | UploadInstallActivateTrait, PluginLifecycleDeleteTrait, OrchestratorPluginTrait |
| `IsUpdate` | `IsUpdate` | ~3 files | UploadInstallActivateTrait, upload responses |
| `IsSelfUpdate` | `IsSelfUpdate` | ~2 files | UploadInstallActivateTrait self-update detection |
| `PluginVersion` | `PluginVersion` | ~3 files | UploadInstallActivateTrait, OrchestratorPluginTrait |
| `ActivationError` | `ActivationError` | ~2 files | UploadInstallActivateTrait error capture |
| `Inventory` | `Inventory` | ~2 files | RestoreValidationTrait, import inventory |
| `PluginFile` | `PluginFile` | ~3 files | UploadPipelineTrait, PluginLifecycleHelpersTrait, plugin resolution |
