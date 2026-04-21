# Color System

> **Parent:** [00-overview.md](00-overview.md)

## ANSI Escape Codes

```go
const (
    ColorReset   = "\033[0m"
    ColorBold    = "\033[1m"
    ColorDim     = "\033[2m"       // gray/muted text
    ColorRed     = "\033[31m"
    ColorGreen   = "\033[32m"
    ColorYellow  = "\033[33m"
    ColorBlue    = "\033[34m"
    ColorCyan    = "\033[36m"
    ColorWhite   = "\033[37m"
    ColorBoldCyan = "\033[1;36m"
)
```

## Color Assignments

| Element | Color | Code | Purpose |
|---------|-------|------|---------|
| Banner frame | Cyan | `\033[36m` | Visual identity, eye-catching |
| Section headers (`■`) | Cyan | `\033[36m` | Section separation |
| Section dividers (`───`) | Dim | `\033[2m` | Subtle visual break |
| Success icon (`✓`) | Green | `\033[32m` | Positive confirmation |
| Warning icon (`⚠`) | Yellow | `\033[33m` | Non-fatal alert |
| Failure icon (`✗`) | Red | `\033[31m` | Error state |
| Item names | White/Bold | `\033[1m` | Primary content |
| Status in parens | Dim | `\033[2m` | Secondary metadata |
| Commands | White | default | Copy-pasteable, no color noise |
| File paths | Blue | `\033[34m` | Clickable in supported terminals |
| Counters (`1/41`) | Dim | `\033[2m` | Present but not dominant |
| Emoji | No color | — | Emoji carry their own color |

## No-Color Mode

When stdout is not a TTY (piped, redirected), or when `NO_COLOR` environment
variable is set, all color codes must be suppressed:

```go
func supportsColor() bool {
    if os.Getenv("NO_COLOR") != "" {
        return false
    }
    fi, _ := os.Stderr.Stat()
    return fi.Mode()&os.ModeCharDevice != 0
}
```
