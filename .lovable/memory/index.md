# Memory Index

> **Updated:** 2026-04-21
> **Rule:** Every file under `.lovable/memory/` MUST be listed below.

---

## Workflow

| File | Purpose |
|------|---------|
| [`workflow/01-project-status.md`](./workflow/01-project-status.md) | Current project phase, what's done, what's pending, blockers |
| [`workflow/02-coding-rules-summary.md`](./workflow/02-coding-rules-summary.md) | Quick-reference coding rules table (TypeScript-specific) |
| [`workflow/03-reliability-risk-report.md`](./workflow/03-reliability-risk-report.md) | Reliability risk assessment |
| [`workflow/04-frontend-failure-analysis.md`](./workflow/04-frontend-failure-analysis.md) | 26 frontend gaps and their fixes |

## Docs

| File | Purpose |
|------|---------|
| [`docs/specifications.md`](./docs/specifications.md) | Structure and style rules for the `spec/` directory |

## Issues

| File | Purpose |
|------|---------|
| [`issues/README.md`](./issues/README.md) | Index of issue-specific knowledge files |
| [`issues/spec-hygiene.md`](./issues/spec-hygiene.md) | Open spec-structure issues (mirrors `spec/18-spec-issues/`) |

> **Active issue tracking** lives in `.lovable/pending-issues/` (open) and `.lovable/solved-issues/` (resolved) — single file per issue.

## Suggestions

| File | Purpose |
|------|---------|
| [`suggestions/suggestions-tracker.md`](./suggestions/suggestions-tracker.md) | Master tracker for all suggestions (open + completed) |
| [`suggestions/completed/SC001-frontend-gap-analysis.md`](./suggestions/completed/SC001-frontend-gap-analysis.md) | Completed: frontend gap analysis suggestion |

---

## Conventions

- Subfolders use **kebab-case** without numeric prefixes.
- Files use kebab-case and MAY have numeric prefixes for ordering.
- The folder is `.lovable/memory/` (singular). `.lovable/memories/` is **prohibited**.
- When you add a memory file, append a row to the matching section above.
