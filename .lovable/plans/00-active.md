# Active Plans

> **Updated:** 2026-04-25 (UTC+8) · **Status:** No active plans

All historical plans are in `.lovable/plans/archive/`:

| Plan | Outcome |
|------|---------|
| `01-restructure-31-app-and-32-ui-design.md` | ✅ Executed — `21-app/`, `24-app-design-system-and-ui/` removed; canonical trees are `31-app/` and `32-ui-design/`. |
| `02-spec-hygiene-fixes.md` | ✅ Executed — All 18 audit issues (I-01 … I-18) closed. 18 hygiene scripts in `scripts/spec-hygiene/` are wired into `00-run-all.mjs`. |
| `03-workflowy-spec-consolidation.md` | ✅ Executed — All 10 phases done (`spec/32-ui-design/06-workflowy-ui/01-navbar/` … `10-mobile/`); cross-cutting blockers B1/B2/B3/D1 resolved. |

---

## What's still live

- `mem://constraints/spec-only-mode` — implementation gated until specs are 100 % complete
- **S003** in `.lovable/memory/suggestions/suggestions-tracker.md` — backend runtime decision (only true blocker)
- Phase-1 build path P1.1 → P1.7 in `mem://` — runs once SPEC-ONLY lifts and S003 is resolved

When a new multi-phase plan is needed, drop it here as `01-<short-name>.md`, `02-…`, etc.
