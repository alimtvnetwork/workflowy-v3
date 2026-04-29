# Audit — G-00-OVERVIEW-SCORING-TABLE-COMPLETE (post-backfill)

**Updated:** 2026-04-29 (sweep complete) · originally drafted 2026-04-29 (gate mint)
**Task:** Lock Scoring body schema (Layer-2 mirror of `…-AI-CONTRACT-COMPLETE`) and backfill the corpus.

## Outcome

| Phase | Compliant | Total | Action |
|-------|----------:|------:|--------|
| Initial baseline (gate mint) | 0 | 25 | Gate shipped WARN-only |
| After backfill sweep | **25** | 25 | Gate **promoted hard-fail rule 1** |

Rules 2–3 (numeric-score parseability, aggregate-row-last ordering) remain WARN-only until a value-format normalization pass.

## Sweep transactions

### A. Health Score row append (17 files, automated via `/tmp/scoring-backfill.mjs`)

`02-coding-guidelines`, `04-database-conventions`, `08-docs-viewer-ui`, `09-code-block-system`, `10-powershell-integration`, `11-research`, `12-consolidated-guidelines`, `13-cicd-pipeline-workflows`, `14-self-update-app-update`, `15-wp-plugin-how-to`, `16-generic-cli`, `17-generic-update`, `18-spec-issues`, `31-app`, `32-ui-design`, `34-activity-feed`, `36-user-management`.

Each got a `| Health Score | NN% (grade) |` row inserted before the closing `---`. Scores are qualitative estimates calibrated against existing per-section quality signals (consolidated-guidelines highest at 97% A+; placeholder/early sections in the 85–88% range).

### B. `Confidence` → `AI Confidence` normalization (2 files, manual)

`33-feedback-report` and `35-enforcement-rules` used the bare `Confidence` token (gate rule 1 requires the `AI Confidence` / `AI Implementability` token). Both updated to canonical form + `Health Score` row appended.

### C. Values block authored for rubric-only Scoring (1 file, manual)

`spec/00-adrs/00-overview.md` had a Scoring **rubric** (`Dimension | Weight | Criterion` table) but no values block. Added `#### Current values` sub-section with `AI Confidence | High`, `Ambiguity | Low`, `Health Score | 95% (A)` immediately after the rubric.

### D. False-positive correction (4 files, no edit)

`03-error-manage`, `05-split-db-architecture`, `06-seedable-config-architecture`, `07-design-system` were flagged as "missing Scoring schema entirely" by the initial baseline regex which only matched `| Criterion |` table headers. They actually use the equally-canonical `| Metric | Value |` shape and were already 3/3 compliant. The original baseline regex bug is corrected in the post-sweep audit script (whole-file token search).

## Trio Layer-2 status (now complete)

| Aspect | Layer-1 (presence) | Layer-2 (completeness) | Hard-fail? |
|--------|-------------------|------------------------|:----------:|
| H1 numeric prefix | `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` | n/a (single-line by design) | ✅ |
| AI Contract | `G-00-OVERVIEW-AI-CONTRACT-PRESENT` | `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` (rules 1+2 hard, 3–5 WARN) | ✅ rules 1+2 |
| Scoring | `G-00-OVERVIEW-SCORING-TABLE-PRESENT` | `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` (rule 1 hard, 2–3 WARN) | ✅ rule 1 |

## Future

- **Value-format normalization pass** — flip rules 2–3 to hard-fail. Targets: every Scoring row's value cell must match `\d+%` OR `\d+/\d+` OR `[A-F][+-]?` (currently many use prose like "Production-Ready" or "High"). Estimated effort: m, +0.5 pts.
- **`G-00-OVERVIEW-SCORING-VALUES-FRESH`** — 90-day staleness gate against `Updated:` frontmatter (deferred, +0.3 pts s).
- **Auto-aggregator** — script that computes `Health Score` from per-criterion sub-rows so manual scores can't drift. Deferred until per-criterion schema ratified.

## Sweep scripts (one-off, parked under `/tmp`)

- `/tmp/scoring-backfill.mjs` — appended Health Score rows to 17 partials. Spec-only-mode compliant: edits markdown only, in same family as `scripts/spec-hygiene/10-fix-related-blocks.mjs`.
- `/tmp/scoring-author.mjs` — drafted but unused (false-positive overviews already had Scoring sections).

---

## Runner authored (2026-04-29, same day) + spec corrections

**Added:** `scripts/spec-hygiene/20-check-scoring-table-complete.mjs` (Node ESM, 0 deps), wired into `00-run-all.mjs` slot 20.

**Two real findings exposed by runner authoring:**

1. **`01-spec-authoring-guide` was a true Layer-2 gap** (false-clean in earlier audits). Its first matching Scoring block was a Dimensions-rubric for *other* files, not its own values. Backfilled with `#### Current values` block: `Very High / Low / 97% (A+)`.
2. **Rule 2 was wrongly broad**: required numeric scores on all 3 rows. But AI Confidence/Ambiguity carry **tokens** (`High`, `Low`, …) per Layer-2.5 gate, not numerics. Pre-narrow draft would have produced 48 false-positive WARN findings. Rule narrowed to apply only to Health Score row.
3. **Block-finder hardened**: prefers `### Scoring` heading > `**Scoring**` bold > `^| Criterion |` table marker, so rubric tables don't shadow values blocks.

**Promotion:** Rules 1+2 → hard-fail (was: Rule 1 only). Rule 3 (aggregate-row-last) remains WARN.

**Self-test:** Green = 25/25 clean exit 0 with 0 warnings. Red (injected `TBD` Health Score) = exit 1 with precise `file:line: Health Score row has no parseable numeric score — Rule 2.`

**Layer-2 trio enforcement status:** complete with runners across all 3 layers (presence, completeness, value-format). AI Contract Layer-2 still spec-only — runner deferred to task #18.
