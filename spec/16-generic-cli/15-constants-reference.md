# Constants Reference

> **Related specs:**
> - [02-project-structure.md](02-project-structure.md) — `constants/` package placement
> - [08-code-style.md](08-code-style.md) — naming conventions for constant identifiers
> - [20-terminal-output-design/00-overview.md](20-terminal-output-design/00-overview.md) — terminal format constants used in rendering

## Overview

The `constants` package is the single source of truth for all shared
string literals, default values, format strings, and configuration.
No magic strings — every literal used for comparison, formatting,
defaults, or file extensions must be defined here.

The package is split into focused files to maintain the 200-line limit.

---

## File Organization

| File | Responsibility |
|------|----------------|
| `constants.go` | Version, modes, formats, extensions, defaults, permissions |
| `constants_cli.go` | Command names, aliases, subcommand names |
| `constants_terminal.go` | ANSI colors, banner art, table headers, row formats |
| `constants_messages.go` | User-facing messages, error strings, status icons |
| `constants_git.go` | Git binary, subcommands, flags, format strings |
| `constants_store.go` | DB paths, table names, SQL statements |
| `constants_<domain>.go` | Domain-specific constants (one file per feature area) |

### Splitting Rules

- Each file ≤ 200 lines.
- Group by domain, not by type (don't put all strings in one file).
- When a domain file exceeds 150 lines, split into sub-domains.
- File naming: `constants_<domain>.go` (lowercase, underscore).

---

---

## Category Catalog

Moved to [`15b-constants-category-catalog.md`](./15b-constants-category-catalog.md) (split 2026-04-25 — F-08) to keep this file under 400 lines.

---

## What Does NOT Belong in Constants

| Category | Reason |
|----------|--------|
| Struct definitions | Belong in `model` package |
| Business logic | Belongs in domain packages |
| Template content | Use `go:embed` in `formatter/templates/` |
| Test data strings | Stay local in test files |
| Log messages unique to one location | Not compared or reused |

---

---

## Continued

The remaining sections of this document have been moved to [`15a-naming-and-contributors.md`](./15a-naming-and-contributors.md) (split 2026-04-25 — F-08) to keep this file under 400 lines:

- Naming Quick Reference
- (and following sections)

See the sibling file for the full content.
