-- ============================================================================
-- WorkFlowy — Lookup Table Seed Data
-- File: 05-seed-enums.sql
-- Target: BOTH workflowy_root.db AND workflowy_app_{WorkspaceId}.db
-- Version: 1.0.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/20-enums-index.md
--
-- Idempotent: every INSERT uses INSERT OR IGNORE. Re-running cannot duplicate.
-- IDs are stable contracts — never renumber.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ItemType (App DB) — 12 unified item types
-- See spec/20-enums-index.md §2 for canonical names.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- ShareRoleType (App DB)
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO ShareRoleType (ShareRoleTypeId, Name) VALUES
    (1, 'Viewer'),
    (2, 'Editor'),
    (3, 'Owner');

-- ----------------------------------------------------------------------------
-- WorkspaceRoleType (Root DB)
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO WorkspaceRoleType (WorkspaceRoleTypeId, Name) VALUES
    (1, 'Owner'),
    (2, 'Admin'),
    (3, 'Member');

-- ----------------------------------------------------------------------------
-- RoleType (Root DB) — system-wide
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO RoleType (RoleTypeId, Name) VALUES
    (1, 'admin'),
    (2, 'user');

-- End of 05-seed-enums.sql
