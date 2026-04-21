# 4.4 Log Entry Format

> **Parent:** [Phase 4 overview](./00-overview.md)

---

Every log line follows this exact format:

```
[{timestamp} v{version}] [{Level}] {message} ({file}:{line}) {json_context}
```

| Component | Source | Example |
|-----------|--------|---------|
| Timestamp | `DateHelper::nowLogDisplay()` | `07-Apr-26 2:30 PM` |
| Version | `PluginConfigType::Version->value` | `2.31.0` |
| Level | `LogLevelType` case value | `Info`, `Error` |
| Message | Passed by caller | `Plugin initialized` |
| File:Line | Extracted from `debug_backtrace()` | `Plugin.php:107` |
| Context | JSON-encoded associative array | `{"version":"2.31.0","timeMs":1.23}` |

## Examples of actual log lines

```
[07-Apr-26 2:30 PM v2.31.0] [Info] Plugin initialized successfully (Plugin.php:107) {"version":"2.31.0","timeMs":12.5}
[07-Apr-26 2:30 PM v2.31.0] [Warn] Request exceeded timeout threshold (UploadHandlerTrait.php:45) {"endpoint":"/upload","durationMs":5200,"thresholdMs":5000}
[07-Apr-26 2:31 PM v2.31.0] [Error] Failed to activate plugin on remote site (ActivateHandlerTrait.php:78) {"site":"site-a","httpStatus":502,"responseBody":"Bad Gateway"}
```

## Caller resolution

The logger uses `debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)` to capture the actual caller's file and line, not the logger's own location. The skip depth is:

```
[0] = logAtLevel() (internal)
[1] = actual caller ← this is captured
[2] = caller's caller
```
