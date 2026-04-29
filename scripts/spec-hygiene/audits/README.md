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

**Authoritative output (2026-04-29, v7):** 439 prose-MUSTs across 236 files.
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
- F-SCOPE-16 — pure content migration with pre-flight namespace check. Batch-13 bound 7 prose-MUSTs in `spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md` to 8 new `G-ERRCODE-*` gates (Domain-ERRCODE). F-SCOPE-15 lesson applied: greped registry first to avoid collision with existing `G-ERR-*` and `G-22-*`. Δ –7 = exact match → **460**. Seventh consecutive zero-parser-drift batch.
- F-SCOPE-17 — pure content migration. Batch-14 bound 7 prose-MUSTs in `spec/13-cicd-pipeline-workflows/00-overview.md` to 7 new `G-13-*` sub-gates inside existing **ADR-0013** section (no new domain). Pre-flight namespace check OK (16 sibling gates). Source file → 0; net corpus 467 → 453 (Δ –14; collateral skips on other files via bare-form regex now matching the new gate ids). Eighth consecutive zero-parser-drift batch.
- F-SCOPE-18 — pure content migration. Batch-15 bound 7 prose-MUSTs in `spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md` to 5 new `G-13-FIXTURE-SHAPE-*` sub-gates (sub-rules of umbrella `G-13-FIXTURE-AS-SPEC-SHAPE`). Re-learned lesson: counter is per-line — gate citation MUST be on the same physical line as the MUST keyword. Source → 0; corpus 453 → 446 (Δ –7 = exact match). Ninth consecutive zero-parser-drift batch.
- F-SCOPE-19 — pure content migration. Batch-16 bound 8 prose-MUSTs in `spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md` to 8 new `G-13-LEDGER-*` sub-gates (`-IMPL-PARITY`, `-RUNNER-FILTER`, `-FIVE-COLUMN-SCHEMA`, `-SCHEMA-SHAPE`, `-GATE-EXISTENCE`, `-GLOB-NON-EMPTY`, `-RATIONALE-PROSE`, `-RUNNER-CLEAN-OUTPUT`) — all DOC-NORM sub-rules of umbrella `G-13-LEDGER-PER-GATE-PATH` (CI). Same-line-citation rule applied from start (zero re-bind). Source 8 → 0 (parser-visible 7 → 0; L8 inside blockquote not counted). Corpus 446 → 439 (Δ –7 = exact match). Tenth consecutive zero-parser-drift batch.

Run: `node scripts/spec-hygiene/audits/count-prose-musts.mjs`
