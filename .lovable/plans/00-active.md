# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 🧹 **PATH-CANONICALISATION CLEANUP PASS COMPLETE.** Skeleton spec v1.0.1 — all `wp-plugin/src/` references retired across the corpus (verified by ripgrep; only intentional documentary mentions remain inside the skeleton spec itself). 5 path migrations executed across 3 files: (1) `08-api-rate-limiting.md` Component Contract L182-L184 — `RateLimit.php`, `BucketProfiles.php`, `0007_rate_limit_buckets.sql` all dropped `src/` prefix; (2) `01-features/09a-mirror-cycle-detection.md` AT-CYCLE-10 + Component Contract L167-L168 — `CycleCheck.php` and `cycle-check.sql` migrated; (3) `01-features/15-roles-and-permissions.md` §Location L253-L258 — directory diagram `plugin-root/src/Auth/Auth.php` → `wp-plugin/Auth/Auth.php` with cross-link added to skeleton spec. 1 placeholder clarified: `15-g22-error-code-catalogue-gate.md` AT-G22-02 — `wp-plugin/Auth.php` → `wp-plugin/Auth/Auth.php` (canonical static helper). Skeleton §1 tree updated to add `Auth/Auth.php` row (sole authorization helper, namespace `WorkFlowy\Auth`, distinct from `SignIn.php`/`TokenStore.php`). **Inventory corrections** uncovered during cleanup: v1.0.0 §6 misattributed cycle-check refs to `18-g25-...md` (actually in `09a-...md`) and `Auth.php` placeholder to `11-session-token-lifecycle.md` (actually in `15-roles-and-permissions.md` + `15-g22-...md`); both errors corrected with re-scanned facts in §2 inventory and §6 receipts. Updated `22-wp-plugin-folder-skeleton.md` v1.0.0→v1.0.1, plan. **Cluster status:** orphan-gate cluster G-22..G-28 done (7 SSOTs, 36 axes, 110 ATs); skeleton + cleanup pass done. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
