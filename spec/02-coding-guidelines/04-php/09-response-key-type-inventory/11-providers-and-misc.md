# 11. Provider/Plugin Info, Capability, Restore, OPcache, Plugin Archive & Status Payload

> **Parent:** [00-overview.md](./00-overview.md)

---

## Provider & Plugin Info Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Id` | `Id` | ~5 files | DetectorSettingsTrait, CleanerRetentionTrait, provider identification |
| `Name` | `Name` | ~6 files | SnapshotProviderWpReset, UpdraftCrudTrait, OrchestratorPluginTrait, provider info |
| `Available` | `Available` | ~4 files | DetectorSettingsTrait, DetectorProviderTrait, provider availability |
| `Capabilities` | `Capabilities` | ~3 files | DetectorProviderTrait, provider capability reporting |
| `Version` | `Version` | ~5 files | OrchestratorPluginTrait, plugin version info, provider versioning |
| `Author` | `Author` | ~2 files | Plugin metadata responses |
| `Description` | `Description` | ~2 files | Plugin/provider description |
| `Active` | `Active` | ~3 files | Plugin active status |
| `TotalFiles` | `TotalFiles` | ~2 files | File count in exports |
| `LastSeenId` | `LastSeenId` | ~2 files | Incremental tracking cursor |
| `FileType` | `FileType` | ~2 files | File type classification |
| `Provider` | `Provider` | ~3 files | Provider identifier in responses |
| `Snapshot` | `Snapshot` | ~3 files | Snapshot object in responses |
| `Source` | `Source` | ~2 files | Import source reference |

---

## Capability Sub-Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `FullSite` | `FullSite` | ~2 files | DetectorProviderTrait, capability flag |
| `DatabaseOnly` | `DatabaseOnly` | ~2 files | DetectorProviderTrait, capability flag |
| `Selective` | `Selective` | ~2 files | DetectorProviderTrait, capability flag |
| `Restore` | `Restore` | ~3 files | DetectorProviderTrait, restore capability |
| `Import` | `Import` | ~2 files | DetectorProviderTrait, import capability |

---

## Restore Option Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Strict` | `Strict` | ~2 files | Strict restore mode flag |
| `ApplyIncrementals` | `ApplyIncrementals` | ~2 files | Incremental application flag |
| `Sqlite` | `Sqlite` | ~2 files | SQLite restore mode |
| `SqliteFile` | `SqliteFile` | ~3 files | SQLite file reference in restore |
| `InternalMode` | `_Mode` | ~2 files | Internal mode discriminator (underscore-prefixed) |

---

## OPcache Status Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `OpcacheAvailable` | `OpcacheAvailable` | ~2 files | StatusOpsTrait, opcache detection |
| `OpcacheReset` | `OpcacheReset` | ~2 files | StatusOpsTrait, opcache reset result |
| `FilesInvalidated` | `FilesInvalidated` | ~2 files | StatusOpsTrait, invalidated file count |

---

## Plugin Archive Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Zip` | `Zip` | ~2 files | OrchestratorPluginTrait, zip filename |
| `ZipFile` | `ZipFile` | ~2 files | OrchestratorPluginTrait, root DB zip path |
| `FileSizeBytes` | `FileSizeBytes` | ~2 files | OrchestratorPluginTrait, root DB file size |
| `ChecksumMd5` | `ChecksumMd5` | ~2 files | OrchestratorPluginTrait, root DB checksum |
| `PluginName` | `PluginName` | ~2 files | OrchestratorPluginTrait, root DB plugin name |

---

## Status Payload Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Route` | `Route` | ~2 files | StatusPayloadTrait, registered route list |
| `Methods` | `Methods` | ~2 files | StatusPayloadTrait, HTTP methods per route |
| `Result` | `Result` | ~2 files | AdminAjaxSnapshotTrait, result wrapper key |
