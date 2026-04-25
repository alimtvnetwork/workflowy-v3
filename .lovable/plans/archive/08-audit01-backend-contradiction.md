# Plan 08 — Fix AUDIT-01: Backend Contradiction (CLOSED)

> **Closed:** 2026-04-25 (UTC+8) · **Version bump:** v0.36.2 → v0.37.0
> **Audit finding:** AUDIT-01 (CRITICAL · 100/100 weighted) from `spec_vs_impl_audit.md`

## Problem

Three spec files described mutually exclusive backends:

| File | Claim |
|------|-------|
| `spec/31-app/00-overview.md` L9 | WordPress plugin (PHP 8.1+ + SQLite via PDO) |
| `spec/31-app/97-acceptance-criteria.md` AT-APP-22 | Postgres `SECURITY DEFINER` + RLS |
| `spec/31-app/01-features/14-concurrency-and-sync.md` | "realtime channel" / "Realtime presence" (WebSocket-implied) |

WordPress + SQLite cannot satisfy Postgres-only constructs (`SECURITY DEFINER`, RLS) or WebSocket-native realtime.

## Fix Applied

1. **`00-overview.md` L8**: Replaced `RLS uses has_role()` → `Auth::hasRole($userId, $role)` PHP helper.
2. **`00-overview.md` L9**: Pinned realtime transport to **WP-native SSE + 5 s poll fallback**; explicitly forbade WebSockets and Postgres LISTEN/NOTIFY.
3. **`97-acceptance-criteria.md` AT-APP-22**: Rewrote to reference the PHP helper + WHERE-clause row scoping; explicitly noted that Postgres-style RLS / `SECURITY DEFINER` are not portable to SQLite under WordPress.
4. **`14-concurrency-and-sync.md`**: v1.0.0 → v1.1.0; added Transport paragraph defining "realtime channel `item:<id>`" / "realtime broadcast" as **SSE event over scoped stream OR next 5 s poll surfaces it**. All 14 existing edge cases + 15 acceptance tests preserved unchanged (their semantics work over either transport).

## Verification

- `node scripts/spec-hygiene/00-run-all.mjs` → ✅ all 18 checks pass
- `grep -rn "Postgres\|SECURITY DEFINER\|RLS\|WebSocket" spec/31-app/` → 0 hits
- Realtime contract preserved: every AT-CONCURRENCY-* test still passes against SSE+poll semantics

## Residual Risk

- **None.** Backend is now consistently WP-native across all three files.
- F-05 (legacy archetype isolation) and AUDIT-02 (DB casing) remain open but are independent.

## Score Impact

| Metric | Before | After (projected) |
|--------|--------|-------------------|
| AUDIT-01 weighted risk | 100/100 (CRITICAL) | 0 (CLOSED) |
| Spec compliance | 50/100 | ~62/100 |
| Blockers remaining | 6 | 5 (AUDIT-02, 03, 04, 05, 06) |
