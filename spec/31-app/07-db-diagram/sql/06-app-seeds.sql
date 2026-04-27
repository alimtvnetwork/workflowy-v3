-- ============================================================================
-- WorkFlowy — App DB Lookup Seeds
-- File: 06-app-seeds.sql
-- Target: workflowy_app_{WorkspaceId}.db ONLY
-- Version: 1.0.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/20-enums-index.md
--
-- Idempotent: re-running cannot duplicate. IDs are stable contracts.
-- Run order: AFTER 02-app-schema.sql, 03-app-indexes.sql, 04-app-triggers.sql.
-- ============================================================================

-- ItemType — 12 unified item types (see spec/20-enums-index.md §2)
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name) VALUES
    (1,  'Bullet'),
    (2,  'Heading1'),
    (3,  'Heading2'),
    (4,  'Heading3'),
    (5,  'Paragraph'),
    (6,  'Quote'),
    (7,  'Code'),
    (8,  'Todo'),
    (9,  'Board'),
    (10, 'BoardColumn'),
    (11, 'Mirror'),
    (12, 'Embed');

-- ShareRoleType
INSERT OR IGNORE INTO ShareRoleType (ShareRoleTypeId, Name) VALUES
    (1, 'Viewer'),
    (2, 'Editor'),
    (3, 'Owner');

-- End of 06-app-seeds.sql
