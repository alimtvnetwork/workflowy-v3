# PowerShell ↔ WP-Plugin Boundary

> **Version:** 1.0.0
> **Created:** 2026-04-25 (UTC+8)
> **Status:** Canonical — defines what PowerShell tooling is and is NOT in the WorkFlowy WP-plugin context
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** Audit finding F-03

---

## Why This File Exists

The historical `spec/10-powershell-integration/` was authored for a **Go backend + React frontend** project archetype. WorkFlowy is now a **WP-plugin (PHP 8.2 + SQLite) + Vite/React** project. Without an explicit boundary, an AI implementer could mistakenly:

- Treat `run.ps1` as a runtime requirement for the plugin (it is not — WordPress runs the plugin)
- Bundle `powershell.json` inside the plugin ZIP (it must NOT ship)
- Generate Go-specific PowerShell paths in the WP-plugin codebase
- Assume Windows-only deployment (the plugin runs anywhere WordPress runs)

This file makes the boundary unambiguous.

---

## Load-Bearing Boundary Rules (B1–B8)

| # | Rule | Why |
|---|------|-----|
| **B1** | PowerShell is **dev-only tooling** for Windows contributors. It is NEVER a runtime dependency of the shipped plugin. | The plugin runs on any WordPress host (Linux/macOS/Windows); requiring pwsh would break that. |
| **B2** | `run.ps1`, `powershell.json`, and the `templates/` + `examples/` folders MUST be excluded from the plugin ZIP via `.distignore`. | See [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md). |
| **B3** | PowerShell scripts MUST NOT call WordPress APIs, modify the SQLite database, or write to `wp-content/`. | These are plugin-runtime concerns; mixing them creates undocumented coupling. |
| **B4** | Any "build" PowerShell does for WorkFlowy is limited to: (a) `bun install`, (b) `bun run build` (Vite), (c) `composer install --no-dev`, (d) optional `zip` for local plugin packaging. | Anything more belongs in CI (`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md`). |
| **B5** | PowerShell MUST NOT be invoked from PHP code (no `shell_exec('powershell ...')`, no `proc_open` for pwsh). | Server-side shell-out is a security risk and breaks portability. |
| **B6** | Cross-platform parity: every PowerShell convenience script MUST have an equivalent `bash` script (or `package.json` script) so macOS/Linux contributors are not blocked. | See parity table below. |
| **B7** | The Go-specific content in `01-configuration-schema.md`, `02-script-reference/`, `03-integration-guide.md`, and `25-multi-site-deployment.md` is **historical reference only** for WorkFlowy. Treat it as "do not copy verbatim." | Avoids hallucinating Go code paths into a PHP project. |
| **B8** | If a contributor needs Windows-only automation that doesn't fit B4, it goes in `scripts/windows/` at the repo root and is documented in `CONTRIBUTING.md`, NOT in `spec/10-powershell-integration/`. | Keeps spec focused on cross-cutting patterns. |

---

## Parity Table (B6)

Every PowerShell developer convenience MUST have a cross-platform equivalent.

| Task | PowerShell (Windows) | Bash (macOS/Linux) | Cross-platform fallback |
|------|----------------------|--------------------|--------------------------|
| Install all deps | `.\scripts\setup.ps1` | `./scripts/setup.sh` | `bun install && composer install` |
| Build frontend | `.\scripts\build.ps1` | `./scripts/build.sh` | `bun run build` |
| Package plugin ZIP locally | `.\scripts\package.ps1` | `./scripts/package.sh` | (CI only — see archetype) |
| Run PHPStan | `.\scripts\phpstan.ps1` | `./scripts/phpstan.sh` | `vendor/bin/phpstan analyse` |
| Run PHPUnit | `.\scripts\test.ps1` | `./scripts/test.sh` | `vendor/bin/phpunit` |
| Sync version | `.\scripts\sync-version.ps1` | `./scripts/sync-version.sh` | (canonical: bash — see [`04-version-sync.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/04-version-sync.md)) |
| Bump SemVer | `npm version` | `npm version` | (npm/bun built-in) |

**Rule:** If a script lacks one of the three columns, it is incomplete and MUST NOT be merged.

---

## What Goes Where (Decision Matrix)

| Concern | Belongs in… | Example |
|---------|-------------|---------|
| Plugin runtime behaviour | `spec/15-wp-plugin-how-to/` | REST endpoint, SQLite query, hook registration |
| CI/CD pipeline | `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/` | GitHub Actions workflow, ZIP integrity gates |
| Cross-platform dev convenience | `spec/10-powershell-integration/` (this folder) — but limited per B4 | Local build script, local lint script |
| Windows-only contributor automation | `scripts/windows/` + `CONTRIBUTING.md` | Setting Windows env vars, registering local pwsh aliases |
| Frontend build config | `vite.config.ts` + `spec/32-ui-design/` | Bundler options, theme tokens |
| PHP coding standards | `spec/02-coding-guidelines/04-php/` | Enum rules, forbidden patterns |

If a topic doesn't fit any row above, ask before writing — do not invent a new home.

---

## Out of Scope (explicitly NOT in this folder for WorkFlowy)

- ❌ Go binary build / cross-compile (no Go in WorkFlowy)
- ❌ pnpm Plug'n'Play store configuration (project uses **bun**, not pnpm — see `mem://architecture/tech-stack`)
- ❌ Windows Firewall rules for backend ports (the plugin has no standalone server)
- ❌ Multi-site PowerShell deployment orchestration (out of Phase-1 scope per `mem://constraints/spec-only-mode`)
- ❌ PHP-from-PowerShell invocation patterns beyond `composer install`
- ❌ Production deployment via PowerShell (production goes through GitHub Release, not pwsh)

These topics may exist in legacy files in this folder — they are kept for cross-project reuse but are **flagged historical** for WorkFlowy by rule B7.

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent (historical Go+React runner)
- [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md) — Canonical CI/CD pipeline (the production path)
- [`spec/15-wp-plugin-how-to/`](../15-wp-plugin-how-to/00-overview.md) — WP plugin runtime patterns
- `mem://architecture/tech-stack` — Confirms bun (not pnpm) and PHP 8.2 (not Go)
- `mem://constraints/backend-runtime-deferred` — Confirms WordPress + SQLite

---

## Related

**In this section:**

- [`00-overview.md`](./00-overview.md) — Historical Go+React runner overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-POWERSHELLINTEGRATION-01..10`

**See also:**

- [`../13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md) — Canonical production pipeline

---

*PowerShell ↔ WP-Plugin boundary — v1.0.0 — created 2026-04-25 (UTC+8) — closes audit gap F-03.*
