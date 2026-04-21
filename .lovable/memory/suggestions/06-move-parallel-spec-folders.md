# S06 — Move Parallel Spec Folders into `spec/31-app/`

- **suggestionId:** S06
- **createdAt:** 2026-04-18 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/22-app-issues/`, `spec/23-app-database/`, `spec/24-app-design-system-and-ui/` (all already removed per `spec/readme.md`, but referenced files may remain)
- **status:** open
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
- [ ] No `spec/22-…`, `spec/23-…`, `spec/24-…` folders exist.
- [ ] Inbound links resolve.
- [ ] `spec/readme.md` reflects final state.

## Completion Notes
*(pending — may be already complete; needs verification)*
