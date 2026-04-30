# Endpoints — 04 Page Content Area

## Database Routing

**Read:** App DB (per-workspace; one SQLite file per workspace) — `Items` (current page subtree).
**Write:** App DB (per-workspace; one SQLite file per workspace) — `Items` (content edits, item-type changes).
**Cross-page navigation:** loader reads next page from App DB via the loader↔queue contract (ADR-0023).

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/04-page-content-area.md`](../01-features/04-page-content-area.md)

---

## Summary

**No server endpoints — pure rendering layer.**

The recursive item rendering area uses only:

- `EP-ITEMS-LIST` (paginated children, max 250 per L4)
- `EP-ITEMS-GET` (lazy-load on expand)
- SSE channel `item:{focusedId}` for live updates ([`./14-concurrency-and-sync.md`](./14-concurrency-and-sync.md))

---

## Why no endpoints

The page content area is a rendering view over the item tree. All mutations route through the CRUD endpoints in [`./01-information-model.md`](./01-information-model.md) and the bulk endpoints in [`./12-multi-select.md`](./12-multi-select.md).

---

## Cross-References

| Topic | Link |
|-------|------|
| Rendering rules | [`../01-features/04-page-content-area.md`](../01-features/04-page-content-area.md) |
| 250-item virtualization cap | `mem://architecture/data-model` |
