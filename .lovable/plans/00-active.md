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

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit
- ~~**S003** backend runtime decision~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite). See `mem://constraints/backend-runtime-deferred`.
- Phase-1 build path P1.1 → P1.7 in `mem://` — **unblocked**, runs as soon as user lifts SPEC-ONLY mode
- 22 AT stubs remaining across `02-coding-guidelines/` sub-leaves, top-level roll-ups, and spec meta files (non-blocking; tracked in suggestions-tracker)

When a new multi-phase plan is needed, drop it here as `01-<short-name>.md`, `02-…`, etc.
