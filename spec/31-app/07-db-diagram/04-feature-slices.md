# 04 — Feature Slices (One ERD per Feature)

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
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

## 4.2 — Mirrors (mirrors `09-mirrors.md`)

```mermaid
erDiagram
    Item ||--o{ Mirror : "is canonical source of"
    Item ||--o| Mirror : "is placeholder of"

    Item {
        INTEGER ItemId PK
        INTEGER MirrorOfItemId FK "NULL when canonical"
    }
    Mirror {
        INTEGER MirrorId PK
        INTEGER MirrorItemId FK "Placeholder Item"
        INTEGER SourceItemId FK "Canonical Item"
        TEXT BrokenAt "LWW per §14.4"
    }
```

**Constraint (D7)**: `Mirror.SourceItemId` MUST reference an `Item` whose `MirrorOfItemId IS NULL`. Enforced via DB trigger or app check.

**Endpoints**: `EP-MIRRORS-CREATE`, `EP-MIRRORS-LIST`, `EP-MIRRORS-DELETE`.

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
