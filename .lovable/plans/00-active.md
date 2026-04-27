# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 📘 **G-23 ALGORITHM SSOT AUTHORED** — created `spec/31-app/05-conventions/16-g23-audit-log-coverage-gate.md` v1.0.0, 2nd in the orphan-gate cluster (G-22 done yesterday). Two-axis algorithm: (1) every `Audit::action(<shorthand>)` literal resolves via the §2.1 normalization rules to a current taxonomy row (with deprecation-overlap awareness through 2027-04-26), (2) every mutation method on `Auth`/`Sharing`/`Admin` emits at least one `AuditLog::write` per non-error return path. 12 acceptance tests (AT-G23-01..12). Includes path-level granularity (catches `if`-branch coverage gaps), special-case prefix handling for `EXPORT.SCRAPING_SUSPECTED`, read-only allow-list (`Auth::hasRole`, `Sharing::list`, `Admin::query`, etc.), and dynamic-argument warnings. Caught and corrected another real numbering collision: policy §9 said implementation goes at `scripts/spec-hygiene/13-audit-log-coverage-audit.mjs` but slot `13-` is occupied by `generate-at-stubs.mjs` (G-13); renamed to `23-` to match gate ID. Updated `09-audit-log-policy.md` v1.2.0→v1.2.1, `02-ci-quality-gates.md` (added G-23 row, narrowed reserved range to G-24..G-28), `00-overview.md` TOC + Files + Related, `spec/spec-index.md`. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
