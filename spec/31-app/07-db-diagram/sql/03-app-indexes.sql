-- ============================================================================
-- WorkFlowy — App DB Indexes
-- File: 03-app-indexes.sql
-- Target: workflowy_app_{WorkspaceId}.db
-- Version: 2.1.0
-- Updated: 2026-04-27 (UTC+8) — v2.1.0 added IdxItem_UpdatedAt (B3/14b LWW),
--                                IdxItem_LiveByUpdatedAt partial (B3/16 search ranking
--                                AT-APP-104/106), IdxReaperRuns_RanAt (B4/11b).
--                                Optional FTS5 mirror added as commented template.
--                                v2.0.0 replaced Item.MirrorOfItemId / Mirror table
--                                indexes with MirrorGroup + MirrorMember indexes
--                                (closes AUDIT-AI-07).
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

-- MirrorMember: list peers of a group (hot path on every render of a mirror)
CREATE INDEX IF NOT EXISTS IdxMirrorMember_MirrorGroupId
    ON MirrorMember (MirrorGroupId);

-- MirrorMember: lookup "is this Item a mirror peer?" — UNIQUE enforces 1-group-per-Item
CREATE UNIQUE INDEX IF NOT EXISTS IdxMirrorMember_ItemId
    ON MirrorMember (ItemId);

-- MirrorGroup: canonical lookup
CREATE INDEX IF NOT EXISTS IdxMirrorGroup_CanonicalItemId
    ON MirrorGroup (CanonicalItemId);

-- Item: per-owner item count + role checks (cheap, optional)
CREATE INDEX IF NOT EXISTS IdxItem_OwnerUserId
    ON Item (OwnerUserId);

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

-- ----------------------------------------------------------------------------
-- B3 / 14b — Offline queue + LWW conflict resolution.
-- Field-level LWW reads Item.UpdatedAt during reconnect drain.
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS IdxItem_UpdatedAt
    ON Item (UpdatedAt DESC);

-- ----------------------------------------------------------------------------
-- B3 / 16-search-ranking — Hybrid relevance + recency.
-- AT-APP-104: tiebreak by UpdatedAt DESC inside each match-tier.
-- AT-APP-106: search excludes soft-deleted items (partial index on live rows).
-- LIKE/substring scans Item.Content; FTS5 virtual table is recommended for prod
-- but a partial index on (DeletedAt, UpdatedAt DESC) materially helps the
-- "live items recently updated" hot path used by the ranking tiebreak.
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS IdxItem_LiveByUpdatedAt
    ON Item (UpdatedAt DESC)
    WHERE DeletedAt IS NULL;

-- Optional FTS5 mirror for the Content column (commented — flip on for prod).
-- CREATE VIRTUAL TABLE IF NOT EXISTS ItemContentFts USING fts5(
--     Content,
--     content='Item',
--     content_rowid='ItemId',
--     tokenize='unicode61 remove_diacritics 2'
-- );

-- ----------------------------------------------------------------------------
-- B4 / 11b — ReaperRuns audit log.
-- Recent-runs lookup for ops dashboards + idempotency checks.
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS IdxReaperRuns_RanAt
    ON ReaperRuns (RanAt DESC);

-- End of 03-app-indexes.sql
