# 02 — LinkedIn Import (Read-Only)

> **Version:** 1.0.0
> **Status:** 🚫 Deferred to post-v1 (Blocker D-1 resolved 2026-04-23)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Decision Recap

Per Blocker D-1 resolution: LinkedIn integration is **read-only profile import** only. **No OAuth posting**, no message sync, no connection graph traversal beyond the authenticated user's own profile.

Rationale:

1. Keeps runtime-agnostic constraint intact (no provider-specific webhook surface).
2. Avoids LinkedIn's posting-API approval friction.
3. Mirrors the "import once, manage in WorkFlowy" pattern of every other integration.

---

## Scope

| Capability | In scope | Out of scope |
|------------|----------|--------------|
| Import own profile | ✅ | — |
| Import own work history | ✅ | — |
| Import own education | ✅ | — |
| Import own skills | ✅ | — |
| Post to LinkedIn from WF | ❌ | Deferred indefinitely |
| Message sync | ❌ | Deferred indefinitely |
| Connection list | ❌ | Privacy + ToS risk |
| Company-page admin | ❌ | Out of scope |

---

## Trigger UI

In **Settings → Integrations → LinkedIn → Import profile**:

| Step | Behavior |
|------|----------|
| 1 | User clicks "Connect LinkedIn" → OAuth 2.0 popup, scope `r_liteprofile r_emailaddress` only |
| 2 | On success, render preview of profile sections to import |
| 3 | User chooses target node (default: a new node under Home named "LinkedIn Profile") |
| 4 | User confirms; import runs synchronously up to 5s, then progresses in background |
| 5 | Result appended as nested nodes; user sees toast "Imported N items" |
| 6 | Token discarded after import — no persistent connection |

---

## Node Mapping

| LinkedIn section | WF node hierarchy |
|------------------|--------------------|
| Profile root | Parent node "LinkedIn Profile" |
| Headline | Direct child (note text) |
| About / Summary | Child paragraph node |
| Experience | Sub-tree per role; child nodes for description bullets |
| Education | Sub-tree per institution |
| Skills | Flat child list under "Skills" node |

---

## Edge Cases

- **OAuth declined** — Toast "Connection cancelled"; no node created.
- **Empty section** — Skipped silently (no empty parent nodes).
- **Re-import** — User must explicitly choose: append (new sub-tree) or overwrite (deletes prior import sub-tree first, then re-runs).
- **Rate limit** — LinkedIn imposes 100 req/day. Single import < 10 calls; well within budget.

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 9 parent (Blocker D-1 resolution)
- [`01-email-to-workflowy.md`](./01-email-to-workflowy.md) — Sibling integration
