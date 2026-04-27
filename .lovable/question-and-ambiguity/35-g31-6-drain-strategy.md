# Ambiguity #35 — G-31.6 Island Drain Strategy

**Logged:** 2026-04-27 (post-NO-QUESTIONS-MODE expiration; counter at 40+)
**Task:** F-future-G31e — drain 14 G-31.6 island advisories
**Decision taken:** Allow-list all 14 with rationale; do NOT fabricate peer cross-references.

## The choice

When G-31.6 surfaces a "documentation island" (file with zero in-scope incoming
and zero in-scope outgoing cross-references), there are two cleanup paths:

1. **Author peer cross-references** — link the island to a sibling, and add
   the reciprocal link back. Forces the file into the connected component.
2. **Allow-list with rationale** — add the bare filename to the per-scope
   `*_ISLAND_EXEMPT` Set with an inline comment explaining why no peer link
   is appropriate. G-31.5 enforces the rationale.

## Why allow-list won for all 14

### Features scope (5 islands, all `*b` addendums)

`07b-dashboard-view`, `08b-sharing-mirror-interaction`, `11b-trash-reaper`,
`12b-multi-select-zoom`, `13b-templates-snapshot-semantics` — every one is
an **addendum slice** of a parent SSOT (`*` or `*a` file in the same scope).

The semantic peer of an addendum is its **parent**, not a sibling. The parent
already cites the addendum (that's how G-30 keeps them linked). Forcing two
addendum slices to cross-reference each other would be artificial — they
have no shared subject matter beyond "we both extend a parent SSOT."

### Endpoints scope (9 islands, all UI-surface pages)

`03-layout-structure`, `04-page-content-area`, `05-interactions`,
`06-item-context-menu`, `07-board-view`, `10-today-view`, `12-multi-select`,
`13-templates`, `15-search` — each describes a distinct UI surface.

These pages legitimately cite **out-of-scope** content: features (their
spec source) and db-diagram (their data source). They have no semantic
peer in the endpoints scope. Forcing peer links (e.g., "see also: search"
on `today-view`) would inject false adjacency.

## Why not split G-31.6 into two checks (in-scope vs. cross-scope)?

Considered: a stricter "really island" check could verify that the file has
zero incoming/outgoing links to **any** scope, not just same-scope siblings.
That would surface only files truly orphaned from the entire spec graph.

Rejected for now: G-30 already enforces validity of out-of-scope citations,
and the parent-addendum links exist in markdown form (just not always as
`## Related` H2 sections — they live in body prose). A cross-scope incoming
counter would require a rebuild of the full spec graph, which is out of
G-31's current charter (it's a per-scope cross-sibling reciprocity gate).

If future audits show that an exempted file is also un-cited from any
out-of-scope source, that's a real orphan — would warrant either deletion
or promotion to a parent SSOT. For now, all 14 exempted files are reachable
via parent-citations or features↔endpoints body links.

## Verification

Post-drain runner output:
```
G-31 summary: 4 scope(s) scanned —
  0 ERROR-scope asymmetries,
  0 WARN-scope asymmetries,
  0 island advisory(ies),       ← was 14
  0 heading-drift advisory(ies),
  0 unrationaled exemption entry/entries.
```

All 14 exemption entries carry inline rationale comments → G-31.5 ✅ green.
