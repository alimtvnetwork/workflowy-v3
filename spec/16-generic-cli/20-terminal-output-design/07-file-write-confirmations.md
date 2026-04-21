# Section 7 — File Write Confirmations

> **Parent:** [00-overview.md](00-overview.md)

After all sections, the tool prints one line per file written. These are
plain, unformatted confirmation lines.

## Format

```
CSV written to D:\projects\.toolname\output\data.csv
JSON written to D:\projects\.toolname\output\data.json
Structure written to D:\projects\.toolname\output\structure.md
Database updated: 41 items upserted
```

## Rules

| Rule | Detail |
|------|--------|
| Format | `{Type} written to {absolute path}` |
| No emoji | These are machine-log-style confirmations |
| Absolute paths | Always show the full path for unambiguous reference |
| Database line | `Database updated: {N} {noun} upserted` |
| Order | Same order as the Output Files section |
