# Write Memory — Session Persistence Protocol

> **Version:** 1.0
> **Updated:** 2026-04-20
> **Trigger phrases:** `write memory`, `end memory`, `update memory`, `next` (when ending a session)

> **Purpose:** After completing work or at the end of a session, the AI must persist everything it learned, did, and left undone — so the next AI session can pick up seamlessly with zero context loss.

---

## Core Principle

The memory system is the project's brain. If you did something and didn't write it down, it didn't happen. Write memory as if the next AI has amnesia — because it does.

---

## Phase 1 — Audit Current State

Before writing anything, take inventory:

**Done this session:**
- Every task completed (features, fixes, refactors)
- Every file created, modified, or deleted
- Every decision made and why

**Pending:**
- Tasks started but not finished
- Tasks discussed but not started
- Blockers / dependencies

**Learned:**
- New patterns or conventions
- Gotchas / edge cases
- User preferences (explicit or implicit)

**Went wrong:**
- Bugs and root causes
- Failed approaches
- Things that should never be repeated

---

## Phase 2 — Update Memory Files

Target: `mem://` (virtual memory namespace; the on-disk `.lovable/memory/` folder is legacy/orphan content pending Task T sweep).

1. Read `mem://index.md` first — never duplicate.
2. Update existing memory files in place — preserve all existing content; never truncate unrelated entries.
3. Create new memory files only if knowledge doesn't fit any existing file. Naming: `mem://{type}/{descriptive-name}` (lowercase, hyphenated; type ∈ design|constraint|preference|feature|reference|architecture|features|docs|preferences).
4. **Immediately** update `mem://index.md` when adding/removing a file.

### Workflow state

Target: `.lovable/memory/workflow/`

| Status | Marker |
|--------|--------|
| Done | ✅ Done |
| In Progress | 🔄 In Progress |
| Pending | ⏳ Pending |
| Blocked | 🚫 Blocked — [reason] |
| Avoid / Skip | 🚫 Avoid — [reason] |

---

## Phase 3 — Update Plans & Suggestions

### 3A — Plans
Target: `.lovable/plan.md` (single file)
- Update task statuses
- Add new tasks discovered this session
- Move fully-complete items to `## Completed` section at bottom of same file (do not delete)

### 3B — Suggestions
Target: `.lovable/suggestions.md` (single file)

```markdown
## Active Suggestions
### [Title]
- **Status:** Pending | In Review | Approved | Rejected
- **Priority:** High | Medium | Low
- **Description:**
- **Added:** [date]

## Implemented Suggestions
### [Title]
- **Implemented:** [date]
- **Notes:**
```

When implemented: move from Active → Implemented, add notes, reference commit/file.

---

## Phase 4 — Update Issues

### 4A — Pending Issues
Target: `.lovable/pending-issues/xx-short-description.md`

```markdown
# [Issue Title]
## Description
## Root Cause
## Steps to Reproduce
## Attempted Solutions
## Priority
## Blocked By
```

### 4B — Solved Issues
Target: `.lovable/solved-issues/xx-short-description.md`

When resolved, move from `pending-issues/` and append:

```markdown
## Solution
## Iteration Count
## Learning
## What NOT to Repeat
```

### 4C — Strictly Avoided Patterns
Target: `.lovable/strictly-avoid.md`

```markdown
- **[Pattern Name]:** [Why forbidden]. See: `.lovable/solved-issues/xx-filename.md`
```

Any task the user said to **skip or avoid** must be added here.

---

## Phase 5 — Consistency Validation

1. **Index integrity** — every file in `.lovable/memory/` listed in `index.md`.
2. **Cross-reference** — every `✅ Done` plan item has evidence; every actionable pending issue is reflected in `plan.md` or `suggestions.md`.
3. **Orphan check** — no memory file without index entry; no implemented suggestion without code evidence; no solved issue without `## Solution`.
4. **Final confirmation** — respond with the session summary block (see below).

### Final confirmation format

```
✅ Memory update complete.

Session Summary:
- Tasks completed: [X]
- Tasks pending: [Y]
- New memory files created: [Z]
- Issues resolved: [N]
- Issues opened: [M]
- Suggestions added: [S]
- Suggestions implemented: [T]

Files modified:
- [list]

Inconsistencies found and fixed:
- [list or "None"]

The next AI session can pick up from: [current state + next logical step]
```

---

## File Naming & Structure Rules

| Rule | Example |
|------|---------|
| Numeric prefix | `01-auth-flow.md` |
| Lowercase + hyphen | `03-error-handling.md` ✅ / `03_Error_Handling.md` ❌ |
| Plans → single file | `.lovable/plan.md` |
| Suggestions → single file | `.lovable/suggestions.md` |
| Pending issues → one file each | `.lovable/pending-issues/01-name.md` |
| Solved issues → one file each | `.lovable/solved-issues/01-name.md` |
| Memory grouped by topic | `.lovable/memory/workflow/`, etc. |
| Completed work → `## Completed` section in same file | Never spawn `completed/` folders |

### Folder structure

```
.lovable/
├── overview.md
├── strictly-avoid.md
├── user-preferences
├── plan.md
├── suggestions.md
├── prompt.md                    # Index of prompts
├── prompts/                     # Reusable prompts
├── memory/
│   ├── index.md
│   ├── workflow/
│   ├── docs/
│   ├── issues/
│   └── suggestions/
├── pending-issues/
└── solved-issues/
```

> ⚠️ **NEVER** create `.lovable/memories/` (with trailing `s`). Canonical path is `.lovable/memory/`.

---

## Anti-Corruption Rules

1. **Never delete history** — mark done; move to completed sections.
2. **Never overwrite blindly** — read before writing.
3. **Never leave orphans** — every file indexed; every reference resolves.
4. **Never split what should be unified** — plans and suggestions live in ONE file each.
5. **Never mix states** — an issue cannot be both pending and solved.
6. **Never skip the index update** — same operation as the file create.
7. **Never assume the next AI knows anything** — write for a stranger.

---

## Scope Lock (Project-Specific)

- Editable spec scope: folders **18 and above** only (`18-spec-issues/`, `31-app/`, `32-ui-design/`, `33-feedback-report/`, `34-activity-feed/`, `35-enforcement-rules/`, `36-user-management/`, plus root files `19-glossary.md`, `20-enums-index.md`, `21-ai-readiness-audit-round-2.md`, `99-consistency-report.md`, `spec-index.md`).
- Folders **01–17** are READ-ONLY. Never run hygiene/auto-TOC scripts that touch them.
- Task **R3-1** (400-line cap split) is **VOID** — do not resume or suggest it.

---

*Stay in sync with `.lovable/prompts/01-read-memory-prompt.md` (AI Onboarding Protocol).*
