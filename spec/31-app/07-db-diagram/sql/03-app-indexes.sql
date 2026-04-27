-- ============================================================================
-- WorkFlowy — App DB Indexes
-- File: 03-app-indexes.sql
-- Target: workflowy_app_{WorkspaceId}.db
-- Version: 1.0.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/31-app/07-db-diagram/06-indexes.md
--
-- Run order: AFTER 02-app-schema.sql.
-- Naming: Idx{Table}_{Column[s]} per spec/04-database-conventions/01-naming-conventions.md
-- ============================================================================

-- Item: hottest query — children-of-parent in display order
CREATE INDEX IF NOT EXISTS IdxItem_ParentItemId_FractionalIndex
    ON Item (ParentItemId, FractionalIndex);

-- Item: Today view (partial — only items with a due date)
CREATE INDEX IF NOT EXISTS IdxItem_DueDate
    ON Item (DueDate)
    WHERE DueDate IS NOT NULL;

-- Item: Trash view + reaper (partial — only soft-deleted)
CREATE INDEX IF NOT EXISTS IdxItem_DeletedAt
    ON Item (DeletedAt)
    WHERE DeletedAt IS NOT NULL;

-- Item: reverse mirror lookup (partial — only mirror placeholders)
CREATE INDEX IF NOT EXISTS IdxItem_MirrorOfItemId
    ON Item (MirrorOfItemId)
    WHERE MirrorOfItemId IS NOT NULL;

-- Item: per-owner item count + role checks (cheap, optional)
CREATE INDEX IF NOT EXISTS IdxItem_OwnerUserId
    ON Item (OwnerUserId);

-- Mirror: source -> mirrors fan-out
CREATE INDEX IF NOT EXISTS IdxMirror_SourceItemId
    ON Mirror (SourceItemId);

-- Mirror: 1:1 enforcement between Item.MirrorOfItemId and Mirror row
CREATE UNIQUE INDEX IF NOT EXISTS IdxMirror_MirrorItemId
    ON Mirror (MirrorItemId);

-- Share: list grants per item
CREATE INDEX IF NOT EXISTS IdxShare_ItemId
    ON Share (ItemId);

-- Share: "items shared with me" view (partial — accepted invites only)
CREATE INDEX IF NOT EXISTS IdxShare_GranteeUserId
    ON Share (GranteeUserId)
    WHERE GranteeUserId IS NOT NULL;

-- Share: public link resolver (UNIQUE partial)
CREATE UNIQUE INDEX IF NOT EXISTS IdxShare_PublicSlug
    ON Share (PublicSlug)
    WHERE PublicSlug IS NOT NULL;

-- ItemTag: FK indexes
CREATE INDEX IF NOT EXISTS IdxItemTag_ItemId ON ItemTag (ItemId);
CREATE INDEX IF NOT EXISTS IdxItemTag_TagId  ON ItemTag (TagId);

-- ItemTag: C6 — no duplicate tag on the same item
CREATE UNIQUE INDEX IF NOT EXISTS IdxItemTag_Item_Tag
    ON ItemTag (ItemId, TagId);

-- Comment / Attachment: per-item lookups
CREATE INDEX IF NOT EXISTS IdxComment_ItemId    ON Comment    (ItemId);
CREATE INDEX IF NOT EXISTS IdxAttachment_ItemId ON Attachment (ItemId);

-- Mention: "mentions of me" inbox
CREATE INDEX IF NOT EXISTS IdxMention_MentionedUserId
    ON Mention (MentionedUserId);

-- Favorite: sidebar render (per-user, in fractional order)
CREATE INDEX IF NOT EXISTS IdxFavorite_UserId_FractionalIndex
    ON Favorite (UserId, FractionalIndex);

-- Template: scope=mine listing
CREATE INDEX IF NOT EXISTS IdxTemplate_OwnerUserId
    ON Template (OwnerUserId);

-- ActivityLog: per-item history (recent first) + sync drain (time-ordered)
CREATE INDEX IF NOT EXISTS IdxActivityLog_ItemId_CreatedAt
    ON ActivityLog (ItemId, CreatedAt DESC);

CREATE INDEX IF NOT EXISTS IdxActivityLog_CreatedAt
    ON ActivityLog (CreatedAt);

-- SyncCursor: one cursor per user
CREATE UNIQUE INDEX IF NOT EXISTS IdxSyncCursor_UserId
    ON SyncCursor (UserId);

-- End of 03-app-indexes.sql
