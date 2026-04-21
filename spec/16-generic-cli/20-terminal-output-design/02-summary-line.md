# Section 2 — Summary Line

> **Parent:** [00-overview.md](00-overview.md)

A single line confirming the result count, prefixed with a success checkmark.

## Format

```
  ✓ Found 41 repositories
```

## Rules

| Rule | Detail |
|------|--------|
| Prefix | `✓` (green) for success, `⚠` (yellow) for partial, `✗` (red) for failure |
| Indentation | 2-space left margin, consistent with banner |
| Noun | Always pluralized correctly (`1 item` vs `41 items`) |
| Color | Green for the checkmark, white/default for the text |

## Generic Examples

| Domain | Output |
|--------|--------|
| Repos | `✓ Found 41 repositories` |
| Movies | `✓ Found 128 movies` |
| Devices | `✓ Discovered 12 devices` |
| Packages | `✓ Scanned 89 packages` |
| Servers | `✓ Connected to 5 servers` |

## Constants

```go
const (
    SummaryFoundFmt = "  ✓ Found %d %s\n"
    IconSuccess     = "✓"
    IconWarning     = "⚠"
    IconFailure     = "✗"
)
```
