-- ============================================================================
-- WorkFlowy — Lookup Table Seed Data
-- File: 05-seed-enums.sql
-- Target: BOTH workflowy_root.db AND workflowy_app_{WorkspaceId}.db
-- Version: 1.1.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/20-enums-index.md
--
-- Idempotent: every INSERT uses INSERT OR IGNORE. Re-running cannot duplicate.
-- IDs are stable contracts — never renumber.
--
-- The App-only seeds (ItemType, ShareRoleType) are wrapped in
--   INSERT OR IGNORE INTO {tbl} SELECT ... WHERE EXISTS(... sqlite_master ...)
-- so this file is safe to run on the Root DB (where those tables don't exist)
-- and on the App DB (where they do). The Root-only seeds use the same guard.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ItemType (App DB only) — 12 unified item types
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 1,  'Bullet'      WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 2,  'Heading1'    WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 3,  'Heading2'    WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 4,  'Heading3'    WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 5,  'Paragraph'   WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 6,  'Quote'       WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 7,  'Code'        WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 8,  'Todo'        WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 9,  'Board'       WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 10, 'BoardColumn' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 11, 'Mirror'      WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');
INSERT OR IGNORE INTO ItemType (ItemTypeId, Name)
SELECT 12, 'Embed'       WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ItemType');

-- ----------------------------------------------------------------------------
-- ShareRoleType (App DB only)
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO ShareRoleType (ShareRoleTypeId, Name)
SELECT 1, 'Viewer' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ShareRoleType');
INSERT OR IGNORE INTO ShareRoleType (ShareRoleTypeId, Name)
SELECT 2, 'Editor' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ShareRoleType');
INSERT OR IGNORE INTO ShareRoleType (ShareRoleTypeId, Name)
SELECT 3, 'Owner'  WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ShareRoleType');

-- ----------------------------------------------------------------------------
-- WorkspaceRoleType (Root DB only)
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO WorkspaceRoleType (WorkspaceRoleTypeId, Name)
SELECT 1, 'Owner'  WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='WorkspaceRoleType');
INSERT OR IGNORE INTO WorkspaceRoleType (WorkspaceRoleTypeId, Name)
SELECT 2, 'Admin'  WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='WorkspaceRoleType');
INSERT OR IGNORE INTO WorkspaceRoleType (WorkspaceRoleTypeId, Name)
SELECT 3, 'Member' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='WorkspaceRoleType');

-- ----------------------------------------------------------------------------
-- RoleType (Root DB only) — system-wide
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO RoleType (RoleTypeId, Name)
SELECT 1, 'admin' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='RoleType');
INSERT OR IGNORE INTO RoleType (RoleTypeId, Name)
SELECT 2, 'user'  WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='RoleType');

-- End of 05-seed-enums.sql
