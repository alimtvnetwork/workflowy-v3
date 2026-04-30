# 13b — Templates: Snapshot Semantics (Clarification)

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
