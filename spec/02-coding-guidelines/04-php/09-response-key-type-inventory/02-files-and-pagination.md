# 2. File/Size & Pagination Keys

> **Parent:** [00-overview.md](./00-overview.md)

---

## File & Size Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Rows` | `Rows` | ~12 files | Table info, restore results, batch progress, worker exports |
| `Bytes` | `Bytes` | ~4 files | Storage calculations, sync payloads |
| `Size` | `Size` | ~15 files | ZIP sizes, file entries, plugin archiving, export results |
| `FileSize` | `FileSize` | ~8 files | Snapshot records, incremental exports, manifest entries |
| `Path` | `Path` | ~12 files | Log contexts, file manifests, REST responses |
| `Filename` | `Filename` | ~15 files | Snapshot CRUD, export/import, cleaner, manifest |
| `Checksum` | `Checksum` | ~4 files | Incremental exports, file integrity, sync |
| `Duration` | `Duration` | ~12 files | All timed operations (backup, restore, cleanup, sync) |
| `Count` | `Count` | ~5 files | Plugin archiving, orchestrator results |
| `Files` | `Files` | ~8 files | FileCache manifest, sync manifest, plugin list |
| `Directory` | `Directory` | ~6 files | Snapshot creation results, backup responses |
| `Scope` | `Scope` | ~8 files | Snapshot CRUD, export manifest, import records |
| `Exported` | `Exported` | ~4 files | Worker batch progress, export results |
| `Entry` | `Entry` | ~3 files | Plugin archive entries, orchestrator |
| `Computed` | `Computed` | ~3 files | FileCache manifest stats, sync cache stats |
| `Removed` | `Removed` | ~5 files | FileCache pruning, cleaner orphan results |

---

## Pagination Keys

| Case | Value | Usages | Primary Locations |
|------|-------|--------|-------------------|
| `Limit` | `Limit` | ~4 files | Paginated list endpoints, query builders |
| `Offset` | `Offset` | ~4 files | Paginated list endpoints, query builders |
