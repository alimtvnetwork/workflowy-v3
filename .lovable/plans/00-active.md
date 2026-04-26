# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎯 **SPEC TRACK 100% COMPLETE — VERIFIED.** Investigated `mem://audits/app-folder-2026-04-26` (15 findings + 14 APP-FIX phases) and confirmed via `spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`: **all 15 findings closed**, **all 14 APP-FIX phases done**, **96/100 PASS**, both re-audit residuals (R-1 PascalCase pseudocode, R-2 ItemType enum link) fixed, and **all 4 non-blocking polish items already done** (`AT-APP-26..57` backfilled covering Today/Templates/Concurrency/SSE/Workflows; SSE contract `AT-APP-36..42` registered; `AT-WF-*` folded into canonical via APP-FIX-14; AT-stubs resolved per A-26/A-27 with stub count 11→1). Suggestions-tracker line 102 confirms: **"All optional spec-only polish is now exhausted."** Memory file updated to reflect closed state. Prior session: cross-ref audit v1.2.1 (78 audit codes, 0 unregistered shorthand). **The entire spec corpus has exactly ONE remaining item: A-01** — `src/types/index.ts` `mirror` → `dashboard` (3-line TS edit; closes hygiene 17/18 → 18/18; gated by `mem://constraints/spec-only-mode`). Phase-1 build path P1.1 → P1.7 is fully unblocked the moment that constraint lifts. **There is genuinely no more spec work to do. Say `exit spec-only` to start P1.1 Bootstrap.**

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
