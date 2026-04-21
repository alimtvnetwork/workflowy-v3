# 10. Progress Envelope, Cleanup Detail & Internal Passing Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## Progress Envelope Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `IsSuccess` | `IsSuccess` | ~2 files | Progress/result envelope wrappers |
| `HasAnyErrors` | `HasAnyErrors` | ~2 files | Error presence flag in batch results |

---

## Cleanup Detail Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Details` | `Details` | ~3 files | CleanerRetentionTrait, deletion detail arrays |
| `Order` | `Order` | ~2 files | Sort/sequence ordering |

---

## Internal Passing Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Graph` | `Graph` | ~2 files | AnalyzerQueryTrait, dependency graph |
| `InDegree` | `InDegree` | ~2 files | AnalyzerQueryTrait, topological sort |
| `Manifest` | `Manifest` | ~3 files | Export/import manifest payloads |
| `SqlitePath` | `SqlitePath` | ~3 files | SQLite database file path |
| `RealPath` | `RealPath` | ~2 files | Resolved filesystem path |
| `FilePath` | `FilePath` | ~4 files | NativeSnapshotExecTrait, SnapshotExportHandlerTrait, file references |
| `PkColumn` | `PkColumn` | ~2 files | Primary key column name |
| `TableName` | `TableName` | ~3 files | Table name references in export/import |
