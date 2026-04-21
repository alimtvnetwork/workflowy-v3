# Flag Registration, Command Handler Pattern & What to Log

> **Parent:** [16-verbose-logging overview](./00-overview.md)

---

## Flag Registration

The `--verbose` flag is a **global flag** registered on the root command,
not per-subcommand.

```go
// In cmd/rootflags.go
fs.BoolVar(&verboseFlag, constants.FlagVerbose, false, constants.FlagDescVerbose)
```

---

## Command Handler Pattern

Every command that supports verbose logging follows this pattern:

```go
func runPull(args []string) {
    checkHelp("pull", args)
    slug, group, all, verboseFlag := parsePullFlags(args)

    if verboseFlag {
        initVerboseLog()       // Init + defer Close
    }

    // ... command logic ...
}

func initVerboseLog() {
    logger, err := verbose.Init()
    if err != nil {
        fmt.Fprintf(os.Stderr, constants.ErrVerboseInit, err)
        return                 // Non-fatal — continue without logging
    }
    defer logger.Close()
}
```

**Rules:**

- Verbose init failure is **non-fatal** — warn and continue
- `defer Close()` in the same function that calls `Init()`
- Never pass the logger as a parameter — use `verbose.Get()` or `verbose.IsEnabled()`

---

## What to Log

| Category | Examples |
|----------|----------|
| Git operations | Clone/pull commands, remote URLs, branch names |
| Retry attempts | Attempt number, delay, reason for retry |
| File I/O | Paths read/written, file sizes, permissions |
| External processes | Command lines, exit codes, stdout/stderr |
| Timing | Operation durations, elapsed time |
| Environment | OS, paths, config values loaded |
| Errors (detailed) | Full error chains, stack context |
| Compression | Archive size in bytes, SHA-1 hash per archive |
| Checksums | Per-file SHA-256 hash during checksum generation |
| Asset uploads | Target repo/tag, per-asset file size, HTTP status |

**What NOT to log:**

- Secrets, tokens, or credentials
- Routine success paths that add no diagnostic value
- Data that duplicates normal stdout output

---

## Related

- [`02-init-and-log-format.md`](./02-init-and-log-format.md) — Log format
- [`04-release-pipeline-log-points.md`](./04-release-pipeline-log-points.md) — Pipeline log points

---

*Command pattern v1.0.0 — 2026-04-20*
