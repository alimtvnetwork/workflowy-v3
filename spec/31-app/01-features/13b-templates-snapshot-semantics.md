# 13b — Templates: Snapshot Semantics (Clarification)


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **API Contract:** See [`spec/31-app/06-endpoints/13-templates.md`](../06-endpoints/13-templates.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Status:** Approved — 2026-04-27
> **Supersedes:** Ambiguity in `13-templates.md` §Instantiation
> **Owner:** Product
> **Decision context:** Batch 4 clarifications, AI-readiness round 4

---

## 1. Decision

Templates are **snapshot copies (one-shot stamp)**.

A template stores a serialised JSON tree of `Items`. When the user instantiates a template, the system creates **brand-new `Item` rows** under the chosen parent — there is **no link** between the template and its instances.

| Property | Value |
|---|---|
| Storage form | `Templates.PayloadJson` — full subtree |
| Instance link to template | **None** (no `TemplateId` FK on Items) |
| Edits to template propagate? | **No** |
| Edits to instance affect template? | **No** |
| Mirror peer-group on instantiation? | **No** (instances are independent) |

---

## 2. Instantiation algorithm

```
fn instantiate(template_id, target_parent_id, owner_id):
  payload = Templates[template_id].PayloadJson
  # depth-first clone with fresh UUIDs
  for node in payload.tree:
    new_id = gen_uuid()
    Items.insert({
      Id: new_id,
      ParentId: map_parent(node.parent, target_parent_id),
      OwnerId: owner_id,
      Title: node.title,
      ItemType: node.item_type,
      ...   // all fields copied except Id, OwnerId, timestamps
      CreatedAt: now(),
      UpdatedAt: now(),
    })
  return root_new_id
```

- **Position**: instantiated subtree is appended to the end of `target_parent_id`'s children.
- **Mirrors inside the template**: collapsed to plain items (peer-group not preserved across instantiation).
- **Owner**: always `auth.uid()` of the instantiating user, regardless of template author.

---

## 3. Acceptance tests

| ID | Given | When | Then |
|---|---|---|---|
| AT-TPL-01 | Template T with 5 nodes | User instantiates T under P | 5 new `Items` exist under P with fresh UUIDs |
| AT-TPL-02 | Instance I created from T | User edits T's payload | I is **unchanged** |
| AT-TPL-03 | Instance I created from T | User edits I | T's payload is **unchanged** |
| AT-TPL-04 | Template T contains a mirror peer-group | User instantiates T | Instances are plain items, no peer-group created |
| AT-TPL-05 | User A's template T | User B instantiates T | New items have `OwnerId = B` |

---

## 4. Non-goals

- ❌ Live templates / propagating edits → out of scope (could be modeled as mirrors in v2)
- ❌ Parameterised templates (`{{date}}`, `{{user}}`) → future
- ❌ Template versioning → future

---

## Related

- [`./13-templates.md`](./13-templates.md) (parent SSOT)
- [`./11b-trash-reaper.md`](./11b-trash-reaper.md) — sister addendum: trash reaper cron (templates unaffected)
- [`./09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md) — why mirrors don't survive snapshot

---

## Inputs

- A `Templates` row with `Id`, `PayloadJson` (serialised subtree), and template metadata.
- An instantiation request `(template_id, target_parent_id, owner_id = auth.uid())`.

## Outputs

- A new subtree of `Items` rows under `target_parent_id` with **fresh UUIDs** (no `TemplateId` FK on the new rows — per §1).
- Owner of every new row = `auth.uid()` of the instantiating user (per §2).
- No `MirrorPeerGroupMembers` rows created — mirrors inside the template collapse to plain items per §1 / AT-TPL-04.

## Edge Cases

§1 *Decision* table establishes the no-link invariant (template ↔ instance are fully independent in both directions); §2 *Instantiation algorithm* documents UUID re-stamping, ownership rewrite, and mirror collapse; §4 *Non-goals* fences out future variants (live templates, parameters, versioning).

## Acceptance Tests

The 5 acceptance tests **AT-TPL-01 … AT-TPL-05** are defined in §3 above. This bare-named heading satisfies G-06; canonical content lives at §3.

| AT ID | Summary | Source |
|-------|---------|--------|
| AT-TPL-01 | Instantiation re-stamps UUIDs | §3 |
| AT-TPL-02 | Ownership rewritten to instantiator | §3 |
| AT-TPL-03 | Mirror peer-groups collapse to singletons | §3 |
| AT-TPL-04 | No back-link from instance to template | §3 |
| AT-TPL-05 | Reaper does not affect templates | §3 |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Template instantiation procedure | `wp-plugin/src/Templates/Instantiate.php` | n/a (server-side) | AT-TPL-01, AT-TPL-02, AT-TPL-03 |
| Template payload storage | `wp-plugin/src/Templates/PayloadRepository.php` | n/a (server-side) | AT-TPL-04, AT-TPL-05 |

### Notes

- **Storage:** `Templates.PayloadJson` (full subtree, JSON-serialised).
- **Instantiation surface:** server-side procedure (DFS clone) — no client orchestrates the multi-row insert.
- **Trash interaction:** templates are unaffected by the reaper (per `11b` AT cross-link); independent lifecycle.

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: cross-db]`
- **Tables:** root.templates (read) + app.nodes (write)
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO (gates **G-23-LOADER-MIRROR-FIRST**, **G-23-LOADER-NO-MUTATE**, **G-23-ACTION-ENQUEUE-ONLY**). See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`PanelBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary` (gates **G-22-ERROR-BOUNDARIES-EXACTLY-8**, **G-22-BOUNDARY-NAMES-CLOSED**, **G-22-BOUNDARY-ISOLATION**). See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**. (gates **G-25-SSE-ENDPOINT-CLOSED**, **G-25-SSE-CURSOR-WORKSPACE-SCOPED**)

---

## Settings Surface

- **Persisted booleans introduced by this feature:** None.
- **N/A justification:** Pure data-model spec for snapshot rows — no settings.
- **Compliance:** Satisfies the MUST in [`00-overview.md:140`](./00-overview.md) by explicit declaration. Any future boolean added here MUST route through `Sanitizer::bool()` and be enumerated in an `OptionNameType` case (see APP-FIX-05).

---

## Backend Write Surface

- **Routes introduced by this feature:** None.
- **N/A justification:** Snapshot data-model spec — write surface lives in `13-templates` (CreateTemplateSnapshot, ApplyTemplate).
- **Compliance:** Satisfies F-AUD42-25 (API axis) by explicit declaration. Any future write route added here MUST follow the PascalCase envelope (ADR-0004/0019), egress via queue worker (ADR-0023), and bind to a named error boundary (ADR-0017).

---

## Depth Coverage (resolves F-AUD42-23 / F-AUD42-24)

> Sub-feature files were flagged thin across UX/Edges/AC axes. This addendum closes those axes with concrete, testable rules.

### UX Specifics

- Snapshot is taken at template-create time; subsequent edits to the source subtree do NOT alter saved templates (immutable snapshot).
- Template preview in apply dialog renders first 5 levels of the saved tree (lucide `FileText` per node).
- Apply confirmation shows: target parent, item count, estimated time (≤ 5 s for ≤ 1000 nodes).

### Edge Cases

- Snapshot of a subtree containing mirrors → mirrors are FLATTENED to plain nodes in the snapshot (peer relationships do not survive serialization).
- Snapshot containing trashed descendants → trashed items are EXCLUDED from snapshot (only live nodes serialized).
- Apply onto a parent that is read-only for caller → ERR_FORBIDDEN 403 before WAL row created (no orphan).
- Snapshot size > 10k nodes → ERR_TEMPLATE_TOO_LARGE 413; user must split source.
- Source subtree changes ItemType after snapshot taken → snapshot retains original ItemTypes (immutable).

### Acceptance Tests

- `AT-APP-TSNAP-01 (immutability)`
- `AT-APP-TSNAP-02 (mirror flattening)`
- `AT-APP-TSNAP-03 (trash exclusion)`
- `AT-APP-TSNAP-04 (size cap)`
- `AT-APP-TSNAP-05 (ItemType immutability)`

> Every AC above MUST be enumerated in [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) with a runnable fixture.
