# Memory Index

> **Updated:** 2026-04-21
> **Rule:** Every file under `.lovable/memory/` MUST be listed below.

---

## Workflow

| File | Purpose |
|------|---------|
| [`workflow/01-project-status.md`](./workflow/01-project-status.md) | Current project phase, what's done, what's pending, blockers |
| [`workflow/02-coding-rules-summary.md`](./workflow/02-coding-rules-summary.md) | Quick-reference coding rules table (TypeScript-specific) |
| [`workflow/03-reliability-risk-report.md`](./workflow/03-reliability-risk-report.md) | Earlier reliability risk assessment (superseded by `.lovable/reports/01-ai-readiness-report.md` 2026-04-21) |
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
| [`suggestions/README.md`](./suggestions/README.md) | **Authoritative contract** for suggestions: per-file convention, frontmatter, status flow |
| [`suggestions/01-workflowy-spec-consolidation.md`](./suggestions/01-workflowy-spec-consolidation.md) | S01 — Workflowy spec consolidation (active) |
| [`suggestions/02-fix-spec-31-36-audit-findings.md`](./suggestions/02-fix-spec-31-36-audit-findings.md) | S02 — Fix 5 audit findings (open) |
| [`suggestions/03-fix-49-broken-relative-links.md`](./suggestions/03-fix-49-broken-relative-links.md) | S03 — Broken links (open) |
| [`suggestions/04-ci-gate-overview-and-consistency.md`](./suggestions/04-ci-gate-overview-and-consistency.md) | S04 — CI gate overview + consistency (open) |
| [`suggestions/05-ci-gate-broken-relative-links.md`](./suggestions/05-ci-gate-broken-relative-links.md) | S05 — CI gate broken links (open) |
| [`suggestions/06-move-parallel-spec-folders.md`](./suggestions/06-move-parallel-spec-folders.md) | S06 — Move parallel folders (open) |
| [`suggestions/suggestions-tracker.md`](./suggestions/suggestions-tracker.md) | LEGACY tracker (historical reference; not authoritative since 2026-04-21) |
| [`suggestions/completed/SC001-frontend-gap-analysis.md`](./suggestions/completed/SC001-frontend-gap-analysis.md) | Completed: frontend gap analysis suggestion |

## Reports

| File | Purpose |
|------|---------|
| [`../reports/01-ai-readiness-report.md`](../reports/01-ai-readiness-report.md) | 2026-04-21 handoff-readiness report (executive summary + appendix) |

---

## User preferences (always-on)

`.lovable/user-preferences` is loaded automatically by Lovable. Highlights:

- Malaysia timezone (UTC+8) in all dated entries.
- Numbered file naming `01-name.md`.
- Bump at least minor version on every code change. Never touch `.release/`.
- One consolidated file for **plan** and **strictly-avoid**; per-file convention for **suggestions** and **pending-issues**.
- Never append filler ("Hope this helps!", "Let me know if…").
- Always list remaining tasks at the end of each session.

---

## Conventions

- Subfolders use **kebab-case** without numeric prefixes.
- Files use kebab-case and MAY have numeric prefixes for ordering.
- The folder is `.lovable/memory/` (singular). `.lovable/memories/` is **prohibited**.
- When you add a memory file, append a row to the matching section above.
