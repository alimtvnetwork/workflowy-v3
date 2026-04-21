# Design Rules, Package Structure & Logger API

> **Parent:** [16-verbose-logging overview](./00-overview.md)

---

## Design Rules

| Rule | Detail |
|------|--------|
| Off by default | No log file created unless `--verbose` is passed |
| File + stderr | Every verbose entry writes to both the log file and stderr |
| Timestamped entries | Each line prefixed with `[HH:MM:SS.mmm]` |
| Timestamped filenames | Log file named `toolname-verbose-YYYY-MM-DD_HH-mm-ss.log` |
| Output directory | Logs written to the tool's default output folder |
| Dim on stderr | Verbose stderr output uses dim/gray ANSI color |
| No stdout pollution | Verbose output never mixes with normal command output |
| Global singleton | One logger instance shared across all packages |

---

## Package Structure

```
verbose/
└── verbose.go     Logger type, Init, Close, Log, IsEnabled, Get
```

Single file. No sub-packages. No external dependencies beyond `constants`.

---

## Logger API

```go
// Init creates the log file and enables verbose logging.
// Call once at startup when --verbose is set.
func Init() (*Logger, error)

// Close flushes and closes the log file.
func (l *Logger) Close()

// Log writes a formatted message to the log file and stderr.
func (l *Logger) Log(format string, args ...interface{})

// IsEnabled returns true if verbose mode is active.
func IsEnabled() bool

// Get returns the global logger (may be nil).
func Get() *Logger
```

---

## Logger Type

```go
type Logger struct {
    file    *os.File
    enabled bool
}

var global *Logger
```

- `file` — open handle to the log file
- `enabled` — guards all write operations
- `global` — package-level singleton set by `Init()`

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-init-and-log-format.md`](./02-init-and-log-format.md) — Init flow

---

*Design & API v1.0.0 — 2026-04-20*
