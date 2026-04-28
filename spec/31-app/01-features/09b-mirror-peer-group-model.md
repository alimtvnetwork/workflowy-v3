# Mirror Peer-Group Model — SSOT

> **Version:** 1.1.0
> **Created:** 2026-04-27 (UTC+8) — Authored from user-confirmed Workflowy parity (chat: mirror semantics clarification, 2026-04-27).
> **v1.1.0:** 2026-04-27 — Renamed AT prefix `AT-MGP-` → `AT-MPG-` (Mirror Peer Group). Per Ambiguity #02 user resolution. Global rename across 8 files: this SSOT, `97-acceptance-criteria.md` ×2, `02-ci-quality-gates.md`, `23-g30-at-citation-validity-gate.md`, `26-allow-list-inventory.md`, `30-check-at-citation-validity.mjs`, `05-component-contract-map.md`. 61 occurrences total.
> **Parent:** [09-mirrors.md](./09-mirrors.md)
> **Status:** ✅ FINAL — supersedes the source/target language in `09-mirrors.md` §8.2 wherever the two conflict. `09-mirrors.md` will be folded into this model in v3.0.0.

---

## Keywords

`mirror` · `peer-group` · `detach` · `bidirectional` · `workflowy-parity`

---

## 1. Why this file exists

Previously, the spec described mirrors as `(SourceItem, MirrorInstance)` — one canonical source, many lightweight references. **This is wrong by Workflowy parity.** Mirrors are **bidirectional peers**: when item X is mirrored to a new location, *both* the original and the new instance become equal members of a **mirror group**. There is no "source" and no "copy" — only N peers, all of equal standing.

The `MirrorOfItemId` column on `Item` and the `Mirror(SourceItemId, MirrorItemId)` join table in `02-app-schema.sql` v1.0.0 are **deprecated** — replaced by the `MirrorGroup` + `MirrorMember` tables defined in §4.

---

## 2. The Five Rules

| # | Rule | Authority |
|---|------|-----------|
| **R-1** | A mirror is **NOT a duplicate** and is **NOT a source/copy pair**. It is membership in a peer group. All peers are equal. | User confirmation 2026-04-27 |
| **R-2** | When user creates a mirror via `/mirror`, `/mirror to`, `/mirror here`, or **⇧⌘M**, both the originating item AND the new instance become group members. The "originating" item gains a diamond badge. | Workflowy parity |
| **R-3** | **Detach removes one member from the group.** If the group's size drops to **1**, the group is **dissolved** and the remaining lone item also becomes a regular item (no diamond). | User confirmation 2026-04-27 |
| **R-4** | **Edits flow read-through.** Title, Notes, Tags, Completion, Children, Child-order, Attachments, Comments, ItemType — synced across all peers. **Position** (FractionalIndex within parent) and **IsCollapsed** are per-instance. | User confirmation 2026-04-27 |
| **R-5** | Conflict tiebreak is **LWW by `(UpdatedAt DESC, OwnerUserId ASC)`** at the field level. See [`05-conventions/33-state-management-architecture.md`](../05-conventions/33-state-management-architecture.md) §3. | User confirmation 2026-04-27 |

---

## 3. What is a Mirror, structurally?

A mirror is a **regular `Item` row** that happens to be a member of a `MirrorGroup`. Specifically:

- Each peer has its own `ItemId`, its own `ParentItemId`, its own `FractionalIndex`, its own `IsCollapsed`.
- All peers in a group share **logically-identical content** (Title, Notes, Children subtree, Completion, Attachments, Comments, Tags). Content is stored once on the **canonical row** (the lowest `ItemId` in the group is the convention) and read-through by all peers.
- The diamond (◇) badge renders on every peer where `MirrorGroupId IS NOT NULL` AND group size ≥ 2.
- `ItemType` is **never** `mirror`. Items keep their original type (`bullet`, `todo`, `h1`, etc.). "Being mirrored" is a relation, not a type. This permanently closes [AUDIT-AI-07](../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md#audit-ai-07).

---

## 4. Data Model (replaces the deprecated `Mirror` table)

```sql
-- 4.1  MirrorGroup — one row per logical mirror group.
CREATE TABLE IF NOT EXISTS MirrorGroup (
    MirrorGroupId   INTEGER PRIMARY KEY AUTOINCREMENT,
    CanonicalItemId INTEGER NOT NULL,       -- The peer that owns the content rows.
                                            -- By convention: lowest ItemId in the group.
    CreatedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (CanonicalItemId) REFERENCES Item(ItemId) ON DELETE CASCADE
);

-- 4.2  MirrorMember — peer membership. One row per (group, item) pair.
CREATE TABLE IF NOT EXISTS MirrorMember (
    MirrorMemberId INTEGER PRIMARY KEY AUTOINCREMENT,
    MirrorGroupId  INTEGER NOT NULL,
    ItemId         INTEGER NOT NULL,
    JoinedAt       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (MirrorGroupId) REFERENCES MirrorGroup(MirrorGroupId) ON DELETE CASCADE,
    FOREIGN KEY (ItemId)        REFERENCES Item(ItemId)               ON DELETE CASCADE,
    UNIQUE (MirrorGroupId, ItemId),         -- A peer can only be in a group once.
    UNIQUE (ItemId)                          -- An Item can only be in ONE group at a time.
);

-- 4.3  Indexes
CREATE INDEX IF NOT EXISTS idx_mirrormember_group ON MirrorMember(MirrorGroupId);
CREATE INDEX IF NOT EXISTS idx_mirrormember_item  ON MirrorMember(ItemId);

-- 4.4  Trigger — dissolve group when size drops to 1
CREATE TRIGGER IF NOT EXISTS trg_mirrorgroup_dissolve_on_singleton
AFTER DELETE ON MirrorMember
FOR EACH ROW
WHEN (SELECT COUNT(*) FROM MirrorMember WHERE MirrorGroupId = OLD.MirrorGroupId) = 1
BEGIN
    DELETE FROM MirrorGroup WHERE MirrorGroupId = OLD.MirrorGroupId;
    -- ON DELETE CASCADE on MirrorMember removes the last surviving row,
    -- and the remaining Item naturally has no group → no diamond.
END;
```

**Removed from `02-app-schema.sql`:**
- `Item.MirrorOfItemId` column
- `Mirror(MirrorId, MirrorItemId, SourceItemId, BrokenAt, CreatedAt)` table

See [`07-db-diagram/sql/02-app-schema.sql`](../07-db-diagram/sql/02-app-schema.sql) v2.0.0 for the patched file.

---

## 5. Property Sync Matrix

| Property | Synced across peers? | Storage |
|----------|:---:|---|
| Title (`Item.Content`) | ✅ | Canonical row only; peers SELECT through |
| Notes | ✅ | Canonical row |
| ItemType (`bullet`, `todo`, `h1`...) | ✅ | Canonical row |
| Tags | ✅ | `ItemTag` joins on canonical `ItemId` |
| Comments | ✅ | `Comment.ItemId` = canonical `ItemId` |
| Attachments | ✅ | `Attachment.ItemId` = canonical `ItemId` |
| Mentions | ✅ | `Mention.ItemId` = canonical `ItemId` |
| `CompletedAt` | ✅ | Canonical row |
| `DueDate` | ✅ | Canonical row |
| Children (subtree) | ✅ (1:1) | Children's `ParentItemId` = canonical `ItemId`; renderer attaches them under each peer at render time |
| Child order (children's `FractionalIndex`) | ✅ | Stored once on each child |
| **`ParentItemId`** | ❌ per-peer | Each peer has its own parent — that's the whole point |
| **`FractionalIndex`** | ❌ per-peer | Each peer has its own position in its own parent's sibling list |
| **`IsCollapsed`** | ❌ per-peer | Collapsed in one location does not affect another |
| Selection / focus | ❌ per-peer | Pure UI state, not persisted |

---

## 6. Lifecycle Operations

### 6.1  Create — `/mirror`, `/mirror to`, `/mirror here`, ⇧⌘M

```
INPUT:  originatingItemId, targetParentItemId, targetFractionalIndex
STEPS:
  1. If originatingItem already in a MirrorGroup → reuse that group.
     Else: INSERT MirrorGroup(CanonicalItemId = originatingItemId);
           INSERT MirrorMember(MirrorGroupId = new.id, ItemId = originatingItemId).
  2. INSERT Item(
       ParentItemId    = targetParentItemId,
       OwnerUserId     = current user,
       ItemTypeId      = (SELECT ItemTypeId FROM Item WHERE ItemId = canonical),
       Content         = '',                  -- empty; renderer reads through canonical
       FractionalIndex = targetFractionalIndex
     ) → newItemId.
  3. INSERT MirrorMember(MirrorGroupId = group.id, ItemId = newItemId).
  4. Emit SSE event `mirror.member.added` with { groupId, newItemId }.
  5. Toast: "Mirror created in {target name}". Subtitle: "Mirrors stay synced."
```

### 6.2  Detach — context menu "Detach mirror"

```
INPUT:  itemId
STEPS:
  1. SELECT MirrorGroupId FROM MirrorMember WHERE ItemId = itemId.
  2. UPDATE Item SET Content = (SELECT Content FROM canonical row) WHERE ItemId = itemId.
     -- Detached peer takes its own snapshot of current content.
  3. DELETE FROM MirrorMember WHERE ItemId = itemId.
     -- Trigger trg_mirrorgroup_dissolve_on_singleton fires automatically if size now = 1.
  4. If detached itemId WAS the canonical → promote next-lowest ItemId in group as canonical
     (UPDATE MirrorGroup SET CanonicalItemId = ...).
  5. Emit SSE event `mirror.member.removed` with { groupId, removedItemId, dissolved: bool }.
  6. Toast: "Mirror detached" (or "Mirror group dissolved" if size dropped to 1).
```

### 6.3  Delete a peer (regular item delete)

Same as detach, but the peer's `Item` row is moved to trash (`DeletedAt = now`). Group dissolves if singleton.

### 6.4  "See them" — list all peers

```sql
SELECT i.ItemId, i.ParentItemId, p.Content AS ParentTitle
FROM   MirrorMember mm
JOIN   Item         i ON i.ItemId = mm.ItemId
LEFT   JOIN Item    p ON p.ItemId = i.ParentItemId
WHERE  mm.MirrorGroupId = (SELECT MirrorGroupId FROM MirrorMember WHERE ItemId = ?);
```

---

## 7. Acceptance Tests (canonical AT table)

| ID | Given | When | Then | testid |
|---|---|---|---|---|
| AT-MPG-01 | Item X is regular (not a mirror) | User runs `/mirror to` and picks parent P | A new `MirrorGroup` is created; both X and the new peer have `MirrorMember` rows; both render the diamond ◇ badge | `mirror-badge` |
| AT-MPG-02 | X has 3 mirror peers (group size 4) | User edits the title on peer #2 | All 4 peers render the new title within 100 ms via SSE `item.updated` | `mirror-content-sync` |
| AT-MPG-03 | X has 3 peers, each in different parents at different positions | User drags peer #2 to a new position | Only peer #2's `FractionalIndex` changes; peers #1, #3, #4 keep their positions | `mirror-position-isolation` |
| AT-MPG-04 | Group has 2 members | User detaches one | Group is dissolved; the remaining item has NO diamond badge and is a regular item | `mirror-singleton-dissolve` |
| AT-MPG-05 | Group has 3 members | User detaches one | Remaining 2 stay mirrored, still show diamond, group still exists | `mirror-detach-survivors` |
| AT-MPG-06 | User opens context menu on a mirror | Menu shows "See them" | Clicking opens a list of all peers with their parent titles | `mirror-see-them` |
| AT-MPG-07 | Peer #2 is `IsCollapsed = 1`, peer #1 is expanded | Render | Peer #2 renders collapsed, peer #1 renders expanded; toggling one does NOT toggle the other | `mirror-collapse-isolation` |
| AT-MPG-08 | Canonical peer is deleted (moved to trash) | After delete | The `MirrorGroup.CanonicalItemId` is updated to the next-lowest `ItemId` in the group; renderer continues seamlessly | `mirror-canonical-promotion` |
| AT-MPG-09 | Two devices edit the same canonical content offline | Both reconnect within 1 s | The edit with the later `UpdatedAt` wins; if equal, the edit from the lower `OwnerUserId` wins (LWW per R-5) | `mirror-lww-tiebreak` |
| AT-MPG-10 | User attempts to mirror item X under a parent inside X's own subtree | Submit | Block with toast "Cannot mirror an item into itself or its descendants" — see [`09a-mirror-cycle-detection.md`](./09a-mirror-cycle-detection.md) | `mirror-cycle-error` |

---

## 8. Migration from v1.0 schema

For any deployed v1.0 SQLite databases (currently only fixtures):

```sql
-- Phase 1: Build groups from old MirrorOfItemId chains
INSERT INTO MirrorGroup (CanonicalItemId)
SELECT MIN(ItemId) FROM Item WHERE MirrorOfItemId IS NOT NULL
GROUP BY COALESCE(MirrorOfItemId, ItemId);

-- Phase 2: Populate MirrorMember from both source rows and pointer rows
INSERT INTO MirrorMember (MirrorGroupId, ItemId)
SELECT g.MirrorGroupId, i.ItemId
FROM   Item i
JOIN   MirrorGroup g
  ON   g.CanonicalItemId = COALESCE(i.MirrorOfItemId, i.ItemId)
WHERE  i.MirrorOfItemId IS NOT NULL OR i.ItemId IN (SELECT CanonicalItemId FROM MirrorGroup);

-- Phase 3: Drop the old column and table
ALTER TABLE Item DROP COLUMN MirrorOfItemId;
DROP TABLE Mirror;
```

This migration is in [`07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql`](../07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql).

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `originatingItemId` | `string` | Selected item | Yes | Item the user invoked `/mirror` / ⇧⌘M on |
| `targetParentItemId` | `string` | Mirror picker | Yes | Where the new peer is placed |
| `targetFractionalIndex` | `string` | FI generator | Yes | Per-instance position inside target parent |
| `currentUser` | `User` | Auth session | Yes | Must hold Edit on origin AND target parent |
| `existingGroupId` | `number \| null` | `MirrorMember` lookup | Yes | If origin already in a group, reuse it |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| `MirrorGroup` row | ✅ SQLite | `MirrorGroup` table | Only if origin was previously regular |
| `MirrorMember` rows | ✅ SQLite | `MirrorMember` table | Two on first mirror; one per subsequent peer |
| New peer `Item` row | ✅ SQLite | `Item` table | Empty `Content`; reads through canonical |
| `mirror.member.added` event | ❌ | SSE | Triggers diamond badge on every connected client |
| Diamond ◇ badge | ❌ | React state | Renders for both peers (or all N) |
| Toast | ❌ | Toast bus | "Mirror created in {target}" |

## Edge Cases

1. User mirrors X under X's own subtree → block with `ERR_CYCLE` (see [`09a-mirror-cycle-detection.md`](./09a-mirror-cycle-detection.md)).
2. User mirrors X under a parent where X already has a peer → block with toast "Already mirrored in this location".
3. Group has 2 members; user detaches one → `TrgMirrorMember_DissolveOnSingleton` deletes the group; lone surviving Item becomes regular.
4. Group has 5 members; user detaches one → group + 4 remaining peers stay; diamonds intact.
5. Canonical peer is hard-deleted → `ON DELETE CASCADE` on `MirrorGroup.CanonicalItemId` would dissolve the group; **before delete**, application code re-points `CanonicalItemId` to next-lowest `ItemId` in group.
6. Two devices edit the canonical row's title offline → on reconnect, LWW by `(UpdatedAt DESC, OwnerUserId ASC)` picks the winner; all peers re-render.
7. Peer A is collapsed in location-1, peer B is expanded in location-2 → `IsCollapsed` is per-instance; toggling A does not affect B.
8. User reorders peer A inside its parent → only A's `FractionalIndex` changes; peers B, C, ... keep theirs.
9. User shares the source content to a teammate → share grant is on the canonical `ItemId`; all peers inherit the grant.
10. Network drops mid-mirror-create → operation queued per `mem://features/offline-resilience`; peer + diamond appear on reconnect.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-MPG-01 | Item X is regular (not a mirror) | User runs `/mirror to` and picks parent P | Both X and the new peer have `MirrorMember` rows; both render diamond ◇ | `mirror-badge` |
| AT-MPG-02 | X has 3 mirror peers | User edits the title on peer #2 | All 4 peers render the new title within 100 ms via SSE | `mirror-content-sync` |
| AT-MPG-03 | X has 3 peers in different parents | User drags peer #2 to a new position | Only peer #2's `FractionalIndex` changes | `mirror-position-isolation` |
| AT-MPG-04 | Group has 2 members | User detaches one | Group dissolves; remaining item has NO diamond | `mirror-singleton-dissolve` |
| AT-MPG-05 | Group has 3 members | User detaches one | Remaining 2 stay mirrored, group still exists | `mirror-detach-survivors` |
| AT-MPG-06 | User opens context menu on a mirror | Clicks "See them" | List of all peers with parent titles opens | `mirror-see-them` |
| AT-MPG-07 | Peer #2 collapsed, peer #1 expanded | Render | Each peer renders its own collapse state | `mirror-collapse-isolation` |
| AT-MPG-08 | Canonical peer is deleted | After delete | `MirrorGroup.CanonicalItemId` is re-pointed to next-lowest `ItemId` | `mirror-canonical-promotion` |
| AT-MPG-09 | Two devices edit canonical content offline | Both reconnect | Later `UpdatedAt` wins; tie → lower `OwnerUserId` wins | `mirror-lww-tiebreak` |
| AT-MPG-10 | User picks own subtree as mirror target | Submit | Block with `ERR_CYCLE` toast | `mirror-cycle-error` |


## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). Follows the same disclaimer as `09-mirrors.md`.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Diamond peer badge | `src/components/items/MirrorBadge.tsx` | `mirror-badge` | AT-MPG-01 |
| Cross-peer content sync | `src/state/mirrorGroupStore.ts` | `mirror-content-sync` | AT-MPG-02 |
| Per-peer position lane | `src/components/items/PeerPositionLane.tsx` | `mirror-position-isolation` | AT-MPG-03 |
| Singleton-dissolve handler | `src/state/mirrorDissolveSaga.ts` | `mirror-singleton-dissolve` | AT-MPG-04 |
| Survivor preservation | `src/state/mirrorDetachSaga.ts` | `mirror-detach-survivors` | AT-MPG-05 |
| "See them" peer list | `src/components/items/MirrorPeerList.tsx` | `mirror-see-them` | AT-MPG-06 |
| Per-instance collapse | `src/components/items/ExpandToggle.tsx` | `mirror-collapse-isolation` | AT-MPG-07 |
| Canonical promotion | `src/state/mirrorCanonicalPromotionSaga.ts` | `mirror-canonical-promotion` | AT-MPG-08 |
| LWW tiebreak | `src/state/lwwResolver.ts` | `mirror-lww-tiebreak` | AT-MPG-09 |
| Cycle guard | `src/components/items/MirrorPicker.tsx` | `mirror-cycle-error` | AT-MPG-10 |

---

## Workflowy Feature Reference (F3) — Workflowy ↔ Peer-Group Reconciliation Map

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). This appendix is the canonical translation table from Workflowy's user-facing "mirror" vocabulary to WorkFlowy's peer-group model defined above.

| Workflowy term (verbatim) | WorkFlowy peer-group interpretation | Affected AT-MPG-* |
|---|---|---|
| "Create a mirror of X" | Add a new peer to X's group; if no group exists, create one with X and the new peer. | AT-MPG-01, AT-MPG-02 |
| "The original / source" | Group founder by `created_at` (ties broken by `id` ascending). UI must NOT label any peer as "the original". | AT-MPG-03 |
| "The mirror copy" | Any peer other than the founder. UX-equivalent to founder; all CRUD propagates. | AT-MPG-03, AT-MPG-04 |
| "Detach mirror" | Remove the peer from its group; if group ≤ 1 after removal, dissolve the group (`is_active=false` on the group row, peers become standalone items). | AT-MPG-05, AT-MPG-06 |
| "See mirrors" panel | Read-only listing of every other peer in the group with breadcrumb path; backed by `mirror_peer_groups.id` lookup. | AT-MPG-07 |
| "Edit a mirror" | Edit any peer; mutation broadcasts to all peers in the group with LWW tiebreak (`updated_at` desc, `id` asc). | AT-MPG-08 |
| "Add child to a mirror" | Child rows are owned by the **group**, not the peer. Reads through any peer return the same children. | AT-MPG-09 |
| "Cycle: mirror inside its own subtree" | Hard-rejected at insert time; surfaces `mirror-cycle-error` (AT-MPG-10). | AT-MPG-10 |

### Vocabulary policy

1. Spec text (this folder) MAY use "mirror" as a noun synonym for "peer", BUT every use must be hyperlinked to this peer-group model file on first occurrence per page.
2. UI copy strings MUST prefer "peer" / "linked item" over "mirror copy". A linter check (F7) will scan `src/components/**` and the design-system spec for the forbidden phrase "mirror copy".
3. Database identifiers stay canonical: tables remain `mirror_peer_groups` / `mirror_peer_group_members`; no rename to "mirror_copies".

> Cross-link: user-facing UX in [`./09-mirrors.md`](./09-mirrors.md) F3 appendix; item-menu entries in [`./06-item-context-menu.md`](./06-item-context-menu.md) F3 appendix.

---

## Related

- [09-mirrors.md](./09-mirrors.md) — UX and feature contract (will be folded into this model in v3.0.0)
- [09a-mirror-cycle-detection.md](./09a-mirror-cycle-detection.md) — Cycle detection algorithm
- [05-conventions/33-state-management-architecture.md](../05-conventions/33-state-management-architecture.md) §3 — LWW tiebreak SSOT
- [07-db-diagram/sql/02-app-schema.sql](../07-db-diagram/sql/02-app-schema.sql) — DDL
- [../20-enums-index.md](../../20-enums-index.md) §`ItemType` — confirms `mirror` is NOT a type
- [../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md](../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md#audit-ai-07) — closes AUDIT-AI-07
- `mem://features/mirroring` — peer-group memory rule
- [`./16-search-ranking.md`](./16-search-ranking.md) — ← Search ranking (forward link from)
