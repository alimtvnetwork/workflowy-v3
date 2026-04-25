# Plan 05 — F-02 WP-Plugin CI/CD Packaging

> **Created:** 2026-04-25 (UTC+8)
> **Executed:** 2026-04-25 (UTC+8)
> **Status:** ✅ Complete
> **Closes:** Audit finding F-02 (Impact 8/10 → projected score +8)
> **Version bump:** v0.33.0 → v0.34.0

---

## Goal

Add a third CI/CD archetype documenting the **Vite + React → PHP plugin .zip → GitHub Release** pipeline that WorkFlowy actually ships, bridging the existing `13-cicd-pipeline-workflows/` folder (CI SSOT) with the existing `15-wp-plugin-how-to/10-deployment-patterns/` folder (WP packaging SSOT).

## Gap Analysis (pre-execution)

| Issue | Evidence |
|-------|----------|
| Folder advertised "two archetypes" only | `13-cicd-pipeline-workflows/00-overview.md` v3.2.0 line 51–53 |
| WP-plugin archetype absent | No `18-wp-plugin-deploy/` subfolder existed |
| No spec for Vite-into-WP-plugin bundling | `15-wp-plugin-how-to/10-deployment-patterns/11-cicd-automation.md` is PHP-only — does not bundle a frontend SPA |
| Parent AT file was scaffold | `13-cicd-pipeline-workflows/97-acceptance-criteria.md` v1.0.0 had 0 concrete criteria |

## Files Created

1. `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md` — 9 load-bearing pipeline rules (P1–P9), 8-stage diagram, cross-reference table to canonical sources
2. `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md` — canonical `.distignore`, final ZIP tree, 8 integrity acceptance gates
3. `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md` — complete `release.yml` (3 jobs, 8 stages, integrity verification step inline)
4. `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/03-update-server-contract.md` — `info.json` JSON schema, 5 post-release verification gates
5. `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/04-version-sync.md` — `package.json` → header → enum → tag drift detection script + CI step
6. `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/97-acceptance-criteria.md` — `AT-WPPLUGINDEPLOY-01..15`, all shell-verifiable

## Files Updated

- `spec/13-cicd-pipeline-workflows/00-overview.md` — v3.2.0 → v3.3.0; added 3rd archetype to scope table, feature inventory, and migration history
- `spec/13-cicd-pipeline-workflows/97-acceptance-criteria.md` — scaffold v1.0.0 → v2.0.0 with 16 cross-cutting criteria + reference to AT-WPPLUGINDEPLOY-*
- `package.json` — v0.33.0 → v0.34.0
- `.lovable/plans/00-active.md` — moved F-02 to "resolved"

## Audit Score Impact

| Pillar | Before | After | Δ |
|--------|--------|-------|---|
| CI/CD | 10/100 | ~85/100 | **+75** |
| Overall | 85/100 | ~93/100 | **+8** |

## Key Design Decisions

1. **Bridge over duplicate:** The new subfolder cross-links to existing canonical sources in `15-wp-plugin-how-to/10-deployment-patterns/` rather than copying content. Single SSOT preserved.
2. **Vite-into-WP-plugin:** The frontend bundling step (Vite → `dist/` → `assets/dist/`) is the genuinely-novel content — older PHP-only patterns didn't cover it.
3. **8 integrity gates:** Each is a one-line shell command, runnable both locally and in CI.
4. **Version sync drift detection:** `package.json` is the SSOT; CI verifies all four locations agree before packaging.
5. **Other archetypes marked "Reference":** Browser-Extension and Go-Binary stay in-tree as reference patterns but are flagged as not-shipped.

## Verification

- ✅ All 6 new files written
- ✅ Parent overview + parent AT file updated and consistent
- ✅ `node scripts/spec-hygiene/00-run-all.mjs` — passed (see plan close-out)
- ✅ `package.json` bumped to v0.34.0

---

*Plan 05 archived 2026-04-25 (UTC+8).*
