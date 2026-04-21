# 1. Envelope & Domain Collection Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Envelope Keys

Used in nearly every REST response and internal result array.

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Success` | `Success` | ~56 files | All REST handlers, snapshot providers, helpers, cleaner, orchestrator |
| `Error` | `Error` | ~60 files | All error payloads, log contexts, snapshot CRUD, sync, agents |
| `Message` | `Message` | ~15 files | REST error responses, envelope builders, route traits |
| `Data` | `Data` | ~10 files | SyncManifestTrait, REST response wrappers, status payloads |
| `Code` | `Code` | ~12 files | Error responses with typed codes (SnapshotErrorType, WpErrorCodeType) |
| `Valid` | `Valid` | ~8 files | Import validation, manifest validation, agent validation |
| `Errors` | `Errors` | ~25 files | Batch results, cleaner phases, worker jobs, restore engine |
| `Cached` | `Cached` | ~5 files | FileCache manifest, sync manifest, export handler |
| `Phase` | `Phase` | ~10 files | Snapshot lifecycle logging (initiated, streaming, complete) |
| `Reason` | `Reason` | ~5 files | Retention deletion details, cleaner audit |

---

## Domain Collection Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Total` | `Total` | ~8 files | Pagination (agents, snapshots, logs), manifest stats |
| `Agents` | `Agents` | ~4 files | AgentCrudReadTrait, agent list responses |
| `Actions` | `Actions` | ~3 files | Action log list responses |
| `Logs` | `Logs` | ~4 files | Log list responses, diagnostics |
| `Snapshots` | `Snapshots` | ~4 files | Snapshot list responses, UpdraftCrudTrait |
| `Sql` | `Sql` | ~3 files | Query builder results, database search |
| `Params` | `Params` | ~3 files | Query builder parameter arrays |
| `Sets` | `Sets` | ~2 files | Batch set operations |
| `Plugins` | `Plugins` | ~5 files | Orchestrator plugin archiving, import execution |
| `Tables` | `Tables` | ~15 files | Snapshot CRUD, restore, export, worker batches |
| `Settings` | `Settings` | ~5 files | SnapshotSettingsHandlerTrait, DetectorSettingsTrait, settings responses |
| `Providers` | `Providers` | ~4 files | DetectorProviderTrait, provider list responses |
| `Dependencies` | `Dependencies` | ~3 files | AnalyzerQueryTrait, table dependency analysis |
