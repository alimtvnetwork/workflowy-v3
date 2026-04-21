# 6. Temporal, Analysis/Dependency & Detection Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Temporal Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `CreatedAt` | `CreatedAt` | ~6 files | Snapshot records, audit logs, manifest metadata |
| `UpdatedAt` | `UpdatedAt` | ~4 files | Record update timestamps, sync metadata |
| `Timestamp` | `Timestamp` | ~4 files | StatusOpsTrait opcache result, DateHelper payloads |

---

## Analysis & Dependency Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `ParentTable` | `ParentTable` | ~2 files | Table dependency analysis, seed ordering |
| `ChildTable` | `ChildTable` | ~2 files | Table dependency analysis |
| `FkColumn` | `FkColumn` | ~2 files | Foreign key column references |
| `RefColumn` | `RefColumn` | ~2 files | Referenced column in FK relationships |
| `SeedOrder` | `SeedOrder` | ~2 files | Table insertion order for seeding |
| `TableCount` | `TableCount` | ~3 files | Snapshot table counts |
| `DepCount` | `DepCount` | ~2 files | Dependency count per table |
| `NewRows` | `NewRows` | ~3 files | Incremental export new row counts |
| `PluginDetails` | `PluginDetails` | ~3 files | Orchestrator plugin metadata |
| `IncludedIds` | `IncludedIds` | ~2 files | Selective export ID lists |
| `IncrementalCount` | `IncrementalCount` | ~3 files | Child incremental count per full snapshot |

---

## Detection & Provider Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `DetectionMethod` | `DetectionMethod` | ~2 files | Snapshot provider auto-detection |
| `SqliteVersion` | `SqliteVersion` | ~2 files | SQLite runtime version reporting |
| `IsCore` | `IsCore` | ~3 files | SnapshotProviderWpReset, WordPress core table flag |
