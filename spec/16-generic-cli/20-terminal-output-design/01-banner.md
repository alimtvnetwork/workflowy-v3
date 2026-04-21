# Section 1 — Banner

> **Parent:** [00-overview.md](00-overview.md)

The banner establishes identity and version. It uses Unicode box-drawing
characters for a framed appearance.

## Format

```
  ╔══════════════════════════════════════╗
  ║            toolname v1.0.0           ║
  ╚══════════════════════════════════════╝
```

## Rules

| Rule | Detail |
|------|--------|
| Width | Fixed at 38 inner characters (40 total with frame) |
| Centering | Tool name + version centered with padding |
| Indentation | 2-space left margin for visual breathing room |
| Frame characters | `╔` `═` `╗` `║` `╚` `╝` (Unicode box-drawing, double-line) |
| Color | Cyan (`\033[36m`) for the entire frame |
| Content | `toolname v{MAJOR}.{MINOR}.{PATCH}` — always include version |

## Constants

```go
const (
    BannerTop    = "  ╔══════════════════════════════════════╗"
    BannerMiddle = "  ║            %s           ║"
    BannerBottom = "  ╚══════════════════════════════════════╝"
    BannerWidth  = 38 // inner character count
)
```

## Implementation

```go
func printBanner(version string) {
    name := fmt.Sprintf("toolname v%s", version)
    padded := centerPad(name, BannerWidth)
    fmt.Fprintf(os.Stderr, "%s\n", BannerTop)
    fmt.Fprintf(os.Stderr, "  ║%s║\n", padded)
    fmt.Fprintf(os.Stderr, "%s\n", BannerBottom)
}

func centerPad(s string, width int) string {
    pad := width - len(s)
    left := pad / 2
    right := pad - left
    return strings.Repeat(" ", left) + s + strings.Repeat(" ", right)
}
```
