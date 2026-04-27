# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** ✅ **POLISH BLOCK 2 DONE — AT-CONCURRENCY-16..22 AUTHORED.** Added 7 new acceptance test rows to `spec/31-app/01-features/14-concurrency-and-sync.md` (v1.6.1→v1.7.0) covering the §14.5 SSE Transport Contract: SSE endpoint handshake (`text/event-stream` + `X-Accel-Buffering: no` + 1 s heartbeat), event frame format (`event:` name + monotonic `id: {ServerTs}` + JSON `data:`), Last-Event-Id resume/replay (server replays `ServerTs > cursor` per `(UserId, WorkspaceId)`), cursor-overflow backpressure (>1000 events behind → `event: cursor-overflow` with `{resumeWith:'poll'}`), poll-fallback shape (`{Events, Cursor, HasMore}` every 5000 ms, no long-poll), transactional emission atomicity (one event per LWW commit, never cross-workspace), and a forbidden-transports CI guard (zero refs to WebSockets/Pusher/Ably/Supabase Realtime/`LISTEN/NOTIFY`/Redis/long-poll/parallel SSE per workspace). Added 7 matching Component Contract rows pointing at planned WP plugin paths (`wp-plugin/Sync/SseEndpoint.php`, `EventFramer.php`, `ResumeBuffer.php`, `BackpressureGuard.php`, `PollEndpoint.php`, `TransactionalEmitter.php` + `scripts/spec-hygiene/forbidden-transports.mjs`). Hygiene `08-check-acceptance-coverage.mjs` ✅ 0 warnings. Re-audit §4 item 3 closed. Spec-only constraint preserved. **Next polish queue:** AT-WF-* canonicalisation → AT-APP-NN backfill (Today/Templates/Concurrency app rollup) → 22 remaining `AT-*` stubs across non-app domains. Only **A-01** remains gated.

---

## Historical plans (`.lovable/plans/archive/`)

| Plan | Outcome |
|------|---------|
| `01-restructure-31-app-and-32-ui-design.md` | ✅ canonical trees `31-app/` + `32-ui-design/`. |
| `02-spec-hygiene-fixes.md` | ✅ All 18 audit issues closed. |
| `03-workflowy-spec-consolidation.md` | ✅ All 10 phases done. |
| `04-f01-rollup-enrichment.md` | ✅ 2026-04-25 — rollups enriched. v0.33.0. |
| `05-f02-wp-plugin-cicd.md` | ✅ 2026-04-25 — `18-wp-plugin-deploy/` archetype. v0.34.0. |
| `06-f03-powershell-boundary.md` | ✅ 2026-04-25 — `08-wp-plugin-boundary.md` (B1–B8). v0.35.0. |
| `07-f04-highlighter-pin.md` | ✅ 2026-04-25 — `11-highlighter-dependency-pin.md` + `AT-HLPIN-01..08`. v0.36.0. **All 4 audit findings closed.** |
| `08-audit01-backend-contradiction.md` | ✅ 2026-04-25 — Round-3 AUDIT-01 (CRITICAL): WP-native SSE + `Auth::hasRole` PHP helper. v0.37.0. |

---

## What's still live

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit ⛔ **only remaining blocker**
- ~~**S003** backend runtime~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite)
- ~~**F-01** rollup gap~~ → ✅ **RESOLVED 2026-04-25** (Plan 04)
- ~~**F-02** CI/CD packaging~~ → ✅ **RESOLVED 2026-04-25** (Plan 05)
- ~~**F-03** PowerShell/CLI boundary~~ → ✅ **RESOLVED 2026-04-25** (Plan 06)
- ~~**F-04** Code-block highlighter~~ → ✅ **RESOLVED 2026-04-25** (Plan 07)
- ~~**A-26** AT-stub scaffolds (11 files)~~ → ✅ **RESOLVED 2026-04-26** (polish #3, 107 new criteria)
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- **Recommended next:** say **`exit spec-only`** to start **P1.1 Bootstrap** — there is no more spec work to do
