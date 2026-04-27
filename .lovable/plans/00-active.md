# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** ✅ **POLISH BLOCK 3 — RE-AUDIT §4 RECONCILED.** Investigation of "AT-WF-* canonicalisation" (re-audit §4 item 2) revealed it was **already complete** — `97-acceptance-criteria.md` v2.3.0 had backfilled all `n*` workflow IDs (`nTEMPLATE-*`, `nSHARE-*`, `nRESTORE-*`) into canonical `AT-APP-43..57` on 2026-04-26 (polish #2), but the re-audit document had not been refreshed. Verified zero orphan `AT-WF-N` IDs across `spec/`, zero unmapped `n*` IDs (`02-workflows/00-overview.md` v2.1.0 confirms canonical-mapped). Same investigation found §4 items 1 and 3 also already done: item 1 closed by v2.2.0 (`AT-APP-26..42` for Today=26..28, Templates=29..32, Concurrency core=33..35, SSE=36..42); item 3 closed yesterday by polish block 2 (`AT-CONCURRENCY-16..22` in `14-concurrency-and-sync.md` v1.7.0). Updated `spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md` §4 table: items 1/2/3 → ✅ DONE with provenance refs; item 4 → 🟡 PARTIAL (2 rollups curated, suggestions count = 1 after A-26). Bumped §5 verdict from composite 96/100 → **100/100** for `spec/31-app/**` (only non-app-folder stubs remain). Hygiene `08-check-acceptance-coverage.mjs` ✅ 0 warnings. Spec-only constraint preserved. Only **A-01** remains gated. **Next polish queue:** §4 item 4 — sweep remaining `AT-*` stubs across non-app domains (per-folder audit; suggestions tracker shows count = 1 but a fresh `📝 To populate` scan may surface more scaffolds like polish block 1 did).

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
