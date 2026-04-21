# 5. General Entity, Log/Diagnostic & Internal Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## General-Purpose Entity Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Slug` | `Slug` | ~5 files | OrchestratorPluginTrait, DetectorSettingsTrait, plugin arrays |
| `Title` | `Title` | ~4 files | SchedulerTriggerTrait, snapshot creation, import |
| `Type` | `Type` | ~4 files | Snapshot type indicators, plugin type fields |
| `Action` | `Action` | ~3 files | Transaction logging, action audit |
| `Status` | `Status` | ~8 files | Snapshot records, agent status, transaction status |
| `Percent` | `Percent` | ~3 files | Progress tracking, batch completion |
| `Plugin` | `Plugin` | ~3 files | StatusPayloadTrait, plugin info responses |

---

## Log/Diagnostic Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `ErrorLog` | `ErrorLog` | ~2 files | ErrorLogHandlerTrait log reading |
| `FullLog` | `FullLog` | ~2 files | ErrorLogHandlerTrait full content |
| `StacktraceLog` | `StacktraceLog` | ~2 files | ErrorLogHandlerTrait stacktrace extraction |
| `Exists` | `Exists` | ~2 files | ErrorLogHandlerTrait file existence check |
| `Content` | `Content` | ~3 files | ErrorLogHandlerTrait, log content payloads |
| `Truncated` | `Truncated` | ~2 files | ErrorLogHandlerTrait large-file truncation flag |
| `Lines` | `Lines` | ~2 files | ErrorLogHandlerTrait line-based reading |
| `TotalLines` | `TotalLines` | ~2 files | ErrorLogHandlerTrait line count |

---

## Internal/Domain-Specific Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Ids` | `Ids` | ~2 files | CleanerOrphanTrait batch ID arrays |
| `TotalSnapshots` | `TotalSnapshots` | ~2 files | CleanerStorageTrait storage summary |
| `TotalSizeBytes` | `TotalSizeBytes` | ~2 files | CleanerStorageTrait storage metrics |
| `TempFile` | `TempFile` | ~2 files | UploadInstallExtractTrait temp path tracking |
| `Stmt` | `Stmt` | ~2 files | IncrementalExportTrait prepared statement key |
| `Columns` | `Columns` | ~3 files | IncrementalExportTrait column metadata |
