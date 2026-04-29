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
- Excludes RFC-2119 priority cells (`| F1 | requirement | MUST |`): tag-style priority markers in tabular requirements convention.

**Authoritative output (2026-04-29, v7):** 467 prose-MUSTs across 240 files.
This is the working baseline for spec-task #6 (prose→AT migration).

**Methodology history** (see `spec/AUDIT-FINDINGS-LEDGER.md`):
- F-SCOPE-01 — initial 682 estimate (line-scoped regex, undercounted).
- F-SCOPE-02 — v1 of this script returned 724 (single-heading walk, overcounted nested AT children).
- F-SCOPE-03 — v2 (full heading-stack) → 697.
- F-SCOPE-05 — v3 (fixture-slot + blockquote exclusions) → 623.
- F-SCOPE-06 — v4 (bare-form gate citations: `G-40` not just `G-40-…`) → 594.
- F-SCOPE-07 — v5 (RFC-2119 priority cells in requirements matrices) → 565 → 556 after batch-4 content migration.
- F-SCOPE-08 — v6 (alphabetic-prefix gate citations: `G-A4-*`, `G-ERR-*`, `G-UPD-*`) → 547 after batch-5 content migration (9 lines bound to 9 new `G-A4-*` gates in `09-audit-log-policy.md`).
- F-SCOPE-09 — pure content turn (no parser change): batch-6 bound 8 prose-MUSTs in `spec/00-scoping.md` to 9 new/promoted `G-NS-SCOPING-*` gates → 539.
- F-SCOPE-10 — pure content turn: batch-7 bound 8 prose-MUSTs in `spec/01-spec-authoring-guide/21-feature-block-format.md` to 5 new `G-39*` CI gates (umbrella + 4 sub-rules) → 531.
- F-SCOPE-11 — v7 (fenced-code-block skip: triple-backtick/triple-tilde info-string agnostic) eliminated 25 false positives corpus-wide. Combined with batch-8 content migration (7 prose-MUSTs in `spec/02-coding-guidelines/00-overview.md` bound to 6 new `G-CG-*` gates) → **499**.
- F-SCOPE-12 — pure content migration, no parser change. Batch-9 bound 8 prose-MUSTs in `spec/09-code-block-system/11-highlighter-dependency-pin.md` to 7 new `G-HLPIN-*` gates (Domain-HLPIN). Δ –8 = exact match → **491**. Third consecutive zero-parser-drift batch.
- F-SCOPE-13 — pure content migration, no parser change. Batch-10 bound 8 prose-MUSTs in `spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md` to 9 new `G-AUI-*` gates (Domain-AUI). Δ –8 = exact match → **483**. Fourth consecutive zero-parser-drift batch; first batch where source file had no pre-existing AT/gate scaffold.
- F-SCOPE-14 — pure content migration, no parser change. Batch-11 bound 8 prose-MUSTs in `spec/31-app/05-conventions/10-role-escalation-policy.md` to 9 new `G-24*` gates (Domain-RE). Δ –8 = exact match → **475**. Fifth consecutive zero-parser-drift batch; promoted named-but-unregistered umbrella `G-24` to formal registry row.
- F-SCOPE-15 — pure content migration with namespace-collision discovery (MED). Batch-12 bound 8 prose-MUSTs in `spec/31-app/05-conventions/14-backup-and-dr-policy.md` to 7 new `G-BACKUP-*` gates (Domain-BACKUP). Source file's §10 declared `G-28` umbrella but `G-28-*` is owned by ADR-0028 (i18n) — collision sidestepped, source-callout rename tracked as F-SCOPE-15-FOLLOWUP. Δ –8 = exact match → **467**. Sixth consecutive zero-parser-drift batch; first batch surfacing a namespace collision.

Run: `node scripts/spec-hygiene/audits/count-prose-musts.mjs`
