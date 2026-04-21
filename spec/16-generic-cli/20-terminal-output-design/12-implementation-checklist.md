# Implementation Checklist

> **Parent:** [00-overview.md](00-overview.md)

## Tasks

| # | Task | File |
|---|------|------|
| 1 | Define all format constants | `constants/constants_output.go` |
| 2 | Define emoji constants | `constants/constants_output.go` |
| 3 | Define color constants | `constants/constants_output.go` |
| 4 | Implement `printBanner()` | `formatter/terminal.go` |
| 5 | Implement `printSummary()` | `formatter/terminal.go` |
| 6 | Implement `printItemList()` | `formatter/terminal.go` |
| 7 | Implement `printTree()` | `formatter/terminal.go` |
| 8 | Implement `printOutputFiles()` | `formatter/terminal.go` |
| 9 | Implement `printActionGuide()` | `formatter/terminal.go` |
| 10 | Implement `printFileConfirmations()` | `formatter/terminal.go` |
| 11 | Implement `supportsColor()` | `formatter/color.go` |
| 12 | Implement `centerPad()` | `formatter/terminal.go` |
| 13 | Write tests for tree rendering | `formatter/terminal_test.go` |
| 14 | Write tests for color suppression | `formatter/color_test.go` |

## Constraints

- All format strings in `constants/` — zero string literals in formatters.
- Each formatter function accepts `io.Writer` — testable without stdout capture.
- Maximum function length: 15 lines.
- Maximum file length: 200 lines.
- Tree depth capped at 4 levels.
- Banner width fixed at 38 inner characters.
- `NO_COLOR` environment variable respected unconditionally.
