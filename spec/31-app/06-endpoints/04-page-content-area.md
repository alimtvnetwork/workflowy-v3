# Endpoints — 04 Page Content Area

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
