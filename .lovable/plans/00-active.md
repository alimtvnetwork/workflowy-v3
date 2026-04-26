# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎉 **CROSS-REF AUDIT v1.2.1 DONE** — ran consistency check across the 6 security/ops SSOTs (A-39..A-44), found and fixed 4 missed action codes + 1 ambiguous shorthand: (a) `system.audit.chain.rewind` (A-44 referenced, A-39 missed); (b) `auth.password.change`, `admin.user.disable`, `admin.workspace.delete` (A-41 token-revocation matrix referenced, A-39 missed); (c) `EXPORT.*` shorthand was ambiguous because canonical names live under `data.export.*` (DATA category) but `EXPORT.SCRAPING_SUSPECTED` lives under `policy.export.*` (POLICY category) — a blind `strtolower+tr_._.` normalizer would have produced wrong wire codes. Added explicit shorthand→canonical mapping table to §2.1 documenting the `EXPORT.*` → `data.export.*` rule + the special-case `EXPORT.SCRAPING_SUSPECTED` → `policy.export.scraping.suspected`. **Total taxonomy now 78 actions** across 7 categories (was 74). `09-audit-log-policy.md` bumped 1.2.0 → **1.2.1**. Verifier re-ran: **0 unregistered shorthand codes remaining**. 🏁 **Spec foundation is now internally consistent.** Hygiene 17/18; only **A-01** remains — `src/types/index.ts` `mirror` → `dashboard`, gated by `mem://constraints/spec-only-mode`. **Say `exit spec-only` to apply that fix and start P1.1 Bootstrap.**

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
