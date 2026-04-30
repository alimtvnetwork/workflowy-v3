# Endpoints — 06 Item Context Menu

## Database Routing

**Read:** Root DB (per-user / workspace-membership scope) for capability checks (`WorkspaceMember`, role grants).
**Write:** App DB (per-workspace; one SQLite file per workspace) — `Items`, `Mirrors`, `ItemTags`, `Comments`.
**Cross-DB joins:** Forbidden. Capability resolves in Root DB; mutation executes in App DB in a separate transaction.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/06-item-context-menu.md`](../01-features/06-item-context-menu.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-ITEMS-DUPLICATE | POST | `items/{id}/duplicate` | user | Deep-copy a subtree |
| EP-ITEMS-COMPLETE | POST | `items/{id}/complete` | user | Toggle completion |
| EP-ITEMS-TURN-INTO | POST | `items/{id}/turn-into` | user | Change `ItemType` |
| EP-ITEMS-TAGS | POST | `items/{id}/tags` | user | Add/remove tags |

---

## EP-ITEMS-DUPLICATE — POST `items/{id}/duplicate`

- **Auth**: `user` with read on source + write on target parent.
- **Request body**:
  - `TargetParentId` (string, optional — defaults to source's parent)
  - `Position` (`above` | `below` | `end`, default `below`)
- **Success (201)** `Results`: `{ NewRootId, CopiedCount }`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_LIMIT_EXCEEDED` (subtree exceeds duplication cap, default 1000 nodes).
- **Side effects**: inserts a fresh subtree with **new IDs**. Mirrors are duplicated as new mirrors (still pointing at original canonical, per L6). Emits one `item-updated` (new ID) SSE per inserted node.
- **AC refs**: `AT-APP-10`.

---

## EP-ITEMS-COMPLETE — POST `items/{id}/complete`

- **Auth**: `user` with write access.
- **Request body**: `{ IsCompleted: boolean, ClientCompletedAt?: string }` where `ClientCompletedAt` is an ISO-8601 UTC timestamp captured at the moment the user clicked the checkbox on the client. It is **required when `IsCompleted: true`** to preserve user-action fidelity through offline-queue replay (the queue worker may flush the action minutes/hours after the click — see ADR-0023). When `IsCompleted: false`, `ClientCompletedAt` MUST be omitted (the server clears the column).
- **Server semantics** (normative):
  - `IsCompleted: true` → server sets `Items.IsCompleted = 1` and `Items.CompletedAt = MIN(ClientCompletedAt, ServerNow)` (clamped — never accepts future timestamps; falls back to `ServerNow` if `ClientCompletedAt` is absent or > `ServerNow + 5s` skew tolerance).
  - `IsCompleted: false` → server sets `Items.IsCompleted = 0` and `Items.CompletedAt = NULL` (uncomplete clears history; if you need to preserve prior completions for analytics, that lives in `CompletionLog` per §14.5.6 transactional-emit, not on the row).
  - `CompletedAt` is governed by §14.2 field-level LWW: a stale `ClientCompletedAt` older than the current `Items.CompletedAtUpdatedAt` is rejected with **no row change** and the existing value is returned.
- **Success (200)** `Results`: the updated `Item` (carries authoritative `IsCompleted`, `CompletedAt`, `CompletedAtUpdatedAt`, `CompletedAtUpdatedBy`).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_TIMESTAMP` (ClientCompletedAt malformed or > ServerNow + 5 s), `ERR_LWW_LOSER` (peer wrote a newer `CompletedAt`; client should refresh).
- **Side effects**: writes `IsCompleted`, `CompletedAt`, `CompletedAtUpdatedAt`, `CompletedAtUpdatedBy`. Emits exactly one SSE `item-updated` with `ChangedFields: ["IsCompleted", "CompletedAt"]` per §14.5.6 atomic-emit.
- **Forbidden**: a body shape of `{ Completed: boolean }` alone (without `ClientCompletedAt` when toggling on) — drops user-action fidelity through offline replay and is rejected by the request validator `[gate: G-EP-COMPLETE-CLIENT-TS-REQUIRED]`.
- **AC refs**: `AT-APP-11` (extend with `AT-APP-11b` covering the offline-replay timestamp-clamp path).

---

## EP-ITEMS-TURN-INTO — POST `items/{id}/turn-into`

- **Auth**: `user` with write access.
- **Request body**: `{ NewItemType: ItemType }`.
- **Rule**: server validates against the **allowed-transition matrix** in `01-features/06-item-context-menu.md`. Illegal transitions return `ERR_INVALID_TRANSITION`.
- **Success (200)** `Results`: updated `Item`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_TRANSITION`.
- **Side effects**: updates `ItemType`. May reset type-specific metadata (e.g. board columns when leaving `BoardProject`). Emits SSE `item-updated`.
- **AC refs**: `AT-APP-12`.

---

## EP-ITEMS-TAGS — POST `items/{id}/tags`

- **Auth**: `user` with write access.
- **Request body**: `{ Add?: string[], Remove?: string[] }` — both are optional but at least one is required.
- **Rule**: tag strings are lowercased, max 32 chars, `[a-z0-9-]+`.
- **Success (200)** `Results`: `{ Tags: string[] }` (canonical post-update list).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_TAG`.
- **Side effects**: updates `Items.Tags` (JSON column). Emits SSE `item-updated`.
- **AC refs**: `AT-APP-13`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Allowed-transition matrix | [`../01-features/06-item-context-menu.md`](../01-features/06-item-context-menu.md) |
| Tag rules | `mem://features/search-functionality` |
