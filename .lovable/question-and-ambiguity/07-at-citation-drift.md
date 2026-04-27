---
task: F9 — fix wrong AT citations in F4/F6 endpoint files
date: 2026-04-27
status: inferred-and-proceeded
---

# Ambiguity: F4/F6 cited AT IDs that didn't match the canonical registry

## Context
Task #6 ambiguity flagged a speculative `AT-TRASH-07` citation that turned out to clash with a real existing AT (`AT-TRASH-07 = "User clicks Cancel; dialog closes"`). Investigating revealed a **larger drift**: the four endpoint files I created in F6 cited `AT-APP-` IDs that were off by 3–10 from the canonical registry in `spec/31-app/97-acceptance-criteria.md` v2.6.0.

## What was wrong (citation → actual)

| Endpoint file | Cited (F6) | Canonical (97-acceptance-criteria.md v2.6.0) |
|---------------|-----------|----------------------------------------------|
| `11b-trash-reaper.md` EP-REAPER-RUN | `AT-APP-78,79,80` | `AT-APP-81,82,83,84` (78–80 actually belong to Sharing×Mirror) |
| `11b-trash-reaper.md` EP-REAPER-RUNS-LIST | `AT-APP-81` | `AT-APP-85` |
| `14b-sync-replay.md` EP-SYNC-REPLAY | `AT-APP-90..94` | `AT-APP-97..102` (90–94 belong to Multi-select Zoom) |
| `15-search.md` EP-SEARCH-QUERY | `AT-APP-100..103` | `AT-APP-103..107` |
| `09b-mirror-peer-group.md` EP-MIRRORS-GROUP-GET | `AT-MGP-58,59` (invented) | `AT-APP-58,60,65` |
| `09b-mirror-peer-group.md` EP-MIRRORS-DETACH | `AT-MGP-60,61,62` (invented) | `AT-APP-61,63,64` |
| Matrix EP-TRASH-PURGE-ALL | `AT-APP-24, AT-TRASH-07` (wrong: 24=mirror canonical; 07=cancel-dialog) | `AT-APP-19, AT-TRASH-08, AT-TRASH-09` |

## Root cause
In F4/F6 I wrote new endpoint files BEFORE confirming the actual numbers in the canonical registry. The F2 task summary correctly recorded the ranges (`AT-APP-58..107`) but I substituted plausible-looking off-by-N values when writing endpoint specs.

## Decision (inferred)
1. Fixed all 7 wrong citations in 4 endpoint files + 5 matrix rows to match the canonical registry.
2. For `EP-TRASH-PURGE-ALL` used `AT-APP-19` (30-day purge), `AT-TRASH-08` (empty-trash dialog), `AT-TRASH-09` (empty-trash confirm-yes) which actually describe the empty-trash hard-delete behaviour.
3. Kept `AT-MGP-NN` IDs as legitimate **per-feature** aliases inside `01-features/09b-mirror-peer-group-model.md` (those are scoped local IDs, not the canonical AT-APP namespace).
4. Did NOT add the previously-suggested `AT-TRASH-07` re-registration (the speculative ID would have collided with the existing cancel-dialog test).

## What the user should review
- Whether the `AT-MGP-` per-feature ID space and the `AT-APP-58..67` canonical aliases should be unified into one (currently both exist; the registry's `(was \`AT-MGP-NN\`)` markers track the alias).
- Whether to add a hygiene gate (G-30?) that validates every cited `AT-*` in endpoint files exists in the canonical `97-acceptance-criteria.md` registry — would have caught this in seconds.
