---
task: F11 — author 4 cross-feature workflow specs (reaper, search, replay, detach)
date: 2026-04-27
status: inferred-and-proceeded
---

# Ambiguity: detach AT scope (full B1 range vs. detach-only subset)

## Context
The B1 mirror peer-group batch declared 10 ATs (`AT-APP-58..67`) covering create, edit, peer-independence, detach, cycle-prevention, soft-delete-survival, reaper-coordination, LWW, and migration. The detach workflow file (`08-mirror-detach-flow.md`) needed to pick which subset to cite.

## Conflict
| View | Implication |
|------|-------------|
| **A. Cite all 10 (`AT-APP-58..67`)** | Workflow becomes a redundant alias for the entire B1 spec — duplicates content from `09b-mirror-peer-group-model.md`. |
| **B. Cite only detach-relevant ATs (`AT-APP-60, 61, 63, 64, 65`)** | Tight scope; flow file owns *only* the detach sequence; create/migrate/cycle ATs live with their own concerns. |

## Decision (inferred)
**Adopted view B**, mapping 5 `AT-WF-DETACH-NN` rows to the 5 detach-relevant `AT-APP-NN` IDs. Rationale:

1. The other 5 ATs (`AT-APP-58, 59, 62, 66, 67`) belong to flows the workflow file does not describe (peer-creation, content-edit-fanout, cycle-rejection, migration, legacy-table-readonly). Citing them would mislead readers about scope.
2. Workflow files are sequence-pinning documents, not coverage-completeness documents. The endpoint matrix already provides full coverage tracking via G-29.
3. `04-trash-restore-flow.md` set the precedent: it cites only the 6 restore-relevant ATs (`AT-APP-52..57`), not every trash-related AT.

## What the user should review
- Whether `AT-APP-58` (peer-group creation) deserves its own workflow file (`09-mirror-create-flow.md`) — currently the create sequence is implicit in `09b-mirror-peer-group-model.md` §AT-APP-58 but not pinned end-to-end.
- Whether `AT-APP-66, 67` (migration v1→v2 + legacy table read-only) deserve a migration-specific workflow file. F12 (planned next) will produce a migration *plan*; whether the *execution sequence* needs its own flow file is open.

## Implementation notes
- All 4 flow files follow the established `04-trash-restore-flow.md` template: header → why-this-file-exists → actors → preconditions → sequence (pseudo-code) → failure modes → idempotency → forbidden patterns → AT table → related.
- Open-prefix declarations for `AT-WF-{REAPER,SEARCH,REPLAY,DETACH}-NN` were added to `00-overview.md` so G-30 accepts the new flow-scoped citations without enumerating each individually (consistent with `AT-WF-{TEMPLATE,SHARE,RESTORE}-NN` precedent).
- Cross-references between flows (e.g. reaper → detach via shared dissolve trigger; search → replay via offline mode) are stated in §Related on each file.
