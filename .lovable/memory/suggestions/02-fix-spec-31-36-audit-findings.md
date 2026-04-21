# S02 — Fix 5 Audit Findings in spec/ Folders 31–36

- **suggestionId:** S02
- **createdAt:** 2026-04-20 (UTC+8)
- **source:** Audit
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/31-app/`, `spec/32-ui-design/`, all 17 `99-consistency-report.md` in folders 31–36
- **status:** open
- **priority:** Medium

## Description
Audit of spec/ folders 31–36 found 5 structural / metadata issues that don't break the build but degrade hygiene reliability.

## Rationale
Hygiene drift accumulates silently and erodes trust in the spec-hygiene scripts. Future automation depends on accurate inventories.

## Proposed Change
1. Renumber `spec/31-app/03-…` → `02-…` to close the numbering gap and update inbound links.
2. Regenerate `spec/31-app/99-consistency-report.md` (remove the non-existent `02-audits/` row, fix subfolder count).
3. Add missing `> **Version:** 1.0.0` to `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md`.
4. Refresh date + add `97-acceptance-criteria.md` rows where missing across all 17 consistency reports.
5. Update subfolder reports for newly added files.

Stay within folders 18+ — folders 01–17 are READ-ONLY.

## Acceptance Criteria
- [ ] `spec/31-app/` subfolders contiguous (01, 02, 03, …).
- [ ] `spec/31-app/99-consistency-report.md` inventory matches `ls`.
- [ ] Tailwind SSOT file has Version header.
- [ ] All 17 consistency reports list `97-acceptance-criteria.md` where applicable.
- [ ] All 17 reports re-dated.

## Completion Notes
*(pending)*

## See also
`.lovable/pending-issues/01-spec-31-36-audit-findings.md`
