# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎉🎉 **ALL 13 APP-FIX PHASES + ALL 6 ROUND-3 AUDITS CLOSED.** AUDIT-06 final blocker closed via §14.5 SSE Transport Contract (endpoint, 9-event vocabulary, Last-Event-Id resume, poll fallback, reconnect algorithm, forbidden-transport list). Spec is now AI-handoff-ready for re-audit. Suggested next: `re-audit` to confirm 100/100 → `exit spec-only` → P1.1 Bootstrap.

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

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit
- ~~**S003** backend runtime~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite)
- ~~**F-01** rollup gap~~ → ✅ **RESOLVED 2026-04-25** (Plan 04)
- ~~**F-02** CI/CD packaging~~ → ✅ **RESOLVED 2026-04-25** (Plan 05)
- ~~**F-03** PowerShell/CLI boundary~~ → ✅ **RESOLVED 2026-04-25** (Plan 06)
- ~~**F-04** Code-block highlighter~~ → ✅ **RESOLVED 2026-04-25** (Plan 07)
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- 22 AT stubs across remaining domains (non-blocking polish; tracked in suggestions-tracker)
- **Recommended next:** `re-audit` to confirm 100/100, then `exit spec-only` to start P1.1 Bootstrap
