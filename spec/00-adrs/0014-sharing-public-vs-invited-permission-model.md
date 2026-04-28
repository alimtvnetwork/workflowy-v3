# ADR-0014: Sharing — public link + invited-user model, 5-role item ACL, separate-table role storage, per-instance mirror ACL

## Status

`Accepted` — 2026-04-28

## Context

Sharing in WorkFlowy is the load-bearing trust boundary of the entire
product. Every read, every write, every mirror traversal MUST be
gated by an effective-role resolution that the user cannot escape.
The shape of that resolution — which roles exist, where they are
stored, how they cascade, and how they interact with mirror peers —
is the single largest privilege-escalation surface in the spec.

Today the policy is split:

- **Memory** — `mem://features/sharing-model` (single source for the
  AI agent: 5-role enum, separate-table requirement, per-instance
  mirror ACL).
- **Feature SSOT** — `spec/31-app/01-features/15-roles-and-permissions.md`
  (capability matrix, ancestor-walk resolver, two-DB split, AT-ROLES-*
  tests, edge cases).
- **Mirror × sharing SSOT** — `spec/31-app/01-features/08b-sharing-mirror-interaction.md`
  v1.0.0 (per-instance ACL keyed by `ItemId`).
- **System prompt** — *"Roles MUST be stored in a separate table.
  Absolutely do not store roles on the profile or users table. This
  will lead to privilege escalation attacks and must be avoided at
  all costs."*

Without a dedicated ADR, an AI generating a new sharing-adjacent
feature could legitimately:

- Add a 4th item-role tier (`Comment`) — already deferred in
  `15-roles-and-permissions.md` line 376 but not ADR-locked.
- Store the role on `User.role` or `Profile.role` (the canonical
  privilege-escalation pattern).
- Key `Permission` rows by `PeerGroupId` instead of `ItemId`,
  silently leaking sharing of one peer to all peers in the group.
- Cascade public-link visibility into private grants ("we already let
  the world see it, why not elevate Edit").
- Allow the workspace `Owner` to be revoked rather than transferred
  (self-orphaning the workspace).

P61 closes this gap.

## Decision

### D1 — Two channels: public link + invited user

Sharing has exactly **two** ingress channels, no others:

1. **Public link** — a unique URL that grants `PublicView` (read-only)
   to any unauthenticated visitor. Toggled per share root by the
   `Owner` only.
2. **Invited user** — an explicit grant on `(ItemId, GranteeUserId,
   ItemRole)` rows in `ItemShare`. Invitation MAY be by email
   (pending until the invitee signs in for the first time, at which
   point the grant materialises).

Embed widgets, signed temporary tokens, IP-allowlist sharing, and
SAML-mapped group sharing are **out of scope** in v1 (require
superseding ADR).

### D2 — 5-role item ACL enum (fixed)

`ItemRole` is a closed enum of exactly **5** values:

| Role | Capability summary |
|---|---|
| `Owner` | Implicit role of the item creator. Full control + ownership transfer + hard delete. |
| `Admin` | All `Edit` rights + manage other grantees + revoke access. Cannot transfer ownership. Cannot toggle public link. |
| `Edit` | Read + modify content/note + add/remove children + complete todos. Cannot re-share, cannot delete the share root, may move only **within** the shared subtree. |
| `View` | Read-only. No comments, no edits, no shares. |
| `PublicView` | Anonymous read-only via public link. Strictly read-only. NEVER inherits any other role. |

A 4th tier (`Comment`) is **explicitly deferred** per
`15-roles-and-permissions.md` §"Open Questions" and requires a
superseding ADR.

The full capability matrix lives in
`15-roles-and-permissions.md` §Capability Matrix; that table is the
SSOT cell-by-cell. Implementations MUST reproduce it byte-for-byte.

### D3 — Workspace roles are a separate, smaller enum

`WorkspaceRole` is a closed enum of exactly **3** values:
`Owner` (exactly one per workspace), `Admin`, `Member`.

`WorkspaceRole` and `ItemRole` are **distinct** enums (note the
`Owner` and `Admin` overlap is name-only — they live in different
tables and are resolved separately). Conflating them is forbidden.

### D4 — Roles MUST live in separate tables, never on User/Profile

This is the load-bearing privilege-escalation guard:

- **Workspace roles** MUST live in `WorkspaceMember(UserId,
  WorkspaceId, WorkspaceRole)` in the **Root DB**.
- **Item roles** MUST live in `ItemShare(ItemId, GranteeUserId,
  ItemRole, GrantedAt)` in the **App DB** (per workspace).
- A `role` / `roles` / `isAdmin` / `permissions` column on `User`,
  `Profile`, or any auth-identity table is **strictly forbidden**.

Rationale: storing roles on the user row means any code path that
loads a user object loads its privileges, which trivially escalates
via "update your own profile" endpoints. The separate-table model
forces every privilege check to go through the dedicated resolver
(D6) rather than reading a field.

### D5 — Two-DB authorization, no cross-DB joins

The resolver MUST execute as **two separate queries**, never joined:

1. **Root DB** — fetch `WorkspaceMember.WorkspaceRole` for
   `(actorUserId, workspaceId)`. If `Owner` / `Admin`, authorise
   immediately.
2. **App DB** — if step 1 was `Member` (or absent), walk ancestors
   via `ParentItemId` and resolve the **highest** `ItemRole` in
   `ItemShare` along the path.

Cross-DB joins are **forbidden** (the two databases may live in
different storage layers per
`spec/05-split-db-architecture/`). Keeping them separate is what
makes the model portable and what enforces D4 at the schema level.

### D6 — `resolveEffectiveRole()` is the sole authorization entry point

Every read, write, share, comment, mirror-create, and trash operation
MUST resolve its actor's effective role via a single
`resolveEffectiveRole(actorId, itemId, workspaceId)` function.
Bypassing the resolver — reading raw `ItemShare` rows from a handler,
checking `actorWorkspaceRole === 'Admin'` directly, etc. — is a hard
violation of `G-15-RESOLVER-SOLE-ENTRY`.

The resolver MUST honour these semantics:

- **Cascade:** A grant on `X` applies to `X`'s entire subtree.
- **Higher-permission wins:** If user U has `View` on `X` and `Edit`
  on descendant `Y`, U has `Edit` on `Y`.
- **Share root non-deletable by grantees:** A user with `Edit` on
  `X` cannot delete `X`, only its descendants.
- **Public link non-cascading across grants:** Toggling public link
  on `X` makes `X` + subtree publicly viewable but does NOT elevate
  any private grant from `View` to `Edit`.
- **`Owner` is permanent until transfer:** Removal of the workspace
  `Owner` is impossible; only `transfer ownership` swaps the role
  atomically.
- **Auth fallback on item-grant absence:** If no `ItemShare` row
  exists along the ancestor chain for `actorUserId`, fall back to the
  workspace role from step 1 of D5.

### D7 — Per-instance mirror ACL (keyed by `ItemId`, not `PeerGroupId`)

Per ADR-0005 (mirror peer-group model): mirror peers are independent
`Item` rows that share a `PeerGroupId`. The sharing model honours
this by keying `ItemShare` rows on **`ItemId`**, never on
`PeerGroupId`.

Concrete consequences:

- Sharing peer P₁ does **NOT** expose peers P₂…Pₙ to the grantee.
  The grantee sees only the peer they were granted on, with its own
  breadcrumb.
- **Content edits propagate** across all peers (peer-group sync per
  ADR-0005), regardless of which peer the editor was granted on.
- **Position / parent / ACL edits affect only the edited peer** —
  these are per-instance and do not cross peer-group boundaries.
- **Detach preserves the detached peer's ACL** — when a peer leaves
  its peer-group (per ADR-0005 D-detach), its `ItemShare` rows stay
  attached to that `ItemId`.
- **`PublicShareLink` is also per-instance** — toggling on P₁ makes
  P₁'s subtree publicly viewable but does NOT make P₂…Pₙ publicly
  viewable.

### D8 — Revocation propagates within 60 s

A `share:revoked` event MUST invalidate every active session for the
revoked grantee within **60 seconds** (per
`15-roles-and-permissions.md` §Realtime Propagation). Stale tokens
held by the revoked grantee MUST fail validation on the next request
and the client MUST redirect to the share-revoked screen.

This SLA is load-bearing: longer windows turn revocation into a
"soft" operation that exfiltration can outrun. Shorter windows are
permitted; longer ones are forbidden.

### D9 — Default visibility is **private**

Newly-created items MUST default to **private** — no public link,
no `ItemShare` rows beyond the implicit `Owner` grant. There is no
"share by default", no "discoverable workspace", and no
"organization-wide auto-grant" in v1. Any future feature that creates
a default grant requires a superseding ADR.

### D10 — Out of scope (v1)

Deferred (require a superseding ADR before introduction):

- `Comment` role (a 4th item-role tier between `View` and `Edit`).
- Time-bounded grants ("expires in 7 days").
- IP-allowlisted public links.
- SAML/SCIM group sharing.
- Per-grant audit log surfaced to grantees.
- Free-tier collaborator quota mechanics (referenced by
  `08-share-dialog.md` §AT-SHARE-13 but not ADR-locked yet).

## Consequences

### Positive

- **Privilege-escalation surface anchored.** D4's separate-table
  rule + D6's sole-entry resolver are now ratified; an AI cannot
  silently move roles onto `User` or skip the resolver.
- **Mirror × sharing leak closed.** D7 makes "share one peer, leak
  all peers" structurally impossible by binding ACL to `ItemId`.
- **Two-DB portability preserved.** D5's no-join rule keeps the
  Root-DB / App-DB split (per `spec/05-split-db-architecture/`)
  viable across any storage layer the project might pick.
- **Revocation has teeth.** D8's 60 s SLA makes revocation a real
  security primitive, not a cosmetic UI action.

### Negative

- **No cross-tenant convenience joins.** Some admin tooling that
  would naturally `JOIN ItemShare ON User.id` must be split into two
  queries. Acceptable cost — the same rule is what blocks the
  privilege-escalation class.
- **5-role rigidity.** Product feedback occasionally asks for a
  `Comment` tier; D10 keeps it explicitly deferred rather than
  bolted on ad-hoc.

## Alternatives Considered

1. **Single `Role` enum across workspace and item levels** —
   rejected: `Owner`/`Admin` mean different things at workspace vs
   item level (workspace `Admin` can manage billing; item `Admin`
   cannot toggle public link). Conflating them in one enum invites
   the exact authorisation bugs the resolver is designed to
   prevent.
2. **Role column on `User` table** — rejected: this is the canonical
   privilege-escalation pattern. Any "update profile" endpoint
   becomes a privilege-escalation primitive. D4 forbids it
   structurally.
3. **`PeerGroupId`-keyed `ItemShare`** — rejected: would mean
   sharing one peer of a mirror group exposes all peers (a real
   info-leak hazard in shared workspaces). D7 binds ACL to
   `ItemId` precisely to prevent this.
4. **Public link auto-elevates to `View` for signed-in users** —
   rejected: silent grant promotion violates the principle of least
   surprise and turns "make link public" into a hidden permission
   change. D6's "public link non-cascading across grants" semantics
   forbid it.

## Gates Touched

- `G-15-ROLE-ENUM-CLOSED` — enforces D2 + D3 (5 item roles + 3
  workspace roles; 4th item-role tier requires superseding ADR).
- `G-15-ROLES-SEPARATE-TABLE` — enforces D4 (no `role` /
  `permissions` column on `User` / `Profile` / any auth-identity
  table).
- `G-15-NO-CROSS-DB-AUTH-JOIN` — enforces D5 (Root DB and App DB
  queried separately; cross-DB joins forbidden).
- `G-15-RESOLVER-SOLE-ENTRY` — enforces D6 (every privilege check
  goes through `resolveEffectiveRole()`; raw `ItemShare` reads in
  handlers forbidden).
- `G-15-CASCADE-AND-WIN-RULES` — enforces D6's cascade,
  higher-permission-wins, share-root-undeletable, public-link
  non-cascading, and Owner-permanence semantics.
- `G-15-MIRROR-ACL-PER-INSTANCE` — enforces D7 (`ItemShare` keyed
  by `ItemId`, never `PeerGroupId`; detach preserves ACL;
  `PublicShareLink` per-instance).
- `G-15-REVOKE-60S-SLA` — enforces D8 (revocation propagates within
  60 s; stale tokens fail next request).
- `G-15-DEFAULT-PRIVATE` — enforces D9 (no implicit grants beyond
  `Owner` on new items).

All eight gates are formally **anchored** by this ADR. Their
enforcement contracts live in
`spec/31-app/01-features/15-roles-and-permissions.md`,
`spec/31-app/01-features/08b-sharing-mirror-interaction.md`,
`spec/31-app/01-features/08-share-dialog.md`, and
`spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none — refines `15-roles-and-permissions.md` and
  `08b-sharing-mirror-interaction.md` by promoting their invariants
  to ADR-bound).
- **Superseded-By:** (none).
