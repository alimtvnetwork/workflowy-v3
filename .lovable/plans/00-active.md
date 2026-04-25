# Active Plans

> **Updated:** 2026-04-25 (UTC+8) · **Status:** No active plans

---

## Historical plans (`.lovable/plans/archive/`)

| Plan | Outcome |
|------|---------|
| `01-restructure-31-app-and-32-ui-design.md` | ✅ Executed — canonical trees are `31-app/` and `32-ui-design/`. |
| `02-spec-hygiene-fixes.md` | ✅ Executed — All 18 audit issues closed. |
| `03-workflowy-spec-consolidation.md` | ✅ Executed — All 10 phases done. |
| `04-f01-rollup-enrichment.md` | ✅ Executed 2026-04-25 — 3 rollups + 2 AT files upgraded to implementation-grade. v0.33.0. |
| `05-f02-wp-plugin-cicd.md` | ✅ Executed 2026-04-25 — Added `03-wp-plugin-deploy/` archetype (6 files, AT-WPPLUGINDEPLOY-01..15). v0.34.0. Score 85 → ~93. |

---

## What's still live

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit
- ~~**S003** backend runtime~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite)
- ~~**F-01** rollup gap~~ → ✅ **RESOLVED 2026-04-25** (Plan 04)
- ~~**F-02** CI/CD packaging~~ → ✅ **RESOLVED 2026-04-25** (Plan 05)
- **F-03** PowerShell/CLI integration boundary (Impact 7/10, +4 pts) — next P2 candidate
- **F-04** Code-block highlighter dependency (Impact 5/10, +3 pts)
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- 22 AT stubs across remaining domains (non-blocking; tracked in suggestions-tracker)
