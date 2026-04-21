# Section 6 — Action Guide

> **Parent:** [00-overview.md](00-overview.md)

Numbered steps telling the user what to do next. Every step includes a
copy-pasteable command.

## Format

```
  ■ How to Clone on Another Machine
  ──────────────────────────────────────────

  1. Copy the output files to the target machine:
     .toolname/output/data.json  (or .csv / .txt)

  2. Import via JSON (shorthand):
     toolname import json --target-dir ./projects
     toolname i json               # alias

  3. Or run the script directly:
     .\restore.ps1 -TargetDir .\projects
```

## Rules

| Rule | Detail |
|------|--------|
| Numbered steps | Sequential, 1-indexed |
| Commands indented | 5-space indent (aligned under the step text) |
| Aliases shown | Short alias on the line below the full command |
| Context lines | Plain text explaining the step precedes the command |
| Maximum steps | 8 steps — if more are needed, link to documentation |

## Generic Examples

**Movie catalog next steps:**
```
  ■ What You Can Do Next
  ──────────────────────────────────────────

  1. Browse your collection:
     moviecli list --sort rating
     moviecli ls -s rating          # alias

  2. Get recommendations:
     moviecli recommend --genre sci-fi
     moviecli rec -g sci-fi         # alias

  3. Export for sharing:
     moviecli export --format markdown > my-movies.md

  4. Sync with Letterboxd:
     moviecli sync letterboxd --username johndoe
```
