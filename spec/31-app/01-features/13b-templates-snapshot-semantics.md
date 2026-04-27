# 13b — Templates: Snapshot Semantics (Clarification)

**Version:** 1.0.0
**Status:** Approved — 2026-04-27
**Supersedes:** Ambiguity in `13-templates.md` §Instantiation
**Owner:** Product
**Decision context:** Batch 4 clarifications, AI-readiness round 4

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
