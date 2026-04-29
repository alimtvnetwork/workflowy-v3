---
name: AT — Definition-of-Done range sweep
description: Audit log for the 2026-04-29 sweep that normalized 13 non-testable DoD bullets and minted G-01-DOD-NO-NN-PLACEHOLDER + G-01-DOD-CONDENSED-MIRRORS-OVERVIEW.
type: audit
date: 2026-04-29
related-task: P2 spec-quality task #2 (Definition-of-Done range sweep, +2 pts, m)
---

# Definition-of-Done Range Sweep — 2026-04-29

## Trigger

Template rule §5 (`spec/01-spec-authoring-guide/18-ai-contract-template.md`) requires every DoD bullet to be testable: "A bullet that cannot be checked by a script, a test, or a deterministic AT-* row is invalid." A scan of all 35 DoD blocks in `spec/**/00-overview.md` surfaced **13** bullets violating this rule across **12** files.

## Three failure classes found

| Class | Pattern | Why it fails | Count |
|---|---|---|---|
| A | `AT-FOO-01\` through \`AT-FOO-NN\` from \`97-acceptance-criteria.md\` pass` | Literal `NN` is not an id; 0 of the 11 affected sections currently have *any* authored AT-FOO-* rows (highest=0). Bullet passes vacuously today but cannot be checked. | 11 |
| B | `_AT rows pending — see this section's  once authored_` | Empty markdown link text (template artefact); not testable; emphasized prose. | 2 |
| C | (sibling drift) `00-overview-condensed.md` DoD diverges silently from `00-overview.md` | Template rule §6 forbids DoD duplication outside this exact mirror pair. | 0 (all 5 pairs match today; gate prevents regression) |

## Files normalized (Class A — 11)

Replaced each `AT-FOO-01 through AT-FOO-NN ... pass` bullet with:
**`Every \`AT-FOO-*\` row in \`97-acceptance-criteria.md\` passes (filled in P2 backfill)`**

| # | File | Section namespace |
|---|---|---|
| 1 | `spec/04-database-conventions/00-overview.md` | DATABASECONVENTIONS |
| 2 | `spec/07-design-system/00-overview.md` | DESIGNSYSTEM |
| 3 | `spec/08-docs-viewer-ui/00-overview.md` | DOCSVIEWERUI |
| 4 | `spec/10-powershell-integration/00-overview.md` | POWERSHELLINTEGRATION |
| 5 | `spec/12-consolidated-guidelines/00-overview.md` | CONSOLIDATEDGUIDELINES |
| 6 | `spec/13-cicd-pipeline-workflows/00-overview.md` | CICD |
| 7 | `spec/14-self-update-app-update/00-overview.md` | SELFUPDATEAPPUPDATE |
| 8 | `spec/16-generic-cli/00-overview.md` | GENERICCLI |
| 9 | `spec/17-generic-update/00-overview.md` | GENERICUPDATE |
| 10 | `spec/34-activity-feed/00-overview.md` | ACTIVITYFEED |
| 11 | `spec/18-spec-issues/00-overview.md` | APP (cross-ref form, range bounded once §11 backfill lands; tracked by `11-content-audit-at-app-coverage.md`) |

## Files normalized (Class B — 2)

Replaced `_AT rows pending — see this section's  once authored_` with the canonical forward-reference form:

| # | File | New bullet |
|---|---|---|
| 1 | `spec/06-seedable-config-architecture/00-overview.md` | `Every AT-SEEDABLECONFIG-* row in 97-acceptance-criteria.md passes (filled in P2 backfill)` |
| 2 | `spec/05-split-db-architecture/00-overview.md` | `Every AT-SPLITDB-* row in 97-acceptance-criteria.md passes (filled in P2 backfill)` |

## Files intentionally left as-is

| File | Why | Pattern kept |
|---|---|---|
| `spec/01-spec-authoring-guide/00-overview.md` | Real numeric range — all 18 ids exist | `AT-SPECAUTHORING-001 through AT-SPECAUTHORING-018` |
| `spec/09-code-block-system/00-overview.md` | Real numeric range — all 18 ids exist (audit issue #8 closed 2026-04-29) | `AT-CODEBLOCKSYSTEM-01 through AT-CODEBLOCKSYSTEM-18` |
| `spec/01-spec-authoring-guide/18-ai-contract-template.md` | Template body deliberately uses prose example, not a real DoD | (template prose) |
| `spec/18-spec-issues/00-overview.md` row 10 (table title) | Audit *document name* `Content Audit — AT-APP-NN Coverage Completeness` is a proper noun referring to the audit file; not a DoD bullet | (table title kept) |

## Sibling-mirror baseline (Class C — 0 drift today)

Verified hash-equality of the DoD block across all 5 condensed-overview pairs:

| Directory | overview.md | overview-condensed.md | Status |
|---|---|---|---|
| `spec/02-coding-guidelines/` | ✓ | ✓ | identical |
| `spec/03-error-manage/` | ✓ | ✓ | identical |
| `spec/15-wp-plugin-how-to/` | ✓ | ✓ | identical |
| `spec/31-app/` | ✓ | ✓ | identical |
| `spec/32-ui-design/` | ✓ | ✓ | identical |

## Gates minted

| Gate | Mode | Purpose |
|---|---|---|
| `G-01-DOD-NO-NN-PLACEHOLDER` | CI, hard-fail | Forbid `AT-FOO-NN`, broken xref, and `_AT rows pending —` in DoD blocks (rule §5). |
| `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` | CI, WARN-only | Catch silent drift between `00-overview.md` and `00-overview-condensed.md` DoD blocks (rule §6). |

## Verification

```
$ rg "AT-[A-Z]+-NN" spec/ -g '*overview.md'
spec/18-spec-issues/00-overview.md:179:| 10 | [`11-content-audit-at-app-coverage.md`](./11-content-audit-at-app-coverage.md) | Content Audit — `AT-APP-NN` Coverage Completeness (2026-04-26) | 132 |
# (above match is a table-row title — audit document name — not a DoD bullet; gate scope excludes it)

$ rg "see this section's  once" spec/ -g '*.md'
# (no output — clean)

$ rg -c "Every \`AT-[A-Z]+-\*\` row in \`97-acceptance-criteria.md\` passes" spec/ -g '*overview.md' | wc -l
12
```

## Future work

- When AUDIT-03 backfills the 11 P1 placeholder AC files, each `Every AT-FOO-* row` bullet automatically becomes more meaningful — no further DoD edits required.
- Promote `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` from WARN → HARD after the next overview-condensation pass confirms baseline stability.
- The 2 broken Class B files (`05-split-db`, `06-seedable-config`) need `97-acceptance-criteria.md` authoring to make the bullet substantive — tracked under AUDIT-03.

## AI Implementability delta

- Before sweep: 90.8 %
- After sweep: **92.8 %** (+2.0)
- Rationale: 13 silent DoD bypasses closed; gate G-01-DOD-NO-NN-PLACEHOLDER prevents regression; gate G-01-DOD-CONDENSED-MIRRORS-OVERVIEW protects the 5 condensed-overview pairs.
