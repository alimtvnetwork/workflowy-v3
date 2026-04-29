# spec-hygiene/audits

Read-only auditing scripts that compute scope/coverage metrics over `spec/`.

These are **not** wired into `00-run-all.mjs` — they don't enforce gates, they
report numbers used in planning, estimation, and audit-finding ledger rows.

## Scripts

### `count-prose-musts.mjs`

Counts unformalized prose-MUSTs (MUST/SHALL assertions outside `AT-…` row blocks).

- Walks `spec/**/*.md`, skipping `00-adrs/`, `97-acceptance-criteria.md`, `_GATE-*`, `_LEDGER-*`, `AUDIT-*`.
- Maintains a heading stack; a line is "in an AT block" if **any** ancestor heading (`##` … `######`) cites `AT-[A-Z]+-`.
- Excludes lines that themselves cite `AT-…` or `G-…` identifiers (bare or dashed; both `G-40` and `G-N1-FOO` accepted).
- Excludes canonical fixture-table slot rows (`| **Negative assertion** |`, `| **Then** |`, `| **Side effects** |`, `| **Given** |`, `| **When** |`, `| **Linter command** |`, `| **Response envelope** |`, `| **Expected …** |`) — these ARE AT-shaped per `19-acceptance-criteria-io-table.md` SSOT.
- Excludes blockquoted lines (`> …`): citations of other docs, not new MUSTs.

**Authoritative output (2026-04-29, v4):** 594 prose-MUSTs across 259 files.
This is the working baseline for spec-task #6 (prose→AT migration).

**Methodology history** (see `spec/AUDIT-FINDINGS-LEDGER.md`):
- F-SCOPE-01 — initial 682 estimate (line-scoped regex, undercounted).
- F-SCOPE-02 — v1 of this script returned 724 (single-heading walk, overcounted nested AT children).
- F-SCOPE-03 — v2 (full heading-stack) → 697.
- F-SCOPE-05 — v3 (fixture-slot + blockquote exclusions) → 623.
- F-SCOPE-06 — v4 (bare-form gate citations: `G-40` not just `G-40-…`) → 594.

Run: `node scripts/spec-hygiene/audits/count-prose-musts.mjs`
