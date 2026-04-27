-- ============================================================================
-- WorkFlowy — Root DB Schema
-- File: 01-root-schema.sql
-- Target: workflowy_root.db (single instance, system-wide)
-- Version: 1.0.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/31-app/07-db-diagram/02-root-db-erd.md
--
-- Run order: this file FIRST, then 05-seed-enums.sql.
-- Idempotent: every CREATE uses IF NOT EXISTS.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;

-- ----------------------------------------------------------------------------
-- Lookup: WorkspaceRoleType (Owner | Admin | Member)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS WorkspaceRoleType (
    WorkspaceRoleTypeId INTEGER PRIMARY KEY,
    Name                TEXT    NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- Lookup: RoleType (system-wide: admin | user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS RoleType (
    RoleTypeId INTEGER PRIMARY KEY,
    Name       TEXT    NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- User — identity
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS User (
    UserId       INTEGER PRIMARY KEY AUTOINCREMENT,
    Email        TEXT    NOT NULL UNIQUE,
    DisplayName  TEXT    NOT NULL,
    Timezone     TEXT    NOT NULL DEFAULT 'UTC',
    IsActive     INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    IsVerified   INTEGER NOT NULL DEFAULT 0 CHECK (IsVerified IN (0, 1)),
    CreatedAt    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    DeletedAt    TEXT    NULL
);

-- ----------------------------------------------------------------------------
-- Workspace — registry mapping WorkspaceId -> AppDbPath
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Workspace (
    WorkspaceId   INTEGER PRIMARY KEY AUTOINCREMENT,
    OwnerUserId   INTEGER NOT NULL,
    Name          TEXT    NOT NULL,
    AppDbPath     TEXT    NOT NULL UNIQUE,
    CreatedAt     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    DeletedAt     TEXT    NULL,
    FOREIGN KEY (OwnerUserId) REFERENCES User(UserId) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- WorkspaceMember — N:M between User and Workspace, with role
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS WorkspaceMember (
    WorkspaceMemberId   INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId              INTEGER NOT NULL,
    WorkspaceId         INTEGER NOT NULL,
    WorkspaceRoleTypeId INTEGER NOT NULL,
    JoinedAt            TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (UserId)              REFERENCES User(UserId)                        ON DELETE CASCADE,
    FOREIGN KEY (WorkspaceId)         REFERENCES Workspace(WorkspaceId)              ON DELETE CASCADE,
    FOREIGN KEY (WorkspaceRoleTypeId) REFERENCES WorkspaceRoleType(WorkspaceRoleTypeId) ON DELETE RESTRICT
);

-- C7: one membership row per (User, Workspace) pair
CREATE UNIQUE INDEX IF NOT EXISTS IdxWorkspaceMember_User_Workspace
    ON WorkspaceMember (UserId, WorkspaceId);

CREATE INDEX IF NOT EXISTS IdxWorkspaceMember_UserId
    ON WorkspaceMember (UserId);

CREATE INDEX IF NOT EXISTS IdxWorkspaceMember_WorkspaceId
    ON WorkspaceMember (WorkspaceId);

-- ----------------------------------------------------------------------------
-- UserRole — system-wide role assignment (e.g., admin who manages users)
-- Distinct from WorkspaceMember which is per-workspace.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS UserRole (
    UserRoleId  INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId      INTEGER NOT NULL,
    RoleTypeId  INTEGER NOT NULL,
    AssignedAt  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (UserId)     REFERENCES User(UserId)         ON DELETE CASCADE,
    FOREIGN KEY (RoleTypeId) REFERENCES RoleType(RoleTypeId) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS IdxUserRole_User_Role
    ON UserRole (UserId, RoleTypeId);

CREATE INDEX IF NOT EXISTS IdxUserRole_UserId
    ON UserRole (UserId);

-- End of 01-root-schema.sql
