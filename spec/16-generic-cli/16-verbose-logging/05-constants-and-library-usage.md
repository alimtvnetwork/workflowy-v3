# Constants & Conditional Logging in Libraries

> **Parent:** [16-verbose-logging overview](./00-overview.md)

---

## Constants

All verbose-related literals live in the constants package:

```go
// constants/constants.go
const VerboseLogFileFmt = "toolname-verbose-%s.log"

// constants/constants_cli.go
const FlagVerbose    = "verbose"
const FlagDescVerbose = "Enable verbose debug logging to file"

// constants/constants_messages.go
const MsgVerboseLogFile = "Verbose log: %s\n"
const ErrVerboseInit    = "Warning: could not initialize verbose log: %v\n"
```

---

## Conditional Logging in Libraries

Domain packages (scanner, cloner, mapper) check `verbose.IsEnabled()`
before calling `verbose.Get().Log(...)`:

```go
func safePullOne(repo model.Record) error {
    logger := verbose.Get()

    if logger != nil {
        logger.Log("pulling %s at %s", repo.Name, repo.Path)
    }

    // ... pull logic ...

    if logger != nil {
        logger.Log("pull complete for %s (%.1fs)", repo.Name, elapsed.Seconds())
    }

    return nil
}
```

**Rules:**

- Always nil-check `verbose.Get()` — verbose may not be active
- Keep log calls outside hot loops to avoid performance overhead
- Use `fmt.Sprintf`-style formatting — no structured logging libraries

---

## Related

- [`04-release-pipeline-log-points.md`](./04-release-pipeline-log-points.md) — Pipeline log points
- [`00-overview.md`](./00-overview.md) — Parent overview

---

*Constants & library usage v1.0.0 — 2026-04-20*
