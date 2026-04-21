# Spacing and Indentation

> **Parent:** [00-overview.md](00-overview.md)

## Global Rules

| Element | Indent | Example |
|---------|--------|---------|
| Banner | 2 spaces | `  ╔═══...` |
| Summary line | 2 spaces | `  ✓ Found 41 items` |
| Section header | 2 spaces | `  ■ Section Title` |
| Section divider | 2 spaces | `  ────────...` |
| Item header | 2 spaces | `  1/41 📦 name (status)` |
| Item detail | 7 spaces | `       └─ detail` |
| Tree root | 2 spaces | `  ├── 📦 item` |
| Tree nested | 2 + (4 × depth) | `  │   ├── 📦 child` |
| Action steps | 2 spaces | `  1. Step text` |
| Action commands | 5 spaces | `     toolname cmd` |
| File confirmations | 0 spaces | `CSV written to /path` |

## Blank Lines

| Between | Blank lines |
|---------|-------------|
| Banner and summary | 1 |
| Summary and first section | 1 |
| Section header and first item | 1 |
| Between items | 1 |
| Between sections | 1 |
| Last section and file confirmations | 1 |
| Between file confirmation lines | 0 |
