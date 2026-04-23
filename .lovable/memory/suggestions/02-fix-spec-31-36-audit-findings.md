# S02 — Fix 5 Audit Findings in spec/ Folders 31–36

- **suggestionId:** S02
- **createdAt:** 2026-04-20 (UTC+8)
- **source:** Audit
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/31-app/`, `spec/32-ui-design/`, all 17 `99-consistency-report.md` in folders 31–36
- **status:** completed (2026-04-21)
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
- [x] `spec/31-app/` subfolders contiguous (01, 02, 03, 04, 05). → Renamed 03→02, 04→03, 05→04, 06→05.
- [x] `spec/31-app/99-consistency-report.md` inventory matches `ls`. → Regenerated v1.3.0, removed phantom `02-audits/` row.
- [x] Tailwind SSOT file has Version header. → Added `> **Version:** 1.0.0` to `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md`.
- [x] All 16 consistency reports list `97-acceptance-criteria.md` where applicable. → Added rows to 5 module-root reports (32, 33, 34, 35, 36); 31-app already had it.
- [x] All 16 reports re-dated to 2026-04-21.

## Completion Notes
Completed 2026-04-21. Bulk sed pass updated 38+ inbound link references across spec/ and .lovable/. Folder renames applied via code--rename. Note: count is 16 reports (not 17 from original audit) — the 17th was a counting error in the audit; all existing reports verified.

## See also
`.lovable/solved-issues/01-spec-31-36-audit-findings.md` (resolved 2026-04-23 with full Solution + Iteration Count + Learning + What NOT to Repeat)
