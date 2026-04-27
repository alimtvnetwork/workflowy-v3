# Endpoints — 09b Mirror Peer-Group (Detach + Group Ops)

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md)
> **Addendum to:** [`./09-mirrors.md`](./09-mirrors.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-MIRRORS-GROUP-GET | GET | `items/{id}/mirror-group` | user | List all peers in the same `MirrorPeerGroup` as `id` |
| EP-MIRRORS-DETACH | POST | `items/{id}/mirror-detach` | user | Remove `id` from its peer group; dissolve singleton |

> **Model shift** (per `mem://features/mirroring`): mirrors are **bidirectional peer groups**, not source/copy pairs. Every member is equal; "the canonical" is whichever member you query first. Editing any peer broadcasts to all others via SSE on `mirror-group:{groupId}`.

---

## EP-MIRRORS-GROUP-GET — GET `items/{id}/mirror-group`

- **Auth**: `user` with read on `id`.
- **Success (200)** `Results`: `{ GroupId: string, Peers: Item[], Count: number }` — `Peers` excludes `id` itself unless `IncludeSelf=true` query is set.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_NOT_MIRRORED` (item is not a member of any peer group — i.e. singleton not yet linked).
- **Side effects**: none.
- **AC refs**: `AT-APP-58`, `AT-APP-60`, `AT-APP-65`.

---

## EP-MIRRORS-DETACH — POST `items/{id}/mirror-detach`

- **Auth**: `user` with write on `id`'s parent.
- **Request body**: `{}` (no params).
- **Success (200)** `Results`: `{ Item: Item, GroupDissolved: boolean, RemainingPeerCount: number }`.
- **Behaviour**:
  - Removes `id` from `MirrorPeerGroups`. The detached item becomes a free-standing canonical Item with its current content snapshot.
  - **Singleton dissolution**: if exactly one peer remains after detach, that peer is also removed from the group and the `MirrorPeerGroups` row is hard-deleted (`GroupDissolved = true`). A peer group of one is meaningless per `mem://features/mirroring`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_NOT_MIRRORED`.
- **Side effects**:
  - Emits SSE `mirror-broken` on `mirror-group:{groupId}` to surviving peers.
  - Emits SSE `item-updated` on `item:{id}` (now standalone).
  - If `GroupDissolved = true`, emits a second `mirror-broken` for the lone surviving peer.
- **AC refs**: `AT-APP-61`, `AT-APP-63`, `AT-APP-64`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Peer-group semantics | [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md) |
| Per-instance ACLs (independent) | [`../01-features/08b-sharing-mirror-interaction.md`](../01-features/08b-sharing-mirror-interaction.md) |
| Schema | `MirrorPeerGroups` table in [`../07-db-diagram/sql/02-app-schema.sql`](../07-db-diagram/sql/02-app-schema.sql) |
| SSE event vocab | [`./14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) — `mirror-broken`, `mirror-healed` |
