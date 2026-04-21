# Issues Log

> **Convention:** All application issues are tracked in `spec/02-coding-guidelines/22-app-issues/`.
> **Naming:** `NN-short-description.md` (sequential numbering)
> **Updated:** 2026-04-16

## Canonical Location

**`spec/02-coding-guidelines/22-app-issues/`** is the single source of truth for all app issues.

Previous locations (`spec/issues/`, `spec/32-app-issues/`, per-module `03-issues/` folders) have been **merged and removed**.

## File Template

Each issue file should contain:

```markdown
# Issue: [Short Title]

- **Created:** [date]
- **Status:** Active | Resolved
- **Severity:** Critical | High | Medium | Low
- **Area:** [Module / Component]

## Symptom
[What was observed]

## Root Cause
[What caused the issue]

## Resolution
[How it was fixed]

## Validation
[How the fix was verified]

## Affected Files
[List of files involved]
```

## Current Issues

| # | Issue | Area | Status |
|---|-------|------|--------|
| 01 | Code Line Alignment Mismatch | Docs Viewer / MarkdownRenderer | Active |
