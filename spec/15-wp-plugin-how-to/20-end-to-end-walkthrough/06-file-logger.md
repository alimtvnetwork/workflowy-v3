# 20.6 Step 5 — FileLogger

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 4, §4.3–§4.7** — Singleton, three log files, rotation, dedup.

---

**File: `includes/Logging/FileLogger.php`**

Copy the FileLogger reference from Phase 4, replacing `PluginName` → `TaskTracker` and `plugin-name` → `task-tracker`.

Key implementation checkpoints:

| Feature | Verify |
|---------|--------|
| Singleton via `getInstance()` | Phase 4, §4.3 |
| Writes to `info.log`, `error.log`, `stacktrace.log` | Phase 4, §4.3 |
| Log format: `[{timestamp} v{version}] [{Level}] {message} ({file}:{line}) {json}` | Phase 4, §4.4 |
| `debug()` skipped when not in debug mode | Phase 4, §4.3 |
| Stack trace written with `=` separator blocks | Phase 4, §4.5 |
| Rotation at 512KB, max 10 archives | Phase 4, §4.6 |
| In-memory + persistent dedup | Phase 4, §4.7 |
