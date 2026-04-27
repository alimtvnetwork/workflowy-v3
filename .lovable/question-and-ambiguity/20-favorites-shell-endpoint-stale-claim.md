# 20 — Favorites/Pinned shell-endpoint stale claims

**Loop:** 21 / 40 (F23)
**Date:** 2026-04-27
**Files touched:** `spec/31-app/06-endpoints/03-layout-structure.md` (v1.0.0 → v1.1.0)

## Finding

`06-endpoints/03-layout-structure.md` lines 12, 20, 22 contradicted three other SSOTs:

1. **Line 12** said *"No server endpoints — UI-only feature."* — but the ⭐ Favorite button on the page header **does** persist server-side.
2. **Line 20** said *"no 'favorites' table in MVP"* — but `01-features/01-information-model.md` §relationships, `01-features/03-layout-structure.md` line 200, and `07-db-diagram/04-feature-slices.md` §4.12 all declare a `favorites` table as MVP scope.
3. **Line 22** speculated about a future *"`Pinned` flag"* — no such flag exists or is planned anywhere in the spec corpus (`grep -rn "Pinned" spec/31-app/01-features/01-information-model.md spec/31-app/07-db-diagram/` → 0 hits).

## Resolution

- Reframed the section as **"Why no shell-specific endpoints"**: the shell composition has no endpoints of its own, but the Favorite toggle reuses `EP-ITEMS-UPDATE`.
- Removed the speculative Pinned-flag sentence entirely; sidebar pinning is not a planned feature, only ephemeral collapse/width state in `localStorage`.
- Added cross-references to the canonical Favorites SSOTs (information-model + feature-slices §4.12) and to the items-endpoint family.

## Why this drifted

The endpoint file was written in v1.0.0 (2026-04-26) before the Favorites feature was promoted from "polish" to MVP. Endpoint pages don't auto-track changes in feature pages — pure prose drift. Mitigation candidate: G-31 could cross-check endpoint "no endpoint" claims against the citation graph for matching `EP-*` references in feature pages.

## Status

✅ Closed in this loop. No new gate proposed (G-31 deferred to F24-family work).
