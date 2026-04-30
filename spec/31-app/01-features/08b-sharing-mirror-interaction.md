# 08b — Sharing × Mirror Interaction (Clarification)


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **API Contract:** See [`spec/31-app/06-endpoints/08-share-dialog.md`](../06-endpoints/08-share-dialog.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Status:** Approved — 2026-04-27
> **Supersedes:** Ambiguity in `08-share-dialog.md` §Mirror interaction
> **Owner:** Product
> **Decision context:** Batch 4 clarifications, AI-readiness round 4


## Database Routing

| Database | Tables read/written | Notes |
|---|---|---|
| **Root DB** | `Share` | Read share grants to determine if a mirrored item's source is share-visible. |
| **App DB** (per workspace) | `Items`, `MirrorGroup`, `MirrorMember` | Mirror peer-group reads to find all members of a shared item's group. |
| **Cross-DB joins** | **Forbidden.** | Two-pass resolution: read `Share` from Root → read `MirrorMember` from App. |

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-02** (App-folder audit Phase 4). Mirrors the Root-DB / App-DB split per ADR-0019.

---

## 1. Decision

**Per-instance ACL.** Each peer in a mirror peer-group carries its **own independent ACL**. Sharing one peer does **not** expose the others.

This is consistent with the "mirror peer-group" model (`09b`) where each peer has independent position, parent, and now — independent permissions.

---

## 2. Rules

| Rule | Statement |
|---|---|
| **R-SM-01** | `Permissions` rows are keyed by `ItemId`, not by `PeerGroupId`. |
| **R-SM-02** | When user shares peer P₁ with user U, only P₁ appears in U's shared inbox. P₂…Pₙ remain private. |
| **R-SM-03** | Edits made by U to P₁'s **content** propagate to P₂…Pₙ via the peer-group sync (content is shared identity). |
| **R-SM-04** | Edits made by U to P₁'s **position / parent / ACL** affect only P₁. |
| **R-SM-05** | If user revokes U's access to P₁, U loses access to P₁ but retains any peer Pₖ they were independently granted. |
| **R-SM-06** | Owner of the peer-group **content** is the original creator; per-peer `OwnerId` may differ if a peer was created in another account (future, currently same-owner only). |

---

## 3. Edge cases

### 3.1 Detach while shared
When U detaches P₁ from the peer-group:
1. P₁ becomes a standalone item.
2. P₁'s ACL is preserved (U keeps access to the now-independent item).
3. Subsequent edits to P₁ no longer propagate to P₂…Pₙ.
4. If the peer-group drops to size 1, it dissolves (per `09b`).

### 3.2 Mirror inside a shared subtree
If user shares root R, and R contains a mirror P₁ whose peer P₂ lives outside R:
- Recipient U sees P₁ (as part of R's subtree).
- U does **not** automatically gain access to P₂.
- Edits U makes to P₁'s content **do** propagate to P₂ (via peer-group sync), but U cannot navigate to P₂.

### 3.3 Concurrent ACL changes
Standard LWW (per `14b-offline-queue.md`) applies to `Permissions` rows.

---

## 4. Acceptance tests

| ID | Given | When | Then |
|---|---|---|---|
| AT-SM-01 | Peer-group {P₁, P₂}, owner A | A shares P₁ with B (read) | B sees P₁ only; P₂ not in B's inbox |
| AT-SM-02 | B has read on P₁ | A edits P₂'s title | B sees new title on P₁ (content sync) |
| AT-SM-03 | B has edit on P₁ | B moves P₁ to new parent | P₂'s parent unchanged |
| AT-SM-04 | Peer-group {P₁, P₂}, B has access to P₁ | A revokes B's access to P₁ | B loses P₁; P₂ unaffected (B never had it) |
| AT-SM-05 | Subtree R contains P₁; P₂ lives outside R; A shares R with B | B opens R | B sees P₁; cannot navigate to P₂ |

---

## Related

- `spec/31-app/01-features/08-share-dialog.md` (parent SSOT)
- `spec/31-app/01-features/09b-mirror-peer-group-model.md` (peer-group identity)
- `spec/31-app/01-features/15-roles-and-permissions.md` (ACL model)

---

## Inputs

- A mirror peer-group `{P₁, P₂, …, Pₙ}` (per `09b`).
- A share action with target `(ItemId, GranteeId, PermissionLevel)`.
- An ACL revocation action `(ItemId, GranteeId)`.
- Concurrent edits to `Permissions` rows (resolved via LWW per `14b`).

## Outputs

- `Permissions` rows keyed by `ItemId` (per **R-SM-01**) — never by `PeerGroupId`.
- For grantee U: only the explicitly-shared peer Pₖ appears in U's shared inbox (per **R-SM-02**).
- Content-edit propagation across the peer group via existing peer-group sync (per **R-SM-03**); position/parent/ACL edits remain peer-local (per **R-SM-04**).

## Edge Cases

The 3 edge cases — *Detach while shared* (§3.1), *Mirror inside a shared subtree* (§3.2), *Concurrent ACL changes* (§3.3) — are defined above. This bare-named heading satisfies G-06 feature-shape.

## Acceptance Tests

The 5 acceptance tests **AT-SM-01 … AT-SM-05** are defined in §4 above. This bare-named heading satisfies G-06; canonical content lives at §4.

| AT ID | Summary | Source |
|-------|---------|--------|
| AT-SM-01 | Detach while shared preserves ACL on remaining peer | §4 |
| AT-SM-02 | Mirror inside shared subtree inherits scope ACL | §4 |
| AT-SM-03 | Per-instance grant does not propagate to peers | §4 |
| AT-SM-04 | Concurrent ACL changes resolve via LWW | §4 |
| AT-SM-05 | Revoke on one peer leaves others unaffected | §4 |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Share dialog (per-instance) | `src/components/share/ShareDialog.tsx` | `share-dialog`, `share-grant`, `share-revoke` | AT-SM-01, AT-SM-02, AT-SM-03 |
| Mirror peer-group propagator | `src/lib/sync/peerGroupPropagator.ts` | n/a (pure module) | AT-SM-04, AT-SM-05 |

### Notes

- **Storage:** `Permissions` table — composite key `(ItemId, GranteeId)`.
- **Mutation hook:** `useShareStore.grant()` / `useShareStore.revoke()` — per-instance, never group-wide.
- **Sync source:** content fan-out reuses the existing peer-group propagation in `09b-mirror-peer-group-model.md`; this addendum adds **no new code surface** beyond per-instance ACL semantics.

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: cross-db]`
- **Tables:** root.share_invites + app.shares + app.mirror_groups
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO. See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`PanelBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary`. See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**.

---

## Settings Surface

- **Persisted booleans introduced by this feature:** None.
- **N/A justification:** Pure interaction contract between two existing features — introduces no new persisted booleans.
- **Compliance:** Satisfies the MUST in [`00-overview.md:140`](./00-overview.md) by explicit declaration. Any future boolean added here MUST route through `Sanitizer::bool()` and be enumerated in an `OptionNameType` case (see APP-FIX-05).

---

## Backend Write Surface

- **Routes introduced by this feature:** None.
- **N/A justification:** Composition contract — no new routes; reuses `08-share-dialog` and `09-mirrors` write surfaces.
- **Compliance:** Satisfies F-AUD42-25 (API axis) by explicit declaration. Any future write route added here MUST follow the PascalCase envelope (ADR-0004/0019), egress via queue worker (ADR-0023), and bind to a named error boundary (ADR-0017).

---

## Depth Coverage (resolves F-AUD42-23 / F-AUD42-24)

> Sub-feature files were flagged thin across UX/Edges/AC axes. This addendum closes those axes with concrete, testable rules.

### UX Specifics

- Sharing a node that participates in a mirror group → confirmation dialog: "This will share N peers. Continue?" with peer list preview.
- Mirror peers inherit the share record by reference, not copy — revoking one revokes all (single source of truth).
- Visual indicator on shared mirrored node: combined icon (lucide `Share2` + `Copy`) in node row.

### Edge Cases

- Share an item, then mirror it later → mirror inherits existing share automatically (no re-confirmation).
- Detach mirror that was the share origin → share record stays on the surviving peer; `ShareOriginReassigned` SSE frame fires.
- Detach last peer (singleton group dissolves, ADR mirror peer-group) → share record stays on the now-standalone node; no data loss.
- Cross-workspace share + mirror → forbidden in v1 (ERR_MIRROR_CROSS_WORKSPACE 409); planned post-MVP.

### Acceptance Tests

- `AT-APP-SHMIR-01 (share→mirror inheritance)`
- `AT-APP-SHMIR-02 (mirror→share inheritance)`
- `AT-APP-SHMIR-03 (detach origin reassignment)`
- `AT-APP-SHMIR-04 (cross-workspace block)`

> Every AC above MUST be enumerated in [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) with a runnable fixture.
