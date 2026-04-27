# 11b — Trash Reaper: 30-Day Hard Delete (Clarification)

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Status:** Approved — 2026-04-27
> **Supersedes:** Ambiguity in `11-trash-view.md` §Retention
> **Owner:** Backend
> **Decision context:** Batch 4 clarifications, AI-readiness round 4

---

## 1. Decision

A **server-side cron job** runs daily and **hard-deletes** any item where `DeletedAt < now() - INTERVAL '30 days'`. No archive tier, no per-account configuration, no recovery after the reap.

---

## 2. Reaper specification

| Property | Value |
|---|---|
| Schedule | Daily at 03:00 UTC |
| Mechanism | Edge function `reap-trash` (cron-triggered) |
| Predicate | `Items.DeletedAt IS NOT NULL AND Items.DeletedAt < now() - INTERVAL '30 days'` |
| Action | Hard `DELETE` from `Items` (cascades via FK to children, mirror peer-group entries, permissions) |
| Batch size | 1,000 rows / iteration; loop until empty |
| Idempotency | Safe to re-run; `DELETE` is idempotent |
| Logging | Insert one row into `ReaperRuns(Id, RanAt, RowsDeleted, DurationMs)` per run |

---

## 3. Cascade rules

When `Items.Id = X` is hard-deleted:

| Affected table | Behaviour |
|---|---|
| `Items` (children of X, where X was their `ParentId`) | Cascade-deleted (`ON DELETE CASCADE`) |
| `MirrorPeerGroupMembers (ItemId = X)` | Cascade-deleted; if peer-group drops to size 1, dissolve per `09b` |
| `Permissions (ItemId = X)` | Cascade-deleted |
| `Templates.PayloadJson` containing X | Untouched (snapshot is independent per `13b`) |

---

## 4. User-facing behaviour

- **Days 0–30 in trash**: item is recoverable via Trash view → "Restore".
- **Day 30+**: item silently gone on next reaper run (≤ 24h after expiry).
- **No warning email** on imminent reap (v1 scope).
- **Manual "Empty Trash"** button still available — performs the same hard delete on demand for items the user owns, regardless of age.

---

## 5. Acceptance tests

| ID | Given | When | Then |
|---|---|---|---|
| AT-TR-01 | Item X with `DeletedAt = now() - 31d` | Reaper runs | X is gone from `Items`; row appears in `ReaperRuns` |
| AT-TR-02 | Item X with `DeletedAt = now() - 29d` | Reaper runs | X still present, still restorable |
| AT-TR-03 | Item X (deleted 31d ago) has 5 children (also `DeletedAt` set, cascade) | Reaper runs | X and all 5 children gone |
| AT-TR-04 | Item X is in peer-group {X, Y}; X reaped | Reaper runs | Y becomes standalone (group dissolves at size 1) |
| AT-TR-05 | Reaper crashes mid-batch | Next scheduled run | Picks up remaining rows; no duplicate work |

---

## 6. Future (out of scope v1)

- Configurable retention per account
- Archive tier (read-only) before hard delete
- Pre-reap warning email at T-3 days
- Admin "freeze reaper" toggle for legal hold

---

## Related

- `spec/31-app/01-features/11-trash-view.md` (parent SSOT)
- `spec/31-app/01-features/09b-mirror-peer-group-model.md` (peer-group dissolve rule)
- `spec/31-app/01-features/13b-templates-snapshot-semantics.md` (templates unaffected)
