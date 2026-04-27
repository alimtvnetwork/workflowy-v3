# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** ✅ **G-28 AXIS 7 PREREQ SATISFIED.** Added "WP Hook" column to `14-backup-and-dr-policy.md` §3's "Backup Types & Schedule" table (v1.0.2). All 6 backup tiers now declare canonical `wp_schedule_event` action names: `workflowy_wal_ship` (15 min → `quarter_hourly` custom recurrence), `workflowy_hot_snap` (hourly), `workflowy_daily_full` (daily), `workflowy_weekly_full` (weekly), `workflowy_monthly_full` (monthly), `workflowy_yearly_full` (yearly). Added "Hook canon" callout below the table linking to G-28 axis 7 (`21-g28-backup-coverage-gate.md`) and documenting frequency→WP-recurrence normalisation. G-28 axis 7 (bidirectional schedule↔cron parity) is now implementable. **Cluster summary unchanged:** G-22..G-28 = 7 algorithm SSOTs, 36 axes, 110 ATs, 7 numbering collisions corrected, 1 prereq satisfied. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
