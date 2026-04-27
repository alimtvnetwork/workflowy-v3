# 05 — Lifecycle Flows

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## What this file contains

`sequenceDiagram` and `stateDiagram` views of the most error-prone lifecycles. Each shows: the actor, every DB write, and every SSE event emitted. These are the diagrams an AI implementer should consult when writing the corresponding endpoint handler.

---

## 5.1 — Item Create (`EP-ITEMS-CREATE`)

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant API as WP REST Handler
    participant Auth as Auth::hasRole
    participant DB as App DB (SQLite)
    participant SSE as SSE Multiplexer

    User->>FE: Press Enter (new sibling)
    FE->>API: POST /items {ParentId, ItemType, Content}
    API->>Auth: hasRole(userId, 'Edit', 'Item', ParentId)
    Auth-->>API: true
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT INTO Item (...) RETURNING ItemId
    API->>DB: INSERT INTO ActivityLog (Action='created', ...)
    API->>DB: COMMIT
    API->>SSE: emit item.created on item:{ParentId}
    API-->>FE: 201 Created {Item}
    FE-->>User: Render new row
```

---

## 5.2 — Item Soft-Delete → Trash → Restore

```mermaid
stateDiagram-v2
    [*] --> Live : INSERT INTO Item
    Live --> Trash : DELETE /items/{id}\nUPDATE Item SET DeletedAt = now()
    Trash --> Live : POST /trash/{id}/restore\nUPDATE Item SET DeletedAt = NULL
    Trash --> HardDeleted : 30 days elapsed\nDELETE FROM Item
    Trash --> HardDeleted : DELETE /trash/{id}\nDELETE FROM Item
    HardDeleted --> [*]

    note right of Trash
        Trash is a query, not a table:
        WHERE DeletedAt IS NOT NULL
          AND DeletedAt > date('now', '-30 days')
    end note

    note right of HardDeleted
        Cascade: every Mirror with
        SourceItemId = this.ItemId
        gets BrokenAt = now() (LWW per §14.4)
    end note
```

---

## 5.3 — Mirror Create → Source Edit → Mirror Broken

```mermaid
sequenceDiagram
    actor User
    participant API as WP REST Handler
    participant DB as App DB
    participant SSE as SSE Multiplexer
    actor Other as Other Tab/User

    Note over User,DB: PHASE 1 — Create mirror
    User->>API: POST /items/{sourceId}/mirror {TargetParentId}
    API->>DB: SELECT Item WHERE ItemId = sourceId AND MirrorOfItemId IS NULL
    DB-->>API: row (canonical, OK per D7)
    API->>DB: INSERT INTO Item (MirrorOfItemId = sourceId, ...) RETURNING ItemId AS mirrorId
    API->>DB: INSERT INTO Mirror (MirrorItemId = mirrorId, SourceItemId = sourceId)
    API->>SSE: emit mirror.created on item:{sourceId} AND item:{TargetParentId}

    Note over User,Other: PHASE 2 — Source edit propagates
    Other->>API: PUT /items/{sourceId} {Content: "new"}
    API->>DB: UPDATE Item SET Content = "new" WHERE ItemId = sourceId
    API->>SSE: emit item.updated on item:{sourceId}
    SSE-->>User: SSE event item.updated
    Note right of User: Frontend re-renders the mirror row\nwith the new content

    Note over User,Other: PHASE 3 — Source hard-deleted, mirror breaks
    Other->>API: DELETE /trash/{sourceId} (purge)
    API->>DB: DELETE FROM Item WHERE ItemId = sourceId
    API->>DB: UPDATE Mirror SET BrokenAt = now() WHERE SourceItemId = sourceId
    API->>SSE: emit mirror.broken on item:{TargetParentId}
    SSE-->>User: SSE event mirror.broken
    Note right of User: Frontend renders mirror as "broken"\n(grayed-out, no content fetch)
```

---

## 5.4 — Share Invite → Accept → Use

```mermaid
sequenceDiagram
    actor Owner
    actor Invitee
    participant API as WP REST
    participant DB as App DB
    participant Mail as wp_mail

    Owner->>API: POST /items/{id}/shares {Email, Role}
    API->>DB: INSERT INTO Share (ItemId, GranteeEmail, ShareRoleTypeId, GranteeUserId=NULL)
    API->>Mail: send invite email (with accept link)
    API-->>Owner: 201 Created

    Note over Invitee: Clicks link in email, signs up / logs in
    Invitee->>API: GET /shares/accept?Token=...
    API->>DB: UPDATE Share SET GranteeUserId = Invitee.UserId, GranteeEmail = NULL WHERE ShareId = ...
    Note right of DB: Per C5: GranteeUserId XOR GranteeEmail
    API-->>Invitee: 200 OK, redirect to item

    Invitee->>API: GET /items/{id}
    API->>API: Auth::hasRole(Invitee, 'View', 'Item', id)
    Note right of API: hasRole walks Share table\nfor item-scoped grants
    API->>DB: SELECT Item WHERE ItemId = id
    API-->>Invitee: 200 OK {Item}
```

---

## 5.5 — Conflict Resolution (LWW per §14.4)

```mermaid
sequenceDiagram
    actor TabA
    actor TabB
    participant API as WP REST
    participant DB as App DB
    participant SSE as SSE

    Note over TabA,TabB: Both tabs offline-edit the same Item
    TabA->>TabA: Local edit at T=10s, Content="Hello A"
    TabB->>TabB: Local edit at T=12s, Content="Hello B"

    Note over TabA: Comes back online first
    TabA->>API: PUT /items/{id} {Content: "Hello A", ClientTs: 10}
    API->>DB: SELECT UpdatedAt FROM Item WHERE ItemId=id
    DB-->>API: UpdatedAt = T=5
    API->>DB: UPDATE Item SET Content="Hello A", UpdatedAt=now WHERE ItemId=id
    API->>SSE: emit item.updated

    Note over TabB: Comes back online second
    TabB->>API: PUT /items/{id} {Content: "Hello B", ClientTs: 12}
    API->>DB: SELECT UpdatedAt FROM Item WHERE ItemId=id
    DB-->>API: UpdatedAt = (TabA's commit time)
    Note right of API: TabB.ClientTs 12 is newer than current UpdatedAt — wins by LWW
    API->>DB: UPDATE Item SET Content="Hello B", UpdatedAt=now WHERE ItemId=id
    API->>SSE: emit item.updated
    SSE-->>TabA: SSE event item.updated → re-render with "Hello B"
```

---

## 5.6 — Sync Resume (SSE → poll fallback)

```mermaid
stateDiagram-v2
    [*] --> Connecting
    Connecting --> Streaming : GET /sync/stream succeeds
    Streaming --> Streaming : event received\n(advance Last-Event-Id)
    Streaming --> Reconnecting : connection drops
    Reconnecting --> Streaming : GET /sync/stream\nwith Last-Event-Id header
    Reconnecting --> Polling : SSE blocked by proxy
    Polling --> Polling : every 5 s\nGET /sync/poll?Since=cursor
    Polling --> Streaming : SSE recovers
    Streaming --> Acked : POST /sync/ack {Cursor}
    Acked --> Streaming : continue
```

---

## Cross-References

| Topic | Link |
|-------|------|
| Endpoint contracts | [`../06-endpoints/`](../06-endpoints/00-overview.md) |
| Conflict resolution rules | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4 |
| Trash retention | `mem://features/trash-logic` |
| Mirror semantics | [`../01-features/09-mirrors.md`](../01-features/09-mirrors.md) |
| ← Per-feature slices reference these lifecycles (forward link from) | [`./04-feature-slices.md`](./04-feature-slices.md) |
