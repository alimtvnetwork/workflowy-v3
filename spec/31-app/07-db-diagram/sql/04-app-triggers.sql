-- ============================================================================
-- WorkFlowy — App DB Triggers
-- File: 04-app-triggers.sql
-- Target: workflowy_app_{WorkspaceId}.db
-- Version: 2.0.0
-- Updated: 2026-04-27 (UTC+8) — v2.0.0 adds MirrorGroup auto-dissolve trigger
--                                (closes AUDIT-AI-07).
--
-- Run order: AFTER 03-app-indexes.sql.
-- Purpose: auto-touch UpdatedAt on every UPDATE; trash-cascade for child items
-- on parent soft-delete; auto-dissolve MirrorGroup when membership drops to 1.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Auto-touch Item.UpdatedAt on every UPDATE
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS TrgItem_TouchUpdatedAt;
CREATE TRIGGER TrgItem_TouchUpdatedAt
AFTER UPDATE ON Item
FOR EACH ROW
WHEN OLD.UpdatedAt = NEW.UpdatedAt   -- avoid recursion when caller already set it
BEGIN
    UPDATE Item
       SET UpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE ItemId = NEW.ItemId;
END;

-- ----------------------------------------------------------------------------
-- Trash-cascade: when a parent Item is soft-deleted (DeletedAt set), mark all
-- live descendants as soft-deleted too. Hard delete is handled by ON DELETE
-- CASCADE on the FK.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS TrgItem_SoftDeleteCascade;
CREATE TRIGGER TrgItem_SoftDeleteCascade
AFTER UPDATE OF DeletedAt ON Item
FOR EACH ROW
WHEN NEW.DeletedAt IS NOT NULL AND OLD.DeletedAt IS NULL
BEGIN
    UPDATE Item
       SET DeletedAt = NEW.DeletedAt
     WHERE ParentItemId = NEW.ItemId
       AND DeletedAt IS NULL;
END;

-- ----------------------------------------------------------------------------
-- Restore-cascade: when a parent Item is restored (DeletedAt cleared), restore
-- descendants that share the same DeletedAt timestamp (i.e., were taken down
-- as part of the same trash event).
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS TrgItem_RestoreCascade;
CREATE TRIGGER TrgItem_RestoreCascade
AFTER UPDATE OF DeletedAt ON Item
FOR EACH ROW
WHEN NEW.DeletedAt IS NULL AND OLD.DeletedAt IS NOT NULL
BEGIN
    UPDATE Item
       SET DeletedAt = NULL
     WHERE ParentItemId = NEW.ItemId
       AND DeletedAt = OLD.DeletedAt;
END;


-- ----------------------------------------------------------------------------
-- MirrorGroup auto-dissolve: when a group's membership drops to 1, the lone
-- remaining peer is no longer a mirror by definition (per the Workflowy
-- detach rule). Delete the group; ON DELETE CASCADE on MirrorMember removes
-- the surviving member row, and the underlying Item naturally has no
-- MirrorMember → no diamond badge.
--
-- See spec/31-app/01-features/09b-mirror-peer-group-model.md §R-3.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS TrgMirrorMember_DissolveOnSingleton;
CREATE TRIGGER TrgMirrorMember_DissolveOnSingleton
AFTER DELETE ON MirrorMember
FOR EACH ROW
WHEN (SELECT COUNT(*) FROM MirrorMember WHERE MirrorGroupId = OLD.MirrorGroupId) = 1
BEGIN
    DELETE FROM MirrorGroup WHERE MirrorGroupId = OLD.MirrorGroupId;
END;

-- End of 04-app-triggers.sql
