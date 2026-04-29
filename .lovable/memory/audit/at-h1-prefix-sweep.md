---
name: AT — H1 folder-prefix sweep (Phase 2)
description: Audit log for the 2026-04-29 sweep that prepended `NN — ` folder-prefix to all 24 non-compliant top-level overview H1s, enabling G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX to flip from WARN-conditional to HARD-mandatory.
type: audit
date: 2026-04-29
related-task: P2 spec-quality task #15 (H1-prefix Phase-2 sweep, +0.5 pts, xs)
related-gate: G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX (Phase 3 active)
---

# H1 Folder-Prefix Sweep — 2026-04-29 (Phase 2)

## Trigger

Gate `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` shipped earlier today in WARN-only conditional mode because only **1 of 25** top-level `spec/[0-9][0-9]-*/00-overview.md` files carried a numeric H1 prefix (`spec/09-code-block-system/00-overview.md`, recently fixed under audit issue #6). Mandating prefix presence at gate-mint time would have mass-failed 24 files. Phase 2 closes that gap so Phase 3 can flip the gate to hard-fail mandatory.

## Canonical form chosen

```
# NN — <Title>
```

- Two-digit (or three-digit) numeric prefix matching folder.
- En-dash separator (` — `, U+2014 with surrounding spaces).
- Matches the existing `# 09 — Code Block System` form authored under audit issue #6.

## Files modified (24)

| # | File | Old H1 | New H1 |
|---|---|---|---|
| 1 | `spec/00-adrs/00-overview.md` | `# Architecture Decision Records (ADRs)` | `# 00 — Architecture Decision Records (ADRs)` |
| 2 | `spec/01-spec-authoring-guide/00-overview.md` | `# Spec Authoring Guide` | `# 01 — Spec Authoring Guide` |
| 3 | `spec/02-coding-guidelines/00-overview.md` | `# Coding Guidelines` | `# 02 — Coding Guidelines` |
| 4 | `spec/03-error-manage/00-overview.md` | `# Error Management Specification` | `# 03 — Error Management Specification` |
| 5 | `spec/04-database-conventions/00-overview.md` | `# Database Conventions` | `# 04 — Database Conventions` |
| 6 | `spec/05-split-db-architecture/00-overview.md` | `# Split Database Architecture` | `# 05 — Split Database Architecture` |
| 7 | `spec/06-seedable-config-architecture/00-overview.md` | `# Seedable Config Architecture + Changelog Versioning (also known as CW Config)` | `# 06 — Seedable Config Architecture + Changelog Versioning (also known as CW Config)` |
| 8 | `spec/07-design-system/00-overview.md` | `# AI-Adaptable Design System` | `# 07 — AI-Adaptable Design System` |
| 9 | `spec/08-docs-viewer-ui/00-overview.md` | `# Docs Viewer UI — Overview` | `# 08 — Docs Viewer UI — Overview` |
| 10 | `spec/10-powershell-integration/00-overview.md` | `# PowerShell Integration for Project Runner` | `# 10 — PowerShell Integration for Project Runner` |
| 11 | `spec/11-research/00-overview.md` | `# Research` | `# 11 — Research` |
| 12 | `spec/12-consolidated-guidelines/00-overview.md` | `# Consolidated Guidelines — Redirect Index` | `# 12 — Consolidated Guidelines — Redirect Index` |
| 13 | `spec/13-cicd-pipeline-workflows/00-overview.md` | `# CI/CD Pipeline Workflows` | `# 13 — CI/CD Pipeline Workflows` |
| 14 | `spec/14-self-update-app-update/00-overview.md` | `# Self-Update & App Update` | `# 14 — Self-Update & App Update` |
| 15 | `spec/15-wp-plugin-how-to/00-overview.md` | `# WordPress Plugin How-To` | `# 15 — WordPress Plugin How-To` |
| 16 | `spec/16-generic-cli/00-overview.md` | `# Generic CLI Creation Guidelines — Overview` | `# 16 — Generic CLI Creation Guidelines — Overview` |
| 17 | `spec/17-generic-update/00-overview.md` | `# Generic Update` | `# 17 — Generic Update` |
| 18 | `spec/18-spec-issues/00-overview.md` | `# Spec Issues` | `# 18 — Spec Issues` |
| 19 | `spec/31-app/00-overview.md` | `# App` | `# 31 — App` |
| 20 | `spec/32-ui-design/00-overview.md` | `# UI Design` | `# 32 — UI Design` |
| 21 | `spec/33-feedback-report/00-overview.md` | `# Feedback Report — Feature Spec` | `# 33 — Feedback Report — Feature Spec` |
| 22 | `spec/34-activity-feed/00-overview.md` | `# Activity Feed — Feature Spec` | `# 34 — Activity Feed — Feature Spec` |
| 23 | `spec/35-enforcement-rules/00-overview.md` | `# Enforcement Rules — Spec` | `# 35 — Enforcement Rules — Spec` |
| 24 | `spec/36-user-management/00-overview.md` | `# User Management — Feature Spec` | `# 36 — User Management — Feature Spec` |

## File intentionally not modified

| File | Reason |
|---|---|
| `spec/09-code-block-system/00-overview.md` | Already compliant (`# 09 — Code Block System`); fixed under audit issue #6 on 2026-04-29 morning. |

## Stacked em-dash note

7 of the 24 files now carry two em-dashes (e.g. `# 36 — User Management — Feature Spec`). This is acceptable: gate `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` only validates the prefix and first-dash separator; subsequent dashes inside the title are content and not regulated. A future cosmetic pass could collapse `Title — Feature Spec` → `Title (feature spec)` for the 7 affected files, but is out of scope for this sweep.

## Sub-overview files

This sweep covers the 25 top-level `spec/[0-9][0-9]-*/00-overview.md` files only. Sub-overview files (`spec/**/<deeper>/00-overview.md`, e.g. `spec/31-app/01-features/00-overview.md`) remain in gate scope but were not audited in this pass. A follow-up scan can be run with the same script if any are found out of compliance.

## Verification

```
$ for f in spec/[0-9][0-9]-*/00-overview.md; do
    dir=$(basename "$(dirname "$f")")
    prefix=$(echo "$dir" | grep -oP '^\d+')
    h1=$(grep -m1 '^# ' "$f")
    echo "$h1" | grep -qP "^# $prefix\b" || echo "FAIL: $f"
  done
# (no output — 25/25 pass)
```

## Gate flip

`G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` updated in `spec/01-spec-authoring-guide/97-acceptance-criteria.md` from "WARN-only conditional" → **"hard-fail mandatory — Phase 3 active"**. Failure modes now include both prefix-mismatch and prefix-absence.

## AI Implementability delta

- Before sweep: 93.1 %
- After sweep: **93.6 %** (+0.5)
- Rationale: 24 silent prefix-drift latents closed; gate flipped to hard-fail mandatory, eliminating an entire regression class going forward.
