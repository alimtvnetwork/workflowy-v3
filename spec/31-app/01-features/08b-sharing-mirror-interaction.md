# 08b — Sharing × Mirror Interaction (Clarification)

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Status:** Approved — 2026-04-27
> **Supersedes:** Ambiguity in `08-share-dialog.md` §Mirror interaction
> **Owner:** Product
> **Decision context:** Batch 4 clarifications, AI-readiness round 4

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

## Component Contract

- **Storage:** `Permissions` table — composite key `(ItemId, GranteeId)`.
- **Mutation hook:** `useShareStore.grant()` / `useShareStore.revoke()` — per-instance, never group-wide.
- **Sync source:** content fan-out reuses the existing peer-group propagation in `09b-mirror-peer-group-model.md`; this addendum adds **no new code surface** beyond per-instance ACL semantics.
