-- ============================================================================
-- WorkFlowy — App DB Migration v1.0 → v2.0 (Mirror Peer-Group Model)
-- File: 07-migration-v2-mirror-peer-groups.sql
-- Target: workflowy_app_{WorkspaceId}.db (any DB still on v1.0 schema)
-- Version: 1.0.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/31-app/01-features/09b-mirror-peer-group-model.md §8
--
-- Closes: AUDIT-AI-07 (A-01 enum drift) by removing the source/target Mirror
-- model and replacing it with the bidirectional peer-group model that matches
-- Workflowy semantics.
--
-- Idempotency: this migration is destructive. Run ONCE per database. The
-- WP plugin migration runner records execution in the wp_options table.
-- ============================================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- Phase 1: Create the new tables (no-ops if 02-app-schema.sql v2.0.0 ran)
CREATE TABLE IF NOT EXISTS MirrorGroup (
    MirrorGroupId   INTEGER PRIMARY KEY AUTOINCREMENT,
    CanonicalItemId INTEGER NOT NULL,
    CreatedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (CanonicalItemId) REFERENCES Item(ItemId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MirrorMember (
    MirrorMemberId INTEGER PRIMARY KEY AUTOINCREMENT,
    MirrorGroupId  INTEGER NOT NULL,
    ItemId         INTEGER NOT NULL,
    JoinedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (MirrorGroupId) REFERENCES MirrorGroup(MirrorGroupId) ON DELETE CASCADE,
    FOREIGN KEY (ItemId)        REFERENCES Item(ItemId)               ON DELETE CASCADE,
    UNIQUE (MirrorGroupId, ItemId),
    UNIQUE (ItemId)
);

-- Phase 2: Backfill from old Mirror table (assumes Mirror table exists; v1 DB)
INSERT INTO MirrorGroup (CanonicalItemId)
SELECT DISTINCT m.SourceItemId
FROM   Mirror m
WHERE  NOT EXISTS (
    SELECT 1 FROM MirrorGroup g WHERE g.CanonicalItemId = m.SourceItemId
);

-- Source items as members
INSERT INTO MirrorMember (MirrorGroupId, ItemId)
SELECT g.MirrorGroupId, g.CanonicalItemId
FROM   MirrorGroup g
WHERE  NOT EXISTS (
    SELECT 1 FROM MirrorMember mm WHERE mm.ItemId = g.CanonicalItemId
);

-- Mirror placeholder items as members
INSERT INTO MirrorMember (MirrorGroupId, ItemId)
SELECT g.MirrorGroupId, m.MirrorItemId
FROM   Mirror      m
JOIN   MirrorGroup g ON g.CanonicalItemId = m.SourceItemId
WHERE  NOT EXISTS (
    SELECT 1 FROM MirrorMember mm WHERE mm.ItemId = m.MirrorItemId
);

-- Phase 3: Drop old structures
DROP INDEX IF EXISTS IdxMirror_SourceItemId;
DROP INDEX IF EXISTS IdxMirror_MirrorItemId;
DROP INDEX IF EXISTS IdxItem_MirrorOfItemId;
DROP TABLE IF EXISTS Mirror;
ALTER TABLE Item DROP COLUMN MirrorOfItemId;   -- requires SQLite >= 3.35

-- Phase 4: Recreate v2 indexes (no-op if 03-app-indexes.sql v2 ran)
CREATE INDEX        IF NOT EXISTS IdxMirrorMember_MirrorGroupId   ON MirrorMember (MirrorGroupId);
CREATE UNIQUE INDEX IF NOT EXISTS IdxMirrorMember_ItemId          ON MirrorMember (ItemId);
CREATE INDEX        IF NOT EXISTS IdxMirrorGroup_CanonicalItemId  ON MirrorGroup  (CanonicalItemId);

COMMIT;
PRAGMA foreign_keys = ON;

-- End of 07-migration-v2-mirror-peer-groups.sql
