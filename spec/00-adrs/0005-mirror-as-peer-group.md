# ADR-0005: Mirror is a peer-group relation, not an ItemType

## Status

`Accepted` — 2026-04-28

## Context

WorkFlowy's "mirror" feature lets the same logical content appear under
multiple parents while keeping all instances in lock-step. Two
fundamentally different models exist for this:

1. **Mirror as `ItemType`** — each mirror is its own `Item` row whose
   `ItemType = "Mirror"` and which carries a `MirrorOfItemId` foreign
   key pointing at the "real" item. This was the model used in early
   sketches.
2. **Mirror as peer-group relation** — every `Item` carries an
   optional `PeerGroupId`; rows sharing a `PeerGroupId` are mirrors of
   each other; **none** of them is privileged. There is no "real" item
   and no "mirror" item — there is a *peer group*. This is how the
   reference Workflowy product behaves.

The ambiguity caused real downstream pain: cycle detection, detach
semantics, LWW tiebreaks, and the "what happens when only one peer
remains" question all behave differently between the two models. The
project converged on **Model 2** (peer-group) on the date recorded in
`mem://features/mirroring`, but that decision lives only in memory and
in `spec/31-app/01-features/09b-mirror-peer-group-model.md`. Multiple
sister pages (`08-mirror-detach-flow.md`, `09a-mirror-cycle-detection.md`,
`09-mirrors.md`, the AT fixtures, and the share-dialog page) all
**assume** Model 2 but never anchor it.

Without a binding ADR, a future contributor reading only `spec/` could
re-introduce Model 1 — which would silently break the detach-dissolves-
singleton invariant and the LWW tiebreak rule.

## Decision

A "mirror" in WorkFlowy **MUST** be implemented as a **peer-group
relation** over the singular `Item` table. There is **no** `Mirror`
`ItemType` and **no** `MirrorOf*` foreign key.

**Allowed (load-bearing):**

- **Schema:** `Item.PeerGroupId : NULL | TEXT`. Rows sharing a non-null
  `PeerGroupId` form a single peer group. `NULL` means the row has no
  mirrors.
- **Symmetry:** every member of a peer group is **equal**. There is no
  "original" / "mirror" distinction. Edits to `Title`, `Content`, or
  child structure propagate **bidirectionally** to all peers in the
  group.
- **Group membership change ("attach"):** moving an `Item` into an
  existing peer group is `UPDATE Item SET PeerGroupId = $existingGroupId
  WHERE ItemId = $newMember`. Creating a brand-new mirror pair is
  `UPDATE Item SET PeerGroupId = $freshGroupId` for **both**
  participating items inside the same transaction.
- **Detach:** removing an `Item` from a peer group is
  `UPDATE Item SET PeerGroupId = NULL WHERE ItemId = $detachee`. After
  detach, the **remaining group is re-evaluated**: if the group has
  shrunk to a single member, that singleton is **dissolved** —
  `UPDATE Item SET PeerGroupId = NULL WHERE PeerGroupId = $groupId` —
  because a "group of one" is not a peer group, it is a regular item.
- **Cycle prevention:** before any structural mutation that would place
  group `G_a` inside an item belonging to group `G_a` (transitively),
  the operation **MUST** fail with `ENF-MIRROR-CYCLE` per
  `spec/31-app/01-features/09a-mirror-cycle-detection.md`.
- **Conflict resolution (LWW tiebreak):** when two peers receive
  conflicting edits during offline replay, the edit with the larger
  `(UpdatedAtUtc, ActorUserId)` tuple wins. `UpdatedAtUtc` is the
  primary key; `ActorUserId` lexicographic compare is the deterministic
  tiebreak when timestamps are equal to the millisecond.
- **Identity stability:** `Item.ItemId` is **not** rewritten by attach
  or detach. Mirrors share content state; they do not share row
  identity. References (`ParentItemId`, `Permission.ItemId`,
  `Activity.ItemId`) remain valid through both attach and detach.

**Forbidden without superseding ADR:**

- A `Mirror` value in the `ItemType` enum (or any equivalent
  discriminator).
- A `MirrorOfItemId`, `OriginalItemId`, `PrimaryPeerId`, or any other
  column that privileges one peer over the others.
- A `Mirror` table separate from `Item` (the relation **is** the
  `PeerGroupId` column; no separate row exists for the mirror itself).
- "Group of one" as a persisted state — every mutation that would
  leave a group with one member **MUST** dissolve the group in the
  same transaction.
- Read-only mirrors (a peer that propagates writes only one way) —
  symmetry is load-bearing.
- Any conflict-resolution rule other than LWW-on-`(UpdatedAtUtc,
  ActorUserId)`. CRDTs, OT, last-mutator-wins-without-tiebreak, and
  manual-merge prompts are all out of scope until a superseding ADR.

**Migration constraint:** any change to the model above MUST be
ratified by a new ADR that supersedes this one and that enumerates
every gate, workflow page, AT, and migration that needs re-anchoring.

## Consequences

**Positive**

- Closes the highest-risk hallucination surface in the system.
  Generative AI reading only `spec/` no longer has the option to
  reinvent Model 1 (Mirror-as-ItemType) and silently break detach,
  cycle detection, and LWW.
- Aligns the spec with the reference Workflowy product behaviour —
  matches user expectations for "a real mirror, not a shortcut".
- Anchors the workflow pages (`08-mirror-detach-flow.md`,
  `09a-mirror-cycle-detection.md`, `09b-mirror-peer-group-model.md`)
  and the AT fixtures to a single ADR. Sister pages can cite ADR-0005
  instead of repeating the model description.
- Symmetric with ADR-0001 (singular DDL): the relation lives as a
  column on the singular `Item` table, no plural-DDL drift.

**Negative**

- LWW with a deterministic tiebreak is the simplest defensible rule
  for offline replay, but it **does** silently lose data in the
  conflict case (the loser's edit is overwritten without a merge
  prompt). We accept this for outliner-shaped data where edit
  granularity is small and conflicts are rare; a richer CRDT model
  would need its own ADR.
- The dissolve-singleton rule means detach is **not** symmetric with
  attach: attach grows the group by one; detach can either shrink the
  group by one *or* dissolve the entire group, depending on the post-
  detach size. UI must reflect both outcomes.
- Cycle detection runs before every structural mutation in or near a
  peer group; for deep trees this is O(depth × group-size). We accept
  this cost — alternatives (denormalised path strings, materialised
  closure tables) trade query cost for write complexity that's
  harder to keep correct under offline replay.
- The "no privileged peer" rule means there is no canonical sort
  order across peers — UI surfaces that need to pick one (e.g. the
  first peer in a search result) must have their own deterministic
  rule (typically: lexicographic on `ItemId`).

## Alternatives Considered

1. **Mirror as `ItemType` with `MirrorOfItemId` FK** (Model 1) —
   rejected. Privileges one peer ("the original") arbitrarily;
   deleting the original requires re-pointing every mirror, which
   creates a write-amplification storm and a "what's the new
   original?" question with no good answer. Detach has no obvious
   meaning when there's a designated original. Cycle detection
   becomes harder, not easier.
2. **CRDT-backed shared content** (Yjs / Automerge style) —
   rejected. Library footprint is large for an outliner whose edit
   granularity is line-level; offline replay queue (FIFO over the
   REST envelope of ADR-0004) is incompatible with CRDT op-streams
   without significant adapter work. Reconsider in a future ADR if
   conflict-loss complaints become load-bearing.
3. **Operational Transformation** — rejected. Same incompatibility
   with the FIFO replay model; OT also requires server-side
   transformation logic that complicates the WP-plugin runtime
   (ADR-0002).
4. **Manual conflict prompts on collision** — rejected. Outliners
   are write-heavy and conflict-rare; prompting on every collision
   would frustrate users in the 99% case to placate the 1% case.
5. **"Soft" mirrors that propagate reads but not writes** —
   rejected. Asymmetric semantics surprise users; "this looks like
   a mirror but doesn't behave like one" is a recurring usability
   complaint in competing outliners.
6. **Keep the group on dissolve as a "ghost group" of one** —
   rejected. Persisting groups-of-one bloats the index, breaks the
   "non-null PeerGroupId implies ≥2 peers" invariant that downstream
   queries rely on, and creates a class of UI bugs ("why is this
   item showing the mirror chip?").

## Gates Touched

- **New gates:** `(none — this ADR ratifies pre-existing gates)`
- **Modified gates (now load-bearing via this ADR):**
  - `G-MIRROR-NO-ITEMTYPE` — the `ItemType` enum MUST NOT contain
    a `Mirror` member. Spec-hygiene scan over
    `spec/20-enums-index.md` enforces this.
  - `G-MIRROR-PEER-COLUMN` — `Item.PeerGroupId` is the only
    mirror-relation column; no `MirrorOf*` / `OriginalItemId` /
    `PrimaryPeerId` may exist in DDL.
  - `G-MIRROR-DISSOLVE-SINGLETON` — every detach workflow MUST
    include the dissolve-singleton step in the same transaction.
  - `G-MIRROR-LWW-TIEBREAK` — every conflict-resolution code path
    cites the `(UpdatedAtUtc, ActorUserId)` tuple. Other tiebreaks
    fail spec hygiene.
  - `G-MIRROR-CYCLE-PRECHECK` — every structural mutation that
    crosses a peer-group boundary runs the cycle check from
    `09a-mirror-cycle-detection.md` before commit.
- **Endpoints locked:**
  - `EP-MIRRORS-ATTACH` — writes `PeerGroupId` on the new member;
    transactional.
  - `EP-MIRRORS-DETACH` — writes `PeerGroupId = NULL` on the
    detachee, then conditionally dissolves the residual singleton.
  - `EP-MIRRORS-LIST` — reads peers by `PeerGroupId` join.
  - **No `EP-MIRRORS-PROMOTE` / `EP-MIRRORS-SET-PRIMARY` /
    `EP-MIRRORS-MAKE-ORIGINAL`** — these would imply a privileged
    peer and are forbidden by this ADR.
- **DDL identifiers locked:**
  - `Item.PeerGroupId : NULL | TEXT` (column on the singular
    `Item` table per ADR-0001).
  - **No `Mirror` table.** **No `MirrorOf*` columns.** **No
    `Mirror` ItemType.**
- **Convention pages anchored:**
  - `spec/31-app/01-features/09-mirrors.md` (overview)
  - `spec/31-app/01-features/09a-mirror-cycle-detection.md`
  - `spec/31-app/01-features/09b-mirror-peer-group-model.md`
    (the canonical model description; this ADR ratifies it)
  - `spec/31-app/02-workflows/08-mirror-detach-flow.md`
  - `spec/31-app/02-workflows/09-mirror-create-flow.md`
  - `spec/31-app/01-features/08b-sharing-mirror-interaction.md`
  - All AT fixtures referencing `AT-MIRROR-*` and `AT-MPG-*`.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` — first formal record of the mirror
  model decision; the prior `mem://features/mirroring` core memory
  rule and the prose in `09b-mirror-peer-group-model.md` are now
  subordinate to this ADR.
- **Superseded-By:** `(none)`
