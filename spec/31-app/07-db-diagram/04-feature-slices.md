# 04 — Feature Slices (One ERD per Feature)

> **Version:** 2.0.0
> **Updated:** 2026-04-27 (UTC+8) — v2.0.0 replaces §4.2 with the v2 Mirror Peer-Group model (legacy `Mirror` table marked deprecated); adds `ReaperRuns` to §4.6 Trash; adds new §4.10 (Search) and §4.11 (Sync Replay) slices.
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## What this file contains

A small Mermaid ERD per feature, showing **only the tables that feature touches**. Use these slices when you only care about one feature and the master ERD is too noisy.

Every slice mirrors a file in [`../01-features/`](../01-features/00-overview.md) and [`../06-endpoints/`](../06-endpoints/00-overview.md).

---

## 4.1 — Item CRUD (mirrors `01-information-model.md`)

```mermaid
erDiagram
    Item ||--o{ Item : "parent of"
    ItemType ||--o{ Item : "classifies"
    Item ||--o{ ActivityLog : "logs"

    Item {
        INTEGER ItemId PK
        INTEGER ParentItemId FK
        SMALLINT ItemTypeId FK
        TEXT Content
        TEXT FractionalIndex
        TEXT DeletedAt "Soft-delete to Trash"
    }
    ItemType {
        SMALLINT ItemTypeId PK
        TEXT Name
    }
    ActivityLog {
        BIGINT ActivityLogId PK
        INTEGER ItemId FK
        TEXT Action
    }
```

**Endpoints**: `EP-ITEMS-LIST`, `EP-ITEMS-GET`, `EP-ITEMS-CREATE`, `EP-ITEMS-UPDATE`, `EP-ITEMS-MOVE`, `EP-ITEMS-DELETE`, `EP-ITEMS-ROOT`.

---

## 4.2 — Mirror Peer Groups (mirrors `09b-mirror-peer-group-model.md`)

> **Schema authority**: SQL uses `MirrorGroup` / `MirrorMember`. ERD docs (`03-app-db-erd.md`, `06-indexes.md`) call the same tables `MirrorPeerGroup` / `MirrorPeerGroupMember`. This slice uses the SQL names — see [`./sql/00-overview.md`](./sql/00-overview.md) §Naming Bridge.

```mermaid
erDiagram
    MirrorGroup ||--|{ MirrorMember : "has 2+ members"
    Item ||--o| MirrorMember : "is member of (≤1)"
    Item ||--o{ MirrorGroup : "is canonical of"

    MirrorGroup {
        INTEGER MirrorGroupId PK
        INTEGER CanonicalItemId FK "Item that originated the group"
        TEXT CreatedAt
    }
    MirrorMember {
        INTEGER MirrorMemberId PK
        INTEGER MirrorGroupId FK
        INTEGER ItemId FK "UNIQUE — an Item belongs to at most one group"
        TEXT JoinedAt
    }
    Item {
        INTEGER ItemId PK
    }
```

**Constraints**:
- `UNIQUE(MirrorGroupId, ItemId)` and `UNIQUE(ItemId)` on `MirrorMember` — an Item belongs to at most one peer group.
- A `MirrorGroup` MUST have ≥ 2 `MirrorMember` rows. Singleton groups are auto-dissolved by an `AFTER DELETE` trigger on `MirrorMember` (see [`../02-workflows/08-mirror-detach-flow.md`](../02-workflows/08-mirror-detach-flow.md)).
- `Item.MirrorOfItemId` and the legacy `Mirror` table are **removed** in M-117 — see [`./07-migrations.md`](./07-migrations.md) §v1→v2 Mirror Peer-Group Migration.

**Endpoints**: `EP-MIRRORS-CREATE`, `EP-MIRRORS-LIST`, `EP-MIRRORS-GROUP-GET`, `EP-MIRRORS-DETACH`.

**ATs**: `AT-APP-58..65`, `AT-WF-DETACH-01..05`.

---

## 4.3 — Tags (mirrors `01-information-model.md` §1.3)

```mermaid
erDiagram
    Item ||--o{ ItemTag : "has"
    Tag ||--o{ ItemTag : "tags"

    Item {
        INTEGER ItemId PK
    }
    Tag {
        INTEGER TagId PK
        INTEGER OwnerUserId
        TEXT Name UK
    }
    ItemTag {
        INTEGER ItemTagId PK
        INTEGER ItemId FK
        INTEGER TagId FK
    }
```

**Constraint**: `UNIQUE(ItemId, TagId)` on `ItemTag`.

**Endpoints**: `EP-ITEMS-TAGS`, `EP-BULK-TAGS`.

---

## 4.4 — Sharing (mirrors `08-share-dialog.md`)

```mermaid
erDiagram
    Item ||--o{ Share : "shared via"
    ShareRoleType ||--o{ Share : "classifies"

    Item {
        INTEGER ItemId PK
    }
    Share {
        INTEGER ShareId PK
        INTEGER ItemId FK
        INTEGER GranteeUserId "NULL until accepted"
        TEXT GranteeEmail "NULL after accepted"
        SMALLINT ShareRoleTypeId FK
        TEXT PublicSlug
        BOOLEAN IsPublic
        TEXT RevokedAt
    }
    ShareRoleType {
        SMALLINT ShareRoleTypeId PK
        TEXT Name "Viewer|Editor|Owner"
    }
```

**Constraint (C5)**: `Share.GranteeUserId XOR Share.GranteeEmail` — exactly one is non-NULL.

**Endpoints**: `EP-SHARES-LIST`, `EP-SHARES-INVITE`, `EP-SHARES-UPDATE`, `EP-SHARES-REVOKE`, `EP-SHARES-PUBLIC`.

---

## 4.5 — Roles (mirrors `15-roles-and-permissions.md`)

```mermaid
erDiagram
    User ||--o{ WorkspaceMember : "joined to"
    Workspace ||--o{ WorkspaceMember : "has members"
    WorkspaceRoleType ||--o{ WorkspaceMember : "classifies"
    User ||--o{ UserRole : "has system role"
    RoleType ||--o{ UserRole : "classifies"

    User {
        INTEGER UserId PK
    }
    Workspace {
        INTEGER WorkspaceId PK
    }
    WorkspaceMember {
        INTEGER WorkspaceMemberId PK
        INTEGER UserId FK
        INTEGER WorkspaceId FK
        SMALLINT WorkspaceRoleTypeId FK
    }
    WorkspaceRoleType {
        SMALLINT WorkspaceRoleTypeId PK
        TEXT Name
    }
    UserRole {
        INTEGER UserRoleId PK
        INTEGER UserId FK
        SMALLINT RoleTypeId FK
    }
    RoleType {
        SMALLINT RoleTypeId PK
        TEXT Name
    }
```

**All in Root DB.** `Auth::hasRole()` reads here only.

**Constraint (C4)**: at least one `WorkspaceMember` per `Workspace` with `WorkspaceRoleTypeId = Owner`.

**Endpoints**: `EP-ROLES-LIST`, `EP-ROLES-ASSIGN`, `EP-ROLES-REVOKE`.

---

## 4.6 — Trash (a query, not a table)

```mermaid
flowchart LR
    Live["Live items<br/>WHERE DeletedAt IS NULL"]
    Trash["Trash view<br/>WHERE DeletedAt IS NOT NULL<br/>AND DeletedAt &gt; date('now', '-30 days')"]
    Reaper["Daily reaper<br/>DELETE WHERE DeletedAt &lt; date('now', '-30 days')"]

    Live -->|"DELETE /items/{id}<br/>sets DeletedAt"| Trash
    Trash -->|"POST /trash/{id}/restore<br/>clears DeletedAt"| Live
    Trash -->|"30 days elapsed"| Reaper
```

**Per D5**: there is no `Trash` table. The Trash view is a query over `Item.DeletedAt`.

**Endpoints**: `EP-TRASH-LIST`, `EP-TRASH-RESTORE`, `EP-TRASH-PURGE-ONE`, `EP-TRASH-PURGE-ALL`.

---

## 4.7 — Templates (mirrors `13-templates.md`)

```mermaid
erDiagram
    Item ||--o| Template : "saved as"

    Item {
        INTEGER ItemId PK
    }
    Template {
        INTEGER TemplateId PK
        INTEGER SourceItemId FK
        INTEGER OwnerUserId
        TEXT Name
        TEXT Payload "JSON serialized subtree"
        SMALLINT NodeCount
        BOOLEAN IsWorkspaceScoped
    }
```

**Note**: applying a template inserts **new `Item` rows with new IDs** — the `Template.Payload` JSON is the schema; instantiated items are fresh rows with no FK back to the template.

**Endpoints**: `EP-TEMPLATES-LIST`, `EP-TEMPLATES-CREATE`, `EP-TEMPLATES-GET`, `EP-TEMPLATES-APPLY`, `EP-TEMPLATES-DELETE`.

---

## 4.8 — Comments + Attachments + Mentions

```mermaid
erDiagram
    Item ||--o{ Comment : "has"
    Item ||--o{ Attachment : "has"
    Item ||--o{ Mention : "contains"

    Item {
        INTEGER ItemId PK
    }
    Comment {
        INTEGER CommentId PK
        INTEGER ItemId FK
        INTEGER AuthorUserId
        TEXT Body
    }
    Attachment {
        INTEGER AttachmentId PK
        INTEGER ItemId FK
        TEXT FileName
        TEXT StoragePath
    }
    Mention {
        INTEGER MentionId PK
        INTEGER ItemId FK
        INTEGER MentionedUserId
    }
```

**Mirror inheritance**: per `01-information-model.md` §1.3, comments belong to the source item — mirrors do not have their own comment rows; they read the source's comments.

---

## 4.9 — Sync Cursor (mirrors `14-concurrency-and-sync.md`)

```mermaid
erDiagram
    SyncCursor {
        INTEGER SyncCursorId PK
        INTEGER UserId UK
        TEXT Cursor "Opaque LWW marker"
        TEXT UpdatedAt
    }
```

One row per user. Advanced by `EP-SYNC-ACK`. Used by `EP-SYNC-STREAM` (resume) and `EP-SYNC-POLL` (since-cursor query).

---

## Cross-References

| Topic | Link |
|-------|------|
| Master ERD | [`./01-master-erd.md`](./01-master-erd.md) |
| Lifecycle flows | [`./05-lifecycle-flows.md`](./05-lifecycle-flows.md) |
| Endpoints | [`../06-endpoints/00-overview.md`](../06-endpoints/00-overview.md) |
