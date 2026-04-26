# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎉 **AUDIT-LOG v1.2.0 BACKFILL DONE** — `09-audit-log-policy.md` bumped 1.0.0 → 1.2.0. Registered all 52 actions emitted by sibling SSOTs in 5 sub-tables: 10 role-escalation (`authz.role.*`, `authz.owner.transfer`, `authz.break.glass`), 9 session/token (`auth.token.refresh` sampled 1:100, `auth.logout.all`, `auth.session.evict`, `authz.refresh.reuse` at error, `system.secret.rotate`, `auth.token.stale` sampled 1:50, `auth.session.idle.expire`/`absolute.expire`, `auth.sse.ticket.consume` sampled 1:100), 11 MFA (`auth.mfa.verify.*`, `auth.mfa.stepup.*`, `auth.mfa.enroll`/`factor.add`/`factor.remove`/`recovery`/`recovery.regen`/`lockout`, `authz.webauthn.counter.rollback`), 10 export (`data.export.request`/`start`/`ready`/`failure`/`download`/`download.throttled`/`expired`/`purge`/`account.self`, `policy.export.scraping.suspected`), 12 backup/DR (`system.backup.lag`/`failure`/`missed`/`daily.missed`/`offsite.failure`/`corrupt`/`key.rotate`, `system.restore.drill.pass`/`fail`/`overdue`, `system.restore.initiated`/`complete`). Documented dual-naming convention: sibling SSOTs use `DOT.UPPER_CASE` shorthand for readability; canonical wire format is `dot.lower.case` enforced by `Audit::action()` normalizer + G-23. Legacy v1.0.0 names `data.export.requested`/`data.export.delivered` deprecated with one-year overlap to 2027-04-26. **Total taxonomy now 74 actions across 7 categories.** 🏁 **All security/ops SSOTs (A-39..A-44) + bookkeeping complete.** Hygiene 17/18; only **A-01** remains — `src/types/index.ts` `mirror` → `dashboard`, gated by `mem://constraints/spec-only-mode`. **Say `exit spec-only` to apply that fix and start P1.1 Bootstrap.**

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
