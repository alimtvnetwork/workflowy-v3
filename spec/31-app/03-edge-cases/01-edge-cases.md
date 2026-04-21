# Edge Cases

> **Version:** 1.2.0
> **Updated:** 2026-04-19

---

| Scenario | Expected Behavior |
|----------|-------------------|
| Move item into its own child/descendant | MUST block with error toast: "Cannot move item into its own children." |
| Delete item that has mirrors | MUST show warning dialog: "This item has X mirrors. Deleting will break those references." Options: "Delete anyway" or "Cancel". Mirrors become broken references with recovery options (convert to independent item or delete the mirror). |
| Share item with children | Sharing MUST cascade to all descendants automatically. |
| Exceed free tier limit (250 items) | MUST block new item creation. Toast: "Item limit reached. Upgrade to Pro for unlimited items." with an upgrade button. |
| Very deep nesting (20+ levels) | MUST have a performance guard — virtualize rendering. Only render visible items plus a small buffer. Indent is visually capped at 20 levels. |
| Concurrent edits on shared items | Field-level Last-Write-Wins per [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md). Loser sees "Restored remote change" banner with 5 s Undo. |
| Concurrent edits at identical server ms | Tie-break by higher `userId`; deterministic. See `14-concurrency-and-sync.md` §14.2. |
| Client clock skew (browser ahead/behind server) | Server clock is the only authoritative timestamp source; client clock is logged but ignored. |
| Offline edit replays after a newer remote edit | Queued edit re-stamped at reconnect time; LWW re-evaluates — newest wins. Loser sees banner. |
| Edit on an item just deleted by another user | Reject with toast "Item was deleted by {user}; restore from Trash to keep editing". |
| Server clock jumps backward (NTP correction) | `Item.<field>UpdatedAt` is monotonic per row via `GREATEST(existing+1, serverNow)`; prevents lost-update. |
| Concurrent move (parent A vs parent B) on same item | Each field LWW resolves independently — final state may be split (`parentId=A, sortKey=B's`); acceptable per field-level guarantee. |
| Stale tab submits an edit after 30 min without realtime | Server LWW evaluates against latest row; banner shows missed remote update. |
| Paste large text (100+ lines) | Auto-split into individual items by newlines. Show progress: "Creating X items…" |
| Paste a URL | Auto-detect and make it a clickable link. |
| Empty content area (brand new user) | Show onboarding hint: "Start typing to create your first item" with a subtle animation. |
| Network disconnect | Show a persistent banner: "You're offline. Changes will sync when reconnected." Banner in warning/amber color. |
| Session expired | Redirect to login page. Preserve any unsaved changes locally. After re-login, prompt: "Restore unsaved changes?" |
| Drag-and-drop onto itself | Do nothing — no visual change, no error. |
| Create mirror of a mirror | Should mirror the canonical source item, not create a nested mirror chain. |
| Delete the only column in board view | Switch back to list view automatically. |
| Board view with 0 grandchildren in a column | Column appears empty with just the "+ Add card" button. |

---
