-- ============================================================================
-- WorkFlowy — Root DB Lookup Seeds
-- File: 05-root-seeds.sql
-- Target: workflowy_root.db ONLY
-- Version: 1.0.0
-- Updated: 2026-04-27 (UTC+8)
-- Authority: spec/20-enums-index.md
--
-- Idempotent: re-running cannot duplicate. IDs are stable contracts.
-- Run order: AFTER 01-root-schema.sql.
-- ============================================================================

-- WorkspaceRoleType
INSERT OR IGNORE INTO WorkspaceRoleType (WorkspaceRoleTypeId, Name) VALUES
    (1, 'Owner'),
    (2, 'Admin'),
    (3, 'Member');

-- RoleType — system-wide
INSERT OR IGNORE INTO RoleType (RoleTypeId, Name) VALUES
    (1, 'admin'),
    (2, 'user');

-- End of 05-root-seeds.sql
