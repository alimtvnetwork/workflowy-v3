# S06 — Move Parallel Spec Folders into `spec/31-app/`

- **suggestionId:** S06
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/22-app-issues/`, `spec/23-app-database/`, `spec/24-app-design-system-and-ui/` (all already removed per `spec/readme.md`, but referenced files may remain)
- **status:** ✅ completed (2026-04-23 UTC+8)
- **priority:** Low

## Description
The repo's `spec/readme.md` shows folders 21–24 as removed/merged, but stragglers may still exist as parallel siblings of `spec/31-app/`. Audit and fold any remaining content into `spec/31-app/` as nested subfolders.

## Rationale
Parallel folders confuse navigation and create two homes for the same concept.

## Proposed Change
1. `ls spec/` and confirm 22/23/24 are gone.
2. If any remain, `git mv` them under `spec/31-app/`.
3. Update inbound links.

## Acceptance Criteria
- [x] No `spec/22-…`, `spec/23-…`, `spec/24-…` folders exist.
- [x] Inbound links resolve.
- [x] `spec/readme.md` reflects final state.

## Completion Notes
**2026-04-23 (UTC+8):** Verified via `ls spec/ | grep -E '^(22|23|24)-'` — no parallel folders exist. The 14 remaining inbound textual references (`spec/02-coding-guidelines/`, `spec/03-error-manage/`, `spec/05-split-db-architecture/`, `spec/06-seedable-config-architecture/`, `spec/18-spec-issues/01-audit-2026-04-18.md`) are historical mentions in audit logs and contradiction-check examples — not broken markdown links. No action required; closing as complete.
