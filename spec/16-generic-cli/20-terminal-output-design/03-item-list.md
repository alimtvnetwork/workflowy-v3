# Section 3 — Item List

> **Parent:** [00-overview.md](00-overview.md)

The main body of the report. Each item is a **two-line block**: identity on
line 1, actionable detail on line 2.

## Format

```
  ■ Repositories
  ──────────────────────────────────────────

  1/41 📦 agent-experiment (main)
       └─ git clone -b main https://github.com/org/agent-experiment agent-experiment

  2/41 📦 atto-property (dev)
       └─ git clone -b dev https://gitlab.com/org/atto-property.git atto-property
```

## Line 1 — Item Header

```
  {counter}/{total} {emoji} {name} ({status})
```

| Element | Purpose | Example |
|---------|---------|---------|
| Counter | Position in list | `1/41` |
| Emoji | Type indicator | `📦` (package), `🎬` (movie), `📡` (device) |
| Name | Primary identifier, bold concept | `agent-experiment` |
| Status | Current state in parentheses | `(main)`, `(released)`, `(online)` |

## Line 2 — Detail Line

```
       └─ {actionable detail}
```

| Element | Purpose | Example |
|---------|---------|---------|
| Tree connector | `└─` visually links to header | `└─` |
| Indent | Aligns under the name (7 spaces) | `       ` |
| Detail | Command, path, URL, or description | `git clone -b main https://...` |

## Rules

| Rule | Detail |
|------|--------|
| Blank line | One blank line between each item block |
| Counter width | Right-aligned to match the widest number (`1/41` aligns with `41/41`) |
| Emoji | One emoji per item type — never mix within a list |
| Status | Always in parentheses, always present (use `(unknown)` if missing) |
| Detail line | Optional — omit if no actionable detail exists |

## Section Header

Each item list section starts with a **section header**:

```
  ■ {Section Title}
  ──────────────────────────────────────────
```

| Element | Detail |
|---------|--------|
| Icon | `■` (filled square) — consistent across all sections |
| Title | Capitalized, descriptive (`Repositories`, `Movies`, `Output Files`) |
| Divider | 42 `─` characters (em dash), indented 2 spaces |

## Generic Examples

**Movie catalog:**
```
  ■ Movies
  ──────────────────────────────────────────

  1/5 🎬 The Matrix (1999)
      └─ Genre: Sci-Fi | Rating: 8.7 | Director: Wachowski

  2/5 🎬 Inception (2010)
      └─ Genre: Sci-Fi | Rating: 8.8 | Director: Christopher Nolan
```

**Server inventory:**
```
  ■ Servers
  ──────────────────────────────────────────

  1/3 📡 api-prod-us-east (online)
      └─ 10.0.1.42:8080 | CPU: 23% | Memory: 4.2GB/8GB

  2/3 📡 api-prod-eu-west (online)
      └─ 10.0.2.18:8080 | CPU: 45% | Memory: 6.1GB/8GB

  3/3 📡 api-staging (maintenance)
      └─ 10.0.3.5:8080 | CPU: 0% | Memory: 1.2GB/8GB
```

**Package audit:**
```
  ■ Dependencies
  ──────────────────────────────────────────

  1/12 📦 lodash (4.17.21)
       └─ ✓ No known vulnerabilities

  2/12 📦 express (4.18.2)
       └─ ⚠ 1 moderate vulnerability — run npm audit fix

  3/12 📦 jsonwebtoken (8.5.1)
       └─ ✗ 2 critical vulnerabilities — upgrade to 9.0.0+
```

## Constants

```go
const (
    SectionHeaderFmt = "  ■ %s\n"
    SectionDivider   = "  ──────────────────────────────────────────\n"
    ItemHeaderFmt    = "  %*d/%d %s %s (%s)\n"
    ItemDetailFmt    = "       └─ %s\n"
)
```
