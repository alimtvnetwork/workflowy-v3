# Plan 06 — F-03 PowerShell/CLI Boundary

> **Created:** 2026-04-25 (UTC+8)
> **Executed:** 2026-04-25 (UTC+8)
> **Status:** ✅ Complete
> **Closes:** Audit finding F-03 (Impact 7/10 → projected score +4)
> **Version bump:** v0.34.0 → v0.35.0

---

## Goal

Define an unambiguous boundary between the **legacy Go+React PowerShell runner** documented in `spec/10-powershell-integration/` and the **WP-plugin (PHP+SQLite) + Vite/React** runtime that WorkFlowy actually ships. Prevent AI implementers from confusing dev tooling with runtime.

## Gap Analysis (pre-execution)

| Issue | Evidence |
|-------|----------|
| Folder authored for Go+React project | `00-overview.md` first line: "Go backend + React frontend projects with pnpm PnP" |
| WorkFlowy uses neither Go nor pnpm | `mem://architecture/tech-stack` = bun + PHP 8.2 |
| No boundary doc | An AI could plausibly believe `run.ps1` ships in the plugin ZIP |
| AT file scaffold-only | `97-acceptance-criteria.md` had 0 concrete criteria |

## Files Created

1. `spec/10-powershell-integration/08-wp-plugin-boundary.md` — 8 load-bearing boundary rules (B1–B8), parity table, "what goes where" decision matrix, explicit out-of-scope list

## Files Updated

- `spec/10-powershell-integration/97-acceptance-criteria.md` — scaffold v1.0.0 → v2.0.0 with 10 verifiable criteria
- `package.json` — v0.34.0 → v0.35.0
- `.lovable/plans/00-active.md` — moved F-03 to "resolved"

## Audit Score Impact

| Before | After | Δ |
|--------|-------|---|
| ~93/100 | ~97/100 | **+4** |

## Key Design Decisions

1. **Boundary, not rewrite.** Legacy Go+React content stays in-place but is flagged "historical reference only" via rule B7. Cross-project reuse remains possible.
2. **Cross-platform parity is mandatory.** Every `.ps1` MUST have a `.sh` or `package.json` script equivalent (B6 + parity table).
3. **PowerShell never ships.** B2 ties to the canonical `.distignore` in the WP-plugin CI archetype.
4. **No PHP→PowerShell shell-out.** B5 closes a security/portability hole.
5. **Decision matrix.** A 6-row table tells implementers exactly which folder owns each topic.

## Verification

- ✅ `node scripts/spec-hygiene/00-run-all.mjs` — passed
- ✅ `package.json` bumped to v0.35.0
- ✅ Both files cross-link correctly to `13-cicd-pipeline-workflows/18-wp-plugin-deploy/`

---

*Plan 06 archived 2026-04-25 (UTC+8).*
