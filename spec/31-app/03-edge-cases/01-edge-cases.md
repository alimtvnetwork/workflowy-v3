# Edge Cases

> **Version:** 2.0.0
> **Updated:** 2026-04-26 (UTC+8) — APP-FIX-13 (final): split into User Input / System / Cross-Feature buckets per F-11. Closes audit F-11.
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Status:** Canonical edge-case index for the App domain

---

## How this file is organized (normative)

> **Why the split:** Without categorization, AI implementers conflate validation logic ("paste-bomb") with infrastructure resilience ("network drop") and end up handling them in the same code path. Each category below maps to a distinct *layer* of the implementation; mixing them is a code smell.
>
> **Three categories:**
>
> 1. **§1 User Input edges** — bounded by what a user can *type, paste, drag, or click*. Belong in the **input/form/editor layer** (sanitizers, validators, DOM event handlers).
> 2. **§2 System edges** — bounded by what the *runtime, network, clock, or storage* can do unexpectedly. Belong in the **infra layer** (retry/backoff, LWW, SSE fallback, quota enforcement).
> 3. **§3 Cross-feature behavioral edges** — bounded by *interaction between two or more features*. Belong in the **feature handlers** themselves (mirror+delete, share+cascade, board+empty-column).
>
> Each row carries a `Layer` column making the placement unambiguous.

---

## §1 User Input edges

> Triggered by direct user action; resolved before any DB write.

| # | Scenario | Expected Behavior | Layer |
|---|----------|-------------------|-------|
| U1 | Paste large text (100+ lines) | Auto-split into individual items by newlines. Show progress: "Creating X items…" | Editor / paste handler |
| U2 | Paste a URL | Auto-detect and make it a clickable link. | Editor / paste handler |
| U3 | Empty content area (brand-new user) | Show onboarding hint: "Start typing to create your first item" with a subtle animation. | Empty-state component |
| U4 | Drag-and-drop onto itself | Do nothing — no visual change, no error. | DnD handler |
| U5 | Move item into its own child/descendant | MUST block with error toast: "Cannot move item into its own children." | Move-validation guard |
| U6 | Exceed free-tier limit (250 items) | MUST block new item creation. Toast: "Item limit reached. Upgrade to Pro for unlimited items." with an upgrade button. | Quota guard (pre-write) |
| U7 | Very deep nesting (20+ levels) | MUST have a performance guard — virtualize rendering. Only render visible items plus a small buffer. Indent is visually capped at 20 levels. | Tree renderer |

---

## §2 System edges

> Triggered by infrastructure conditions outside user control; resolved by the LWW algorithm, SSE fallback, or storage layer. SSOT for most rows: [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md).

| # | Scenario | Expected Behavior | Layer |
|---|----------|-------------------|-------|
| S1 | Concurrent edits on shared items | Field-level Last-Write-Wins per [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md). Loser sees "Restored remote change" banner with 5 s Undo. | Concurrency / LWW |
| S2 | Concurrent edits at identical server ms | Tie-break by higher `userId`; deterministic. See `14-concurrency-and-sync.md` §14.2. | Concurrency / LWW |
| S3 | Client clock skew (browser ahead/behind server) | Server clock is the only authoritative timestamp source; client clock is logged but ignored. | Sync layer |
| S4 | Offline edit replays after a newer remote edit | Queued edit re-stamped at reconnect time; LWW re-evaluates — newest wins. Loser sees banner. | Offline queue + LWW |
| S5 | Server clock jumps backward (NTP correction) | `Item.<field>UpdatedAt` is monotonic per row via `GREATEST(existing+1, serverNow)`; prevents lost-update. | Server timestamp helper |
| S6 | Concurrent move (parent A vs parent B) on same item | Each field LWW resolves independently — final state may be split (`parentId=A, sortKey=B's`); acceptable per field-level guarantee. | Concurrency / LWW |
| S7 | Stale tab submits an edit after 30 min without realtime | Server LWW evaluates against latest row; banner shows missed remote update. | Concurrency / LWW |
| S8 | Network disconnect | Show a persistent banner: "You're offline. Changes will sync when reconnected." Banner in warning/amber color. | Connectivity indicator |
| S9 | Session expired | Redirect to login page. Preserve any unsaved changes locally. After re-login, prompt: "Restore unsaved changes?" | Auth middleware + local cache |
| S10 | SSE channel drops | Fall back to 5 s poll of `/api/sync?since={ServerTs}` per [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.1. WebSockets / Pusher / Supabase Realtime are forbidden. | Realtime transport |

---

## §3 Cross-feature behavioral edges

> Triggered by interaction between two or more features. Each row cites the feature SSOTs that own the underlying rules; the resolution lives in the *handler* for the action, not in a shared utility.

| # | Scenario | Expected Behavior | Owning features |
|---|----------|-------------------|-----------------|
| X1 | Delete item that has mirrors | MUST show warning dialog: "This item has X mirrors. Deleting will break those references." Options: "Delete anyway" or "Cancel". Mirrors become broken references with recovery options (convert to independent item or delete the mirror). On delete, `Mirrors.BrokenAt` is set per LWW (see [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4). | `06-item-context-menu.md` + `09-mirrors.md` + `11-trash-view.md` + `14-concurrency-and-sync.md` §14.4 |
| X2 | Share item with children | Sharing MUST cascade to all descendants automatically (`AT-APP-25`). | `08-share-dialog.md` + `01-information-model.md` §1.3 |
| X3 | Edit on an item just deleted by another user | Reject with toast "Item was deleted by {user}; restore from Trash to keep editing". | `11-trash-view.md` + `14-concurrency-and-sync.md` |
| X4 | Create mirror of a mirror | Should mirror the canonical source item, not create a nested mirror chain (`AT-APP-24`). | `09-mirrors.md` |
| X5 | Delete the only column in board view | Switch back to list view automatically. | `07-board-view.md` + `03-layout-structure.md` |
| X6 | Board view with 0 grandchildren in a column | Column appears empty with just the "+ Add card" button. | `07-board-view.md` |
| X7 | Restore item whose parent is still trashed | 422 with `blockingAncestorId`; client offers "Restore parent first?" — full sequence in [`02-workflows/04-trash-restore-flow.md`](../02-workflows/04-trash-restore-flow.md). | `11-trash-view.md` + `04-trash-restore-flow.md` |

---

## Routing rule (for AI implementers)

When asked to handle an edge case, classify it FIRST:

1. **Can the user trigger it by typing, pasting, dragging, or clicking — and only that?** → §1 User Input. Handle in the editor/form/DnD handler. Do NOT touch the LWW algorithm.
2. **Is it caused by network, clock, storage, or concurrent activity?** → §2 System. Handle through the LWW algorithm, SSE fallback, or quota enforcer. Do NOT inline ad-hoc retries in feature handlers.
3. **Does it require coordination between two feature files?** → §3 Cross-feature. Handle in the *action handler* of the feature that initiates the action, calling helpers from the other feature. Cite both SSOTs in code comments.

> **Forbidden:** treating a §2 row as a §1 row by adding a "validation" check for it. Network drops are not user-input errors.

---

## Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-19 | 1.2.0 | Flat table of 22 edge cases |
| 2026-04-26 | 2.0.0 | **APP-FIX-13 (final).** Split into §1 User Input (7 rows), §2 System (10 rows), §3 Cross-feature (7 rows); added Layer column + Routing rule. Closes audit F-11. All 13 APP-FIX phases now done. |
