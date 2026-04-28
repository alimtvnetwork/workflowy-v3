# Active Plans

> **Updated:** 2026-04-28 (UTC+8) · **Status:** 🟢 **AI READINESS 100/100 + HYGIENE 25/26 GREEN.** All 7 AUDIT-AI findings (01–07) closed 2026-04-27. Mirror redesigned as a peer-group relation (not an ItemType). 48 NO-QUESTIONS-mode ambiguities triaged (44 self-resolved, 3 soft-confirm default-accept, 1 hard-confirm resolved → AT-MPG-). Sole remaining red gate: **G-15 enum-sync** — `mirror` still in `src/types/index.ts:43` ItemType enum (= 1-line code edit, blocked only by spec-only mode). **No remaining spec work.**

> **Previous status (archived):** 🟢 99/100 + 17/18 hygiene — closed self-introduced regressions from audit-closure work (numbering collisions, broken links, missing consistency reports, header drift).

> **Previous status (archived):** 🟢 89/100 after v1.1.0 closed AUDIT-AI-01 (local WP dev harness) + AUDIT-AI-02 (PHP SSE fixtures), both CRITICAL.

> **Previous status (archived):** ⚠️ Round-4 audit composite 78/100 — 7 findings (2 CRIT / 2 HIGH / 2 MED / 1 LOW). All since closed; see `spec/18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md`.

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
- ~~**F-01..F-04**~~ → ✅ **RESOLVED 2026-04-25** (Plans 04–07)
- ~~**A-26** AT-stub scaffolds (11 files)~~ → ✅ **RESOLVED 2026-04-26** (polish #3, 107 new criteria)
- ~~**AUDIT-AI-01..07**~~ → ✅ **CLOSED 2026-04-27** (7/7 findings; mirror peer-group redesign closed AI-07)
- **Code-1 / G-15 enum-sync** — `mirror` still in `src/types/index.ts:43`; 1-line removal blocked by spec-only mode
- **Soft-confirms #01, #03, #17** — 3 default-accepted ambiguities user could still override (audit footnote / DDL singular / favorites contradiction); see `.lovable/question-and-ambiguity/00-triage-summary.md`
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- **Recommended next:** say **`exit spec-only`** to clear G-15 (1-line edit) and start **P1.1 Bootstrap** — there is no more spec work to do

