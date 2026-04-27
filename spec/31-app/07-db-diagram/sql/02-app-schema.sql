-- ============================================================================
-- WorkFlowy — App DB Schema (per workspace)
-- File: 02-app-schema.sql
-- Target: workflowy_app_{WorkspaceId}.db (one per workspace)
-- Version: 2.0.0
-- Updated: 2026-04-27 (UTC+8) — v2.0.0 replaces source/target Mirror schema with peer-group
--                                model per spec/31-app/01-features/09b-mirror-peer-group-model.md
--                                (closes AUDIT-AI-07).
-- Authority: spec/31-app/07-db-diagram/03-app-db-erd.md
--
-- Run order: this file FIRST, then 03-app-indexes.sql, then 04-app-triggers.sql,
-- then 05-seed-enums.sql.
--
-- Logical FKs to Root DB (User.UserId) are documented but NOT enforceable —
-- SQLite cannot foreign-key across files. Validate at the PHP layer.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;

-- ----------------------------------------------------------------------------
-- Lookup: ItemType (12 unified types — see spec/20-enums-index.md §2)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ItemType (
    ItemTypeId INTEGER PRIMARY KEY,
    Name       TEXT    NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- Lookup: ShareRoleType (Viewer | Editor | Owner)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ShareRoleType (
    ShareRoleTypeId INTEGER PRIMARY KEY,
    Name            TEXT    NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- Item — the unified Node (every bullet, board, attachment, etc.)
-- Self-recursive via ParentItemId. Mirror peering is modelled separately
-- via MirrorGroup + MirrorMember (see spec/31-app/01-features/09b-mirror-peer-group-model.md).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Item (
    ItemId           INTEGER PRIMARY KEY AUTOINCREMENT,
    ParentItemId     INTEGER NULL,
    OwnerUserId      INTEGER NOT NULL,                    -- Logical FK to Root.User.UserId
    ItemTypeId       INTEGER NOT NULL,                    -- Never 'mirror'; mirror is a relation, not a type
    Content          TEXT    NOT NULL DEFAULT '',         -- For peers: empty; reads through canonical
    FractionalIndex  TEXT    NOT NULL,                    -- Per-instance even for mirror peers
    DueDate          TEXT    NULL,                        -- ISO date 'YYYY-MM-DD'
    CompletedAt      TEXT    NULL,                        -- NULL = open
    IsCollapsed      INTEGER NOT NULL DEFAULT 0 CHECK (IsCollapsed IN (0, 1)),  -- Per-instance
    CreatedAt        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UpdatedAt        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    DeletedAt        TEXT    NULL,                        -- NULL = live; NOT NULL = trashed
    FOREIGN KEY (ParentItemId) REFERENCES Item(ItemId)         ON DELETE CASCADE,
    FOREIGN KEY (ItemTypeId)   REFERENCES ItemType(ItemTypeId) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- MirrorGroup — one row per logical mirror peer-group (v2.0.0 model).
-- See spec/31-app/01-features/09b-mirror-peer-group-model.md §4 for full SSOT.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS MirrorGroup (
    MirrorGroupId   INTEGER PRIMARY KEY AUTOINCREMENT,
    CanonicalItemId INTEGER NOT NULL,                     -- The peer that owns content rows; convention: lowest ItemId
    CreatedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (CanonicalItemId) REFERENCES Item(ItemId) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- MirrorMember — peer membership. Each Item can be in at most one group.
-- Group dissolves automatically when size drops to 1 (see 04-app-triggers.sql).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS MirrorMember (
    MirrorMemberId INTEGER PRIMARY KEY AUTOINCREMENT,
    MirrorGroupId  INTEGER NOT NULL,
    ItemId         INTEGER NOT NULL,
    JoinedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (MirrorGroupId) REFERENCES MirrorGroup(MirrorGroupId) ON DELETE CASCADE,
    FOREIGN KEY (ItemId)        REFERENCES Item(ItemId)               ON DELETE CASCADE,
    UNIQUE (MirrorGroupId, ItemId),
    UNIQUE (ItemId)                                       -- An Item belongs to at most one group
);

-- ----------------------------------------------------------------------------
-- Tag + ItemTag (N:M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Tag (
    TagId       INTEGER PRIMARY KEY AUTOINCREMENT,
    OwnerUserId INTEGER NOT NULL,                         -- Logical FK to Root.User.UserId
    Name        TEXT    NOT NULL,
    CreatedAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (OwnerUserId, Name)
);

CREATE TABLE IF NOT EXISTS ItemTag (
    ItemTagId INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId    INTEGER NOT NULL,
    TagId     INTEGER NOT NULL,
    FOREIGN KEY (ItemId) REFERENCES Item(ItemId) ON DELETE CASCADE,
    FOREIGN KEY (TagId)  REFERENCES Tag(TagId)   ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Share — per-item grant; either GranteeUserId or GranteeEmail OR PublicSlug
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Share (
    ShareId         INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId          INTEGER NOT NULL,
    GranteeUserId   INTEGER NULL,                         -- Logical FK to Root.User.UserId; NULL until accept
    GranteeEmail    TEXT    NULL,                         -- NULL after accepted
    ShareRoleTypeId INTEGER NOT NULL,
    PublicSlug      TEXT    NULL,
    IsPublic        INTEGER NOT NULL DEFAULT 0 CHECK (IsPublic IN (0, 1)),
    CreatedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    RevokedAt       TEXT    NULL,
    FOREIGN KEY (ItemId)          REFERENCES Item(ItemId)                   ON DELETE CASCADE,
    FOREIGN KEY (ShareRoleTypeId) REFERENCES ShareRoleType(ShareRoleTypeId) ON DELETE RESTRICT,
    CHECK (GranteeUserId IS NOT NULL OR GranteeEmail IS NOT NULL OR PublicSlug IS NOT NULL)
);

-- ----------------------------------------------------------------------------
-- Comment
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Comment (
    CommentId    INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId       INTEGER NOT NULL,
    AuthorUserId INTEGER NOT NULL,                        -- Logical FK to Root.User.UserId
    Body         TEXT    NOT NULL,
    CreatedAt    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    DeletedAt    TEXT    NULL,
    FOREIGN KEY (ItemId) REFERENCES Item(ItemId) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Attachment
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Attachment (
    AttachmentId   INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId         INTEGER NOT NULL,
    UploaderUserId INTEGER NOT NULL,                      -- Logical FK to Root.User.UserId
    FileName       TEXT    NOT NULL,
    MimeType       TEXT    NOT NULL,
    ByteCount      INTEGER NOT NULL CHECK (ByteCount >= 0),
    StoragePath    TEXT    NOT NULL,
    CreatedAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ItemId) REFERENCES Item(ItemId) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Mention (@user references inside Item.Content)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Mention (
    MentionId         INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId            INTEGER NOT NULL,
    MentionedUserId   INTEGER NOT NULL,                   -- Logical FK to Root.User.UserId
    FOREIGN KEY (ItemId) REFERENCES Item(ItemId) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Favorite (per-user sidebar bookmarks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Favorite (
    FavoriteId      INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId          INTEGER NOT NULL,
    UserId          INTEGER NOT NULL,                     -- Logical FK to Root.User.UserId
    FractionalIndex TEXT    NOT NULL,
    CreatedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ItemId) REFERENCES Item(ItemId) ON DELETE CASCADE,
    UNIQUE (UserId, ItemId)
);

-- ----------------------------------------------------------------------------
-- Template (serialised subtree snapshots)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Template (
    TemplateId         INTEGER PRIMARY KEY AUTOINCREMENT,
    SourceItemId       INTEGER NULL,                      -- NULL once source is hard-deleted
    OwnerUserId        INTEGER NOT NULL,                  -- Logical FK to Root.User.UserId
    Name               TEXT    NOT NULL,
    Description        TEXT    NULL,
    Payload            TEXT    NOT NULL,                  -- JSON serialised subtree
    NodeCount          INTEGER NOT NULL CHECK (NodeCount >= 0),
    IsWorkspaceScoped  INTEGER NOT NULL DEFAULT 0 CHECK (IsWorkspaceScoped IN (0, 1)),
    CreatedAt          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (SourceItemId) REFERENCES Item(ItemId) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- ActivityLog (per-item audit trail; also drained by EP-SYNC-POLL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ActivityLog (
    ActivityLogId INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId        INTEGER NULL,                           -- NULL for workspace-level events
    ActorUserId   INTEGER NOT NULL,                       -- Logical FK to Root.User.UserId
    Action        TEXT    NOT NULL,                       -- e.g. 'item.create', 'item.move'
    PayloadJson   TEXT    NULL,
    CreatedAt     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ItemId) REFERENCES Item(ItemId) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- SyncCursor (per-user cursor for EP-SYNC-POLL / EP-SYNC-STREAM)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SyncCursor (
    SyncCursorId INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId       INTEGER NOT NULL UNIQUE,                 -- Logical FK to Root.User.UserId
    Cursor       TEXT    NOT NULL,
    UpdatedAt    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- End of 02-app-schema.sql
