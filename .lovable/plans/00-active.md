# Active Plans

> **Updated:** 2026-04-25 (UTC+8) · **Status:** No active plans

---

## Historical plans (`.lovable/plans/archive/`)

| Plan | Outcome |
|------|---------|
| `01-restructure-31-app-and-32-ui-design.md` | ✅ Executed — canonical trees are `31-app/` and `32-ui-design/`. |
| `02-spec-hygiene-fixes.md` | ✅ Executed — All 18 audit issues closed. |
| `03-workflowy-spec-consolidation.md` | ✅ Executed — All 10 phases done. |
| `04-f01-rollup-enrichment.md` | ✅ Executed 2026-04-25 — 3 rollups + 2 AT files upgraded. v0.33.0. |
| `05-f02-wp-plugin-cicd.md` | ✅ Executed 2026-04-25 — Added `18-wp-plugin-deploy/` archetype. v0.34.0. |
| `06-f03-powershell-boundary.md` | ✅ Executed 2026-04-25 — Added `08-wp-plugin-boundary.md` (B1–B8). v0.35.0. Score 93 → ~97. |

---

## What's still live

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit
- ~~**S003** backend runtime~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite)
- ~~**F-01** rollup gap~~ → ✅ **RESOLVED 2026-04-25** (Plan 04)
- ~~**F-02** CI/CD packaging~~ → ✅ **RESOLVED 2026-04-25** (Plan 05)
- ~~**F-03** PowerShell/CLI boundary~~ → ✅ **RESOLVED 2026-04-25** (Plan 06)
- **F-04** Code-block highlighter dependency (Impact 5/10, +3 pts) — last remaining audit finding
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- 22 AT stubs across remaining domains (non-blocking; tracked in suggestions-tracker)
