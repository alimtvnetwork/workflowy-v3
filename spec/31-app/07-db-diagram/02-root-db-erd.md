# 02 — Root DB ERD

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **DB file:** `workflowy_root.db` (single instance, system-wide)

---

## What this diagram shows

The **identity + workspace registry** layer. This DB is the **only place** authentication and workspace membership live. `Auth::hasRole()` reads from this DB.

---

## Diagram

```mermaid
erDiagram
    User ||--o{ WorkspaceMember : "joined to"
    Workspace ||--o{ WorkspaceMember : "has members"
    WorkspaceRoleType ||--o{ WorkspaceMember : "classifies"
    User ||--o{ UserRole : "has system roles"
    RoleType ||--o{ UserRole : "classifies"
    User ||--|| Workspace : "owns (1+)"

    User {
        INTEGER UserId PK
        TEXT Email UK
        TEXT DisplayName
        TEXT Timezone "IANA TZ for Today view"
        BOOLEAN IsActive
        BOOLEAN IsVerified
        TEXT CreatedAt
        TEXT DeletedAt
    }

    Workspace {
        INTEGER WorkspaceId PK
        INTEGER OwnerUserId FK
        TEXT Name
        TEXT AppDbPath "Relative path to App DB file"
        TEXT CreatedAt
        TEXT DeletedAt
    }

    WorkspaceMember {
        INTEGER WorkspaceMemberId PK
        INTEGER UserId FK
        INTEGER WorkspaceId FK
        SMALLINT WorkspaceRoleTypeId FK
        TEXT JoinedAt
    }

    WorkspaceRoleType {
        SMALLINT WorkspaceRoleTypeId PK
        TEXT Name "Owner|Admin|Member"
    }

    UserRole {
        INTEGER UserRoleId PK
        INTEGER UserId FK
        SMALLINT RoleTypeId FK
        TEXT AssignedAt
    }

    RoleType {
        SMALLINT RoleTypeId PK
        TEXT Name "admin|user"
    }
```

---

## Why these tables live here

| Table | Why Root (not App) |
|-------|--------------------|
| `User` | Identity must be queryable independently of any workspace; SSO / login happens before a workspace is selected. |
| `Workspace` | The registry that maps `WorkspaceId → AppDbPath`; needed before any App DB connection is opened. |
| `WorkspaceMember` | `Auth::hasRole()` MUST be answerable without opening an App DB (otherwise an unauthorized user could trigger a DB open). |
| `WorkspaceRoleType` / `RoleType` | Lookup tables that the auth helper joins against. |
| `UserRole` | System-wide role (e.g. `admin` who can manage other users), separate from workspace roles per L8. |

---

## Forbidden in Root DB

- Item content (lives in App DB).
- Comments, attachments, tags (live in App DB).
- Activity log (per-workspace audit trail lives in App DB).
- Search index (per-workspace, lives in App DB or sidecar).

---

## Cross-References

| Topic | Link |
|-------|------|
| Split DB rationale | [`../../05-split-db-architecture/00-overview.md`](../../05-split-db-architecture/00-overview.md) |
| Auth helper contract | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) §PHP Authorization Helper Contract |
| `EP-ME` reads from this DB | [`../06-endpoints/02-personas.md`](../06-endpoints/02-personas.md) |
| ← Master ERD aggregator (forward link from) | [`./01-master-erd.md`](./01-master-erd.md) |
