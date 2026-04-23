# Phase 9 — Email-to-WorkFlowy & Integrations 🚫 DEFERRED

> **Status:** 🚫 Deferred to post-v1 (spec authored 2026-04-23, implementation gated on backend runtime choice)
> **Parent:** [`../00-overview.md`](../00-overview.md)
> **Screenshots:** img-54
> **Topic files:** `01-email-to-workflowy.md`, `02-linkedin-import.md`, `03-allowlist-security.md`, `97-acceptance-criteria.md`

---

## Scope

Per-node inbound email + read-only LinkedIn profile import. Both are gated on the backend runtime decision (see `mem://constraints/backend-runtime-deferred`); the spec is locked so implementation can begin without re-design.

## Blocker D-1 Resolution (2026-04-23, UTC+8)

**LinkedIn integration scope** is **read-only profile import** only — no OAuth posting, no message sync, no connection graph. Detailed contract in [`02-linkedin-import.md`](./02-linkedin-import.md). Re-open this blocker only if the backend runtime introduces a posting-friendly surface and the user explicitly authorizes scope expansion.

---

## Topic Files

| # | File | Status |
|---|------|--------|
| 1 | [`01-email-to-workflowy.md`](./01-email-to-workflowy.md) | ✅ Spec complete |
| 2 | [`02-linkedin-import.md`](./02-linkedin-import.md) | ✅ Spec complete |
| 3 | [`03-allowlist-security.md`](./03-allowlist-security.md) | ✅ Spec complete |
| 4 | [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) | ✅ Locked contract |

---

## Related

- [`../00-overview.md`](../00-overview.md) — Workflowy UI parent
- [`../06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Inbox special node (email destination)
- [`../08-app-shell/01-app-menu.md`](../08-app-shell/01-app-menu.md) — Settings entry point
