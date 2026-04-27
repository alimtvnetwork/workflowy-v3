# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** ✅ **POLISH BLOCK 4 — 2 HYGIENE CHECKS GREENED.** Stub sweep across non-app domains found **zero live `📝 To populate` markers** (the 2 remaining matches in `05-conventions/` and `07-db-diagram/` `97-acceptance-criteria.md` are historical changelog refs to retired v0.1.0 scaffolds). Stub work corpus-wide is **complete**. Pivoted to attacking the 3 remaining hygiene failures: (1) **`03-check-links.mjs`** ✅ FIXED — `spec/31-app/07-db-diagram/97-acceptance-criteria.md` v1.0.0→v1.0.1: corrected broken link `../14-concurrency-and-sync.md` → `../01-features/14-concurrency-and-sync.md`. (2) **`07-extract-contract-map.mjs`** ✅ FIXED — `spec/31-app/01-features/09a-mirror-cycle-detection.md` v1.0.0→v1.1.0: reshaped Component Contract from non-canonical `Concern \| Path \| Function` to canonical `Surface \| Component path \| data-testid \| Acceptance tests` schema; rewired AT refs from cross-file `AT-MIRRORS-08` to local `AT-CYCLE-01..10` (5 component rows mapped to actual in-file ATs). Algorithm signatures preserved as §Note. (3) **`15-check-enums-in-sync.mjs`** ⛔ STILL FAILING — this is the **A-01 gate** (`src/types/index.ts` ItemType has `mirror` but spec has `dashboard`); blocked by `mem://constraints/spec-only-mode`. **Hygiene now: 17/18 passing; the only remaining red is A-01.** Spec-only constraint preserved. Next polish queue effectively empty — nothing further can be done in spec-only mode without touching `src/`.

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
