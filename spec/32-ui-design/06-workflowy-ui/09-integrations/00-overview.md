# Phase 9 — Email-to-Workflowy 🚫 DEFERRED

> **Status:** 🚫 Deferred (post-v1, stub spec only)
> **Parent:** [`../00-overview.md`](../00-overview.md)
> **Screenshots:** img-54
> **Target files:** `01-email-to-wf.md` (stub)

## Scope (stub)
Per-node inbound email addresses with allow-list. Implementation post-v1.

## Blocker D-1 Resolution (2026-04-23, UTC+8)
**LinkedIn integration scope** is **deferred to post-v1** alongside Phase 9. When revisited, the chosen direction is **read-only profile import** (no OAuth posting) to keep the runtime-agnostic constraint intact and avoid coupling to any specific backend. Re-open this blocker only when the backend runtime (mem://constraints/backend-runtime-deferred) is chosen.

---

## Related

- [`../00-overview.md`](../00-overview.md) — Workflowy UI parent
- [`../06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Inbox special node (email destination)
