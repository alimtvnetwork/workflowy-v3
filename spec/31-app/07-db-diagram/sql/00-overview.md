# SQLite DDL — Reference Implementation

> **Version:** 2.2.0
> **Updated:** 2026-04-27 (UTC+8) — v2.2.0 extended Naming Bridge with **index-name aliases** (`IdxMirrorMember_*`/`IdxMirrorGroup_*` ↔ `IdxMirrorPeerGroupMember_*`/`IdxMirrorPeerGroup_*`) and **FK column aliases** (`MirrorMember.MirrorGroupId` ↔ `MirrorPeerGroupMembers.MirrorPeerGroupId`); also added a "Reverse pointers" subsection so ERD-side readers (`03-app-db-erd.md`, `06-indexes.md`) can find the bridge. v2.1.0 added `ReaperRuns` table (B4/11b), search-ranking + LWW indexes (B3/14b/16), and Naming Bridge between DDL identifiers and spec prose. v2.0.0 swapped source/target Mirror schema for the bidirectional MirrorGroup + MirrorMember peer-group model and added the v1→v2 migration script. Closes AUDIT-AI-07. v1.0.0: initial AUDIT-AI-03 closure.
> **Status:** ✅ SSOT for `.sql` schema files (closes AUDIT-AI-03 + AUDIT-AI-07; carries B1–B4 DDL extensions)
> **Parent:** [`../00-overview.md`](../00-overview.md)

---

## Naming Bridge — DDL ↔ spec prose

(gate **G-24-DDL-SINGULAR-LOCKED**) > **Read this if you bounce between SQL files and feature specs.** The DDL is the implementation ground truth; spec prose uses Workflowy-style aliases. **This section is the single SSOT for DDL↔prose aliases** — every cross-doc reference (e.g. `03-app-db-erd.md`, `06-indexes.md`, `04-feature-slices.md`, `07-migrations.md`) MUST link here rather than restate the mappings.

### Tables & columns

| DDL identifier (canonical at runtime) | Spec prose alias (canonical at design time) | Notes |
|---------------------------------------|---------------------------------------------|-------|
| `Item` (singular table) | `Items` | Pluralised in prose for readability; same rows. |
| `Item.Content` | `Items.Title` / item title | Workflowy items have a single text body that doubles as title — first non-empty line. |
| `Item.FractionalIndex` | `SortOrder` / fractional-index string key | Identical concept; ordering key per `mem://features/editor-core`. |
| `Item.OwnerUserId` | `Items.OwnerId` | DDL spells out "User"; prose abbreviates. |
| `MirrorGroup` + `MirrorMember` | `MirrorPeerGroups` + `MirrorPeerGroupMembers` | Same tables; spec prose pluralises and prefixes "Peer". |
| `MirrorGroup.MirrorGroupId` (PK) | `MirrorPeerGroup.MirrorPeerGroupId` | Same column. |
| `MirrorGroup.CanonicalItemId` | `MirrorPeerGroup.CanonicalItemId` | Identical (no alias). |
| `MirrorMember.MirrorGroupId` (FK) | `MirrorPeerGroupMembers.MirrorPeerGroupId` | Same FK column; renamed to match short table name in DDL. |
| `MirrorMember.MirrorMemberId` (PK) | `MirrorPeerGroupMembers.MirrorPeerGroupMemberId` | Same column. |
| `ReaperRuns` | `ReaperRuns` | Identical (introduced in v2.1.0). |

### Indexes (added v2.2.0)

| DDL identifier (`03-app-indexes.sql`) | Spec prose alias (`06-indexes.md`) | Notes |
|----------------------------------------|------------------------------------|-------|
| `IdxMirrorMember_ItemId` (UNIQUE, full-table) | `IdxMirrorPeerGroupMember_ItemId` | Same index. **Full-table UNIQUE** — there is no `DetachedAt` column; detach is performed by row DELETE per `02-workflows/08-mirror-detach-flow.md` step 3c (corrected in F26 / `06-indexes.md` v1.4.0). |
| `IdxMirrorMember_MirrorGroupId` | `IdxMirrorPeerGroupMember_GroupId` | Same FK fan-out index. |
| `IdxMirrorGroup_CanonicalItemId` | `IdxMirrorPeerGroup_CanonicalItemId` | Same canonical-lookup index. |

### Reverse pointers

If you arrived from one of the prose-side documents and need this bridge, the canonical link is **`spec/31-app/07-db-diagram/sql/00-overview.md` §Naming Bridge** (this section). The following files contain a one-line callback that points here:

- [`../03-app-db-erd.md`](../03-app-db-erd.md) §Naming bridge (footnote)
- [`../06-indexes.md`](../06-indexes.md) §Naming bridge (footnote)
- [`../04-feature-slices.md`](../04-feature-slices.md) §4.2 schema-authority callout
- [`../07-migrations.md`](../07-migrations.md) §v1→v2 Mirror Peer-Group naming-bridge note

When 50 ATs (`AT-APP-58..107`) say "`Items.Title`", read it as `Item.Content` at the SQL layer. When prose says "field-level LWW on `UpdatedAt`", read it as `Item.UpdatedAt` (column exists, indexed v2.1.0).

---

## What this folder contains

Concrete, executable **`.sql` files** the WordPress plugin runs at install/activate time. Every CREATE/INDEX/TRIGGER mirrors the ERDs in [`../02-root-db-erd.md`](../02-root-db-erd.md), [`../03-app-db-erd.md`](../03-app-db-erd.md), and [`../06-indexes.md`](../06-indexes.md), but in the **exact form SQLite parses**.

| File | Target DB | Purpose |
|------|-----------|---------|
| [`01-root-schema.sql`](./01-root-schema.sql) | `workflowy_root.db` | Identity, workspaces, system roles |
| [`02-app-schema.sql`](./02-app-schema.sql) v2.1.0 | `workflowy_app_{WorkspaceId}.db` | Items, MirrorGroup + MirrorMember peer-group, shares, comments, **ReaperRuns** |
| [`03-app-indexes.sql`](./03-app-indexes.sql) v2.1.0 | App DB | All performance indexes (run AFTER `02-app-schema.sql`) — incl. **LWW + search-ranking + reaper** indexes |
| [`04-app-triggers.sql`](./04-app-triggers.sql) v2.0.0 | App DB | `UpdatedAt` auto-touch, soft-delete/restore cascade, MirrorGroup auto-dissolve |
| [`05-root-seeds.sql`](./05-root-seeds.sql) | Root DB | Lookup seeds: `RoleType`, `WorkspaceRoleType` |
| [`06-app-seeds.sql`](./06-app-seeds.sql) | App DB | Lookup seeds: `ItemType` (12), `ShareRoleType` (3) |
| [`07-migration-v2-mirror-peer-groups.sql`](./07-migration-v2-mirror-peer-groups.sql) v1.0.0 | App DB | One-shot v1→v2 migration: drops `Item.MirrorOfItemId` + `Mirror` table; backfills `MirrorGroup` + `MirrorMember` |

> **Why split seeds**: SQLite parses an `executescript()` block in one pass before executing it. A single seed file referencing both Root-only and App-only tables fails on whichever DB is missing the tables. Two files keep each script self-contained and parseable.

---

## SQLite-specific rules these files enforce

These are the failure modes the AI must NOT introduce:

| ❌ Forbidden | ✅ Required | Why |
|--------------|-------------|-----|
| `BOOLEAN` | `INTEGER` storing `0`/`1` with `CHECK (col IN (0, 1))` | SQLite has **no** boolean type — it silently accepts any text/blob into a `BOOLEAN` column |
| `DATETIME` / `TIMESTAMP` | `TEXT` storing ISO-8601 (`YYYY-MM-DDTHH:MM:SS.sssZ`) | SQLite stores datetimes as TEXT under the hood; explicit TEXT prevents driver coercion bugs |
| `VARCHAR(n)` / `CHAR(n)` | `TEXT` (no length suffix) | SQLite ignores length on TEXT; suffix lies about enforcement |
| `AUTO_INCREMENT` | `INTEGER PRIMARY KEY` (autoincrements automatically as ROWID alias) | MySQL syntax; SQLite uses `AUTOINCREMENT` only when gap-free IDs are mandatory |
| `ON DELETE CASCADE` without `PRAGMA foreign_keys = ON;` | Schema MUST start with `PRAGMA foreign_keys = ON;` (gate **G-24-DDL-SINGULAR-LOCKED**) | SQLite ships with FKs **disabled** by default — every connection must enable |
| `ENUM(...)` column type | `INTEGER FK → {Lookup}Type` table | SQLite has no native enum; lookup tables + FKs are the canonical pattern |
| `ALTER TABLE ... DROP COLUMN` (pre 3.35) | Use migration recipe in [`../07-migrations.md`](../07-migrations.md) | Older SQLite builds lack DROP COLUMN; rebuild-and-copy required |

---

## How the plugin loads these files

```php
// wp-content/plugins/workflowy/includes/Schema/Installer.php
// Pseudocode — see 15-wp-plugin-how-to/01-foundation-and-architecture.md for full impl

public static function install(\PDO $pdo, string $kind): void {
    $pdo->exec('PRAGMA foreign_keys = ON;');
    $pdo->exec('PRAGMA journal_mode = WAL;');
    $pdo->exec('PRAGMA busy_timeout = 5000;');

    $base = __DIR__ . '/../../sql/';
    $files = $kind === 'root'
        ? ['01-root-schema.sql', '05-root-seeds.sql']
        : ['02-app-schema.sql', '03-app-indexes.sql', '04-app-triggers.sql', '06-app-seeds.sql'];

    foreach ($files as $file) {
        $sql = file_get_contents($base . $file);
        $pdo->exec($sql);
    }
}
```

---

## Verification

(gate **G-24-DDL-SINGULAR-LOCKED**) A green install MUST satisfy these queries (the harness from [`../../../15-wp-plugin-how-to/24-local-dev-harness.md`](../../../15-wp-plugin-how-to/24-local-dev-harness.md) runs them automatically):

```sql
-- (1) FKs are on
PRAGMA foreign_keys;             -- expects 1

-- (2) WAL is on
PRAGMA journal_mode;             -- expects "wal"

-- (3) All expected tables exist (Root)
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;
-- expects: RoleType, User, UserRole, Workspace, WorkspaceMember, WorkspaceRoleType

-- (4) All expected tables exist (App)
-- expects: ActivityLog, Attachment, Comment, Favorite, Item, ItemTag, ItemType,
--          Mention, MirrorGroup, MirrorMember, Share, ShareRoleType, SyncCursor,
--          Tag, Template

-- (5) Required indexes exist
SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'Idx%' ORDER BY name;
-- expects 22 App-DB indexes per ../06-indexes.md (v2: removed IdxItem_MirrorOfItemId
-- + IdxMirror_*; added IdxMirrorMember_*, IdxMirrorGroup_CanonicalItemId)
```

---

## Acceptance Tests

| ID | Statement |
|----|-----------|
| `AT-DDL-01` | Running `01-root-schema.sql` against an empty `:memory:` DB produces all 6 Root tables with the column types listed in [`../02-root-db-erd.md`](../02-root-db-erd.md). |
| `AT-DDL-02` | Running `02-app-schema.sql` then `03-app-indexes.sql` then `04-app-triggers.sql` produces all 15 App tables (now including `MirrorGroup` + `MirrorMember`; no longer includes the deprecated `Mirror` table) and 22 indexes from [`../06-indexes.md`](../06-indexes.md). |
| `AT-DDL-03` | No column uses `BOOLEAN`, `DATETIME`, `TIMESTAMP`, `VARCHAR`, or `ENUM`; static grep returns zero matches. |
| `AT-DDL-04` | `PRAGMA foreign_keys` returns `1` and `PRAGMA journal_mode` returns `wal` after install. |
| `AT-DDL-05` | Both `05-root-seeds.sql` and `06-app-seeds.sql` are idempotent (`INSERT OR IGNORE`); running each twice does not duplicate rows. |
| `AT-DDL-06` | Triggers in `04-app-triggers.sql` set `Item.UpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ','now')` on every UPDATE. |
| `AT-DDL-07` | Inserting `Item.IsCompleted = 2` (out of 0/1 range) raises a `CHECK` constraint violation. |
| `AT-DDL-08` | Trigger `TrgMirrorMember_DissolveOnSingleton` deletes the `MirrorGroup` row when its membership drops to 1, leaving the lone surviving `Item` with no diamond badge (per [`spec/31-app/01-features/09b-mirror-peer-group-model.md`](../../01-features/09b-mirror-peer-group-model.md) §R-3). |
| `AT-DDL-09` | Running `07-migration-v2-mirror-peer-groups.sql` against a v1 DB with N `Mirror` rows produces ⌈N⌉ `MirrorGroup` rows + (N + distinct sources) `MirrorMember` rows; subsequent `SELECT MirrorOfItemId FROM Item LIMIT 1` raises "no such column". |

---

## Related

| Topic | Link |
|-------|------|
| Logical ERDs | [`../02-root-db-erd.md`](../02-root-db-erd.md), [`../03-app-db-erd.md`](../03-app-db-erd.md) |
| Index catalogue | [`../06-indexes.md`](../06-indexes.md) |
| Migrations | [`../07-migrations.md`](../07-migrations.md) |
| WP plugin foundation | [`../../../15-wp-plugin-how-to/01-foundation-and-architecture.md`](../../../15-wp-plugin-how-to/01-foundation-and-architecture.md) |
| Local dev harness | [`../../../15-wp-plugin-how-to/24-local-dev-harness.md`](../../../15-wp-plugin-how-to/24-local-dev-harness.md) |
| Naming conventions | [`../../../04-database-conventions/01-naming-conventions.md`](../../../04-database-conventions/01-naming-conventions.md) |
