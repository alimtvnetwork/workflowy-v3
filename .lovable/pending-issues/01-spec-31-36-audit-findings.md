# Spec 31–36 Consistency-Report Audit Findings

> **Opened:** 2026-04-20
> **Scope:** spec/ folders 18+ only

## Description

Audit of consistency reports across `spec/31-app`, `spec/32-ui-design`, `spec/33-feedback-report`, `spec/34-activity-feed`, `spec/35-enforcement-rules`, `spec/36-user-management` revealed 0 broken cross-references and all 17 required `00-overview.md` + `99-consistency-report.md` files present, BUT the following structural / metadata issues remain:

1. **Inventory error in `spec/31-app/99-consistency-report.md`** — lists a non-existent `02-audits/` folder and an incorrect subfolder count (says 6 subfolders; actual count differs).
2. **Numbering gap in `spec/31-app/`** — subfolders skip from `01-` to `03-`, violating the contiguous-numbering rule.
3. **Stale dates** — all 17 `99-consistency-report.md` files dated 2026-04-18; should be refreshed when next touched.
4. **Missing `97-acceptance-criteria.md` rows** — 17 consistency reports do not list this file in their inventories (where applicable).
5. **Header violation** — `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md` is missing the required `> **Version:**` line at the top.

## Root Cause

- Restructure work moved/renamed folders without updating consistency-report inventories.
- Auto-TOC / hygiene scripts that would have caught these were forbidden from touching folders 01–17 (correctly), but folders 18+ also did not get a re-run.
- Tailwind SSOT file was authored before the standard header convention was codified.

## Steps to Reproduce

1. Open `spec/31-app/99-consistency-report.md` — see `02-audits/` row.
2. Run `ls spec/31-app/` — no `02-audits/` directory exists; subfolders jump from 01 → 03.
3. Open `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md` — top blockquote lacks `> **Version:** X.Y.Z`.
4. Expected: inventories accurate, contiguous numbering, header complete.

## Attempted Solutions

- [x] Audit performed and findings documented (this issue).
- [ ] Approach A — renumber `spec/31-app/03-…` → `02-…` and update inbound links (recommended).
- [ ] Approach B — create empty `spec/31-app/02-audits/` placeholder (NOT recommended; adds dead folder).
- [ ] Add `> **Version:** 1.0.0` line to tailwind SSOT file.
- [ ] Refresh date and inventory of all 17 `99-consistency-report.md` files in folders 31–36.

## Priority

Medium — does not break the build; affects spec hygiene and future automation reliability.

## Blocked By

User decision: confirm Approach A (renumber) vs Approach B (create folder) for the `spec/31-app/` numbering gap.
