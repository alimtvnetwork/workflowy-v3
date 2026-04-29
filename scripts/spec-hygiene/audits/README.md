# spec-hygiene/audits

Read-only auditing scripts that compute scope/coverage metrics over `spec/`.

These are **not** wired into `00-run-all.mjs` — they don't enforce gates, they
report numbers used in planning, estimation, and audit-finding ledger rows.

## Scripts

### `count-prose-musts.mjs`

Counts unformalized prose-MUSTs (MUST/SHALL assertions outside `AT-…` row blocks).

- Walks `spec/**/*.md`, skipping `00-adrs/`, `97-acceptance-criteria.md`, `_GATE-*`, `_LEDGER-*`, `AUDIT-*`.
- Maintains a heading stack; a line is "in an AT block" if **any** ancestor heading (`##` … `######`) cites `AT-[A-Z]+-`.
- Excludes lines that themselves cite `AT-…` or `G-…` identifiers (already-formalized).

**Authoritative output (2026-04-29):** 697 prose-MUSTs across 285 files.
This is the working baseline for spec-task #6 (prose→AT migration).

**Methodology history** (see `spec/AUDIT-FINDINGS-LEDGER.md`):
- F-SCOPE-01 — initial 682 estimate (line-scoped regex, undercounted).
- F-SCOPE-02 — v1 of this script returned 724 (single-heading walk, overcounted nested AT children).
- F-SCOPE-03 — v2 (current) walks the full heading stack → 697.

Run: `node scripts/spec-hygiene/audits/count-prose-musts.mjs`
