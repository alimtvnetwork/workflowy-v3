# Init Flow & Log Entry Format

> **Parent:** [16-verbose-logging overview](./00-overview.md)

---

## Init Flow

```go
func Init() (*Logger, error) {
    logDir := constants.DefaultOutputFolder
    _ = os.MkdirAll(logDir, constants.DirPermission)

    timestamp := time.Now().Format("2006-01-02_15-04-05")
    logPath := filepath.Join(logDir, fmt.Sprintf(constants.VerboseLogFileFmt, timestamp))

    file, err := os.Create(logPath)
    if err != nil {
        return nil, err
    }

    l := &Logger{file: file, enabled: true}
    global = l
    fmt.Printf(constants.MsgVerboseLogFile, logPath)

    return l, nil
}
```

**Key points:**

- Creates the output directory if missing (no error on existing)
- Prints the log file path to stdout so the user knows where to find it
- Returns both the logger and any error — caller decides whether to abort

---

## Log Entry Format

```go
func writeLogEntry(l *Logger, format string, args ...interface{}) {
    line := fmt.Sprintf(format, args...)
    ts := time.Now().Format("15:04:05.000")
    entry := fmt.Sprintf("[%s] %s\n", ts, line)
    l.file.WriteString(entry)
    fmt.Fprint(os.Stderr, constants.ColorDim+entry+constants.ColorReset)
}
```

**Example output:**

```
[14:32:07.123] git clone https://github.com/user/repo.git
[14:32:09.456] clone completed in 2.3s
[14:32:09.460] retry attempt 1/4 for locked file
```

---

## Related

- [`01-design-and-api.md`](./01-design-and-api.md) — Logger API
- [`03-command-pattern.md`](./03-command-pattern.md) — Command handler pattern

---

*Init & log format v1.0.0 — 2026-04-20*
