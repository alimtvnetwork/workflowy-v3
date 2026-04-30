# Endpoints — 02 Personas

## Database Routing

**N/A** — persona reference only; no endpoint surface.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/02-personas.md`](../01-features/02-personas.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-ME | GET | `me` | user | Current user profile + derived persona |

---

## EP-ME — GET `me`

- **Auth**: `user` (any authenticated WP user).
- **Request body**: —
- **Success (200)** `Results`:
  - `UserId` (int, WordPress user ID)
  - `Email` (string)
  - `DisplayName` (string)
  - `RootItemId` (string, the root `Item.id` per L3)
  - `Roles` (string[], system roles e.g. `admin`, `user`)
  - `Personas` (string[], derived per `02-personas.md` — e.g. `solo-thinker`, `team-lead`)
  - `Timezone` (IANA TZ string, used by Today view per `10-today-view.md`)
- **Errors**: `ERR_UNAUTHENTICATED`.
- **Side effects**: none. Persona derivation is read-only.
- **AC refs**: `AT-APP-09`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Persona derivation rules | [`../01-features/02-personas.md`](../01-features/02-personas.md) |
| Roles SSOT | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) |
