# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 📐 **WP-PLUGIN FOLDER SKELETON SSOT AUTHORED — P1.5 PREREQUISITE SATISFIED.** Created `spec/31-app/05-conventions/22-wp-plugin-folder-skeleton.md` v1.0.0. Canonicalises **Flat-PSR layout** (`wp-plugin/Auth|Backup|Export|Lifecycle|Routes|Middleware|Repository|Migrations|Audit|Support/`) and retires the legacy `wp-plugin/src/` nested prefix. PSR-4 autoload root: `Workflowy\\` → `wp-plugin/` (no `src/` indirection). 24-path inventory reconciled across 8 policies + 7 G-2X gate specs: 18 ✅ aligned, 5 require migration in 2 specs (`08-api-rate-limiting.md` ×3, `18-g25-...md` ×2 — all retire `src/` prefix), 1 placeholder (`Auth.php` in `11-session-token-lifecycle.md`) flagged for clarification. Six naming rules captured (PascalCase domains, kebab-case Routes, 4-digit-prefix Migrations, kebab-case Repository SQL files, ≤80 LOC bootstrap, free-form fixtures). 10 acceptance tests (AT-SKEL-01..10). Follow-up edits deferred to a single dedicated cleanup pass (§6) so reviewers can audit the path-canonicalisation as one diff. Updated `00-overview.md` TOC + Files + Related, `spec/spec-index.md`. **Cluster status:** orphan-gate cluster G-22..G-28 complete (7 SSOTs, 36 axes, 110 ATs); skeleton spec is the first **adjacent** task delivered. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
