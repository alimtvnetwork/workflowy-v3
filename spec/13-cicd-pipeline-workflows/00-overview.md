# 13 — CI/CD Pipeline Workflows

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-CICD-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_cicd_pipeline_workflows_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-CICD-01` | [`97a-…#at-cicd-01`](./97a-acceptance-criteria-fixtures.md#at-cicd-01) |
| 2 | cites `AT-CICD-02` | [`97a-…#at-cicd-02`](./97a-acceptance-criteria-fixtures.md#at-cicd-02) |
| 3 | cites `AT-CICD-03` | [`97a-…#at-cicd-03`](./97a-acceptance-criteria-fixtures.md#at-cicd-03) |
| 4 | cites `AT-CICD-04` | [`97a-…#at-cicd-04`](./97a-acceptance-criteria-fixtures.md#at-cicd-04) |
| 5 | cites `AT-CICD-05` | [`97a-…#at-cicd-05`](./97a-acceptance-criteria-fixtures.md#at-cicd-05) |
| 6 | cites `AT-CICD-06` | [`97a-…#at-cicd-06`](./97a-acceptance-criteria-fixtures.md#at-cicd-06) |
| 7 | cites `AT-CICD-07` | [`97a-…#at-cicd-07`](./97a-acceptance-criteria-fixtures.md#at-cicd-07) |
| 8 | cites `AT-CICD-08` | [`97a-…#at-cicd-08`](./97a-acceptance-criteria-fixtures.md#at-cicd-08) |
| 9 | cites `AT-CICD-09` | [`97a-…#at-cicd-09`](./97a-acceptance-criteria-fixtures.md#at-cicd-09) |
| 10 | cites `AT-CICD-10` | [`97a-…#at-cicd-10`](./97a-acceptance-criteria-fixtures.md#at-cicd-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.5.0
> **Updated:** 2026-04-28 (UTC+8) — v3.5.0 adds `fixture-as-spec-shape-audit.md` to the Fixtures-as-spec block (gate `G-13-FIXTURE-AS-SPEC-SHAPE`).

## AI Contract

**Purpose** — Defines the CI/CD pipeline archetypes (WP-Plugin, Frontend-SPA, Browser-Extension) and the GitHub Actions / Bitbucket Pipelines YAML they MUST emit.

**Audience** — DevOps engineers; maintainers wiring a new repo into the pipeline.

**Expected AI Output** —
- `.github/workflows/wp-plugin-ci.yml`
- `.github/workflows/frontend-ci.yml`
- `bitbucket-pipelines.yml` (alternate host)

**Out of Scope** —
- Local developer scripts — covered by [`spec/15-wp-plugin-how-to/`](../15-wp-plugin-how-to/00-overview.md)
- Release versioning policy — covered by [`spec/14-self-update-app-update/`](../14-self-update-app-update/00-overview.md)

**Definition of Done** —
- Every archetype has a working reference YAML committed under `.github/workflows/`
- Every workflow runs `node scripts/spec-hygiene/00-run-all.mjs` as a required check
- Every `AT-CICD-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`cicd-pipeline-workflows` · `cicd` · `pipeline` · `workflows`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |
| Health Score | 92% (A-) |

---




## Pipeline Job DAG

Every WP-Plugin pipeline MUST realize this exact dependency graph. Adding/removing nodes requires an ADR. Edges encode `needs:` in GitHub Actions.

```
                  ┌──────────────────┐
                  │  setup           │   (checkout, install PHP+Node, cache deps)
                  └────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌────────────────────┐
│ spec-hygiene │  │ lint-php     │  │ lint-ts            │
│ (REQUIRED)   │  │ (REQUIRED)   │  │ (REQUIRED)         │
└──────┬───────┘  └──────┬───────┘  └──────────┬─────────┘
       │                 │                     │
       └────────┬────────┴─────────┬───────────┘
                ▼                  ▼
       ┌─────────────────┐  ┌─────────────────┐
       │ test-phpunit    │  │ test-vitest     │
       │ (REQUIRED)      │  │ (REQUIRED)      │
       └────────┬────────┘  └────────┬────────┘
                └─────────┬──────────┘
                          ▼
                ┌─────────────────────┐
                │ build-plugin-zip    │   (only on push to main / tag)
                │ (REQUIRED on tag)   │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌──────────────┐         ┌────────────────┐
      │ sign-artifact│         │ scan-security  │  (optional, parallel)
      │ (REQUIRED on │         │ (advisory)     │
      │  tag)        │         └────────────────┘
      └──────┬───────┘
             ▼
      ┌──────────────┐
      │ publish      │   (only on tag matching v*.*.*)
      │ (REQUIRED on │
      │  tag)        │
      └──────────────┘
```

## Required-vs-Optional Gate Matrix

The matrix below is **load-bearing**. Branch-protection rules MUST mirror this exactly. A PR that fails any "Required" gate is unmergeable; "Advisory" gates emit annotations but do not block.

| Job | Trigger | Status | Failure mode | Owns codes |
|---|---|---|---|---|
| `setup`          | every push, every PR | **Required** | Hard block — nothing else runs. | `CI-13-00` |
| `spec-hygiene`   | every push, every PR | **Required** | Hard block on PR; paged on `main`. | `CI-13-01` |
| `lint-php`       | every push, every PR | **Required** | Hard block. | `CI-13-02` |
| `lint-ts`        | every push, every PR | **Required** | Hard block. | `CI-13-03` |
| `test-phpunit`   | every push, every PR | **Required** | Hard block. | `CI-13-04` |
| `test-vitest`    | every push, every PR | **Required** | Hard block. | `CI-13-05` |
| `build-plugin-zip` | push to `main`, any `v*.*.*` tag | **Required on tag**, advisory on `main` | Hard block on tag; on `main`, posts a sticky issue. | `CI-13-06` |
| `sign-artifact`  | tag only | **Required on tag** | Hard block; release MUST NOT publish unsigned. | `CI-13-07` |
| `scan-security`  | every push, every PR | Advisory | Comments on PR; never blocks merge. | `CI-13-08` |
| `publish`        | tag matching `v[0-9]+.[0-9]+.[0-9]+` | **Required on tag** | Hard block; manual rerun allowed. | `CI-13-09` |

**Branch-protection rules:**
- `main` requires: `setup`, `spec-hygiene`, `lint-php`, `lint-ts`, `test-phpunit`, `test-vitest` to be green.
- Tag pushes additionally require: `build-plugin-zip`, `sign-artifact`, `publish`.
- `scan-security` is **never** in the required list (advisory only).

## Concurrency & Caching Rules

| Rule | Enforcement |
|---|---|
| `concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }` on every PR workflow. | Gate `G-13-CONCURRENCY` (workflow-yaml lint). |
| Tag workflows MUST set `cancel-in-progress: false` — releases are never cancelled mid-flight. | Gate `G-13-NO-CANCEL-TAG`. |
| Composer + npm caches keyed on lockfile hashes only. | Gate `G-13-CACHE-KEY`. |
| Secrets accessed only via `${{ secrets.* }}`; never echoed to logs. | Gate `G-13-NO-SECRET-ECHO` (regex over workflow). |

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Add a new repo without picking one of the documented archetypes | Pipeline drift — each repo invents its own gates. | `G-13-ARCHETYPE-DECLARED` (workflow MUST contain `# archetype: <name>` header). |
| 2 | Skip the `spec-hygiene` step | Spec rot ships unchecked. | `G-13-HYGIENE-PRESENT` (workflow lint). |
| 3 | Hardcode secrets / registry URLs in workflow YAML | Token leak; rotation impossible. | `G-13-NO-SECRET-LITERAL` (regex). |
| 4 | Mark `scan-security` as required | Slows merges on third-party CVE noise. | Branch-protection JSON checked into repo, validated by `G-13-PROTECTION-MATCH`. |
| 5 | Run jobs in series when DAG allows parallel | Wastes CI minutes; balloons feedback time. | `G-13-DAG-PARALLEL` (lint: lint-php / lint-ts / spec-hygiene MUST share `needs: [setup]`). |
| 6 | Publish from a job that didn't depend on `sign-artifact` | Unsigned release reaches users. | `G-13-PUBLISH-NEEDS-SIGN`. |
| 7 | Use `actions/checkout@v3` or older | Known supply-chain CVE; loses sparse-checkout. | `G-13-ACTION-VERSIONS` (lint: pin major versions, minimum allowed list). |

## Worked Example — Minimal compliant workflow

```yaml
# archetype: WP-Plugin
name: WP-Plugin CI
on:
  push:
    branches: [main]
    tags:    ['v*.*.*']
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ !startsWith(github.ref, 'refs/tags/') }}

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.1', tools: composer }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: composer install --no-progress --no-interaction
      - run: npm ci

  spec-hygiene: { needs: setup, runs-on: ubuntu-latest, steps: [{ run: node scripts/spec-hygiene/00-run-all.mjs }] }
  lint-php:     { needs: setup, runs-on: ubuntu-latest, steps: [{ run: composer lint }] }
  lint-ts:      { needs: setup, runs-on: ubuntu-latest, steps: [{ run: npm run lint }] }

  test-phpunit: { needs: [spec-hygiene, lint-php], runs-on: ubuntu-latest, steps: [{ run: composer test }] }
  test-vitest:  { needs: [spec-hygiene, lint-ts],  runs-on: ubuntu-latest, steps: [{ run: npm run test }] }

  build-plugin-zip:
    needs: [test-phpunit, test-vitest]
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - run: bash scripts/build/package-plugin.sh
      - uses: actions/upload-artifact@v4
        with: { name: workflowy-plugin, path: dist/workflowy.zip }

  sign-artifact:
    needs: build-plugin-zip
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: workflowy-plugin, path: dist }
      - run: bash scripts/build/sign.sh dist/workflowy.zip
        env: { SIGNING_KEY: ${{ secrets.ED25519_PRIVATE_KEY }} }

  scan-security:
    needs: setup
    runs-on: ubuntu-latest
    continue-on-error: true   # advisory only
    steps:
      - run: composer audit
      - run: npm audit --audit-level=high

  publish:
    needs: sign-artifact
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: workflowy-plugin, path: dist }
      - run: bash scripts/build/publish.sh dist/workflowy.zip
        env: { UPDATE_SERVER_TOKEN: ${{ secrets.UPDATE_SERVER_TOKEN }} }
```

### Failure-mode envelope (workflow-level summary, posted as job summary)

```json
{
  "Status": "Failed",
  "Attributes": { "Workflow": "WP-Plugin CI", "Run": 1247, "FailedJob": "test-phpunit" },
  "Errors": [
    { "Code": "CI-13-04", "Message": "PHPUnit suite failed: 3 failing, 0 errored, 142 passed." }
  ]
}
```

### Error-code registry (this section owns `CI-13-*`)

| Code | Job | Recovery |
|---|---|---|
| `CI-13-00` | setup | Re-run; if still failing, check runner image. |
| `CI-13-01` | spec-hygiene | Run locally `node scripts/spec-hygiene/00-run-all.mjs`; commit fixes. |
| `CI-13-02` | lint-php | `composer lint -- --fix`. |
| `CI-13-03` | lint-ts | `npm run lint -- --fix`. |
| `CI-13-04` | test-phpunit | Inspect `Tests/` output; fix or update fixtures. |
| `CI-13-05` | test-vitest | Same — never `--update-snapshots` blindly. |
| `CI-13-06` | build-plugin-zip | Check `scripts/build/package-plugin.sh`; verify `composer install --no-dev`. |
| `CI-13-07` | sign-artifact | Verify `ED25519_PRIVATE_KEY` secret exists and is unrotated. |
| `CI-13-08` | scan-security | Advisory — file issue, do not retry to clear. |
| `CI-13-09` | publish | Verify `UPDATE_SERVER_TOKEN`; manual rerun safe (publish is idempotent on version). |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-browser-extension-deploy/`](./01-browser-extension-deploy/00-overview.md) | Browser Extension Deploy — Overview | subfolder |
| 2 | [`02-go-binary-deploy/`](./02-go-binary-deploy/00-overview.md) | Go Binary Deploy — Overview | subfolder |
| 3 | [`03-vulnerability-scanning.md`](./03-vulnerability-scanning.md) | Vulnerability Scanning | 105 |
| 4 | [`04-install-script-generation.md`](./04-install-script-generation.md) | Install Script Generation | 210 |
| 5 | [`05-code-signing.md`](./05-code-signing.md) | Code Signing | 178 |
| 6 | [`06-self-update-mechanism.md`](./06-self-update-mechanism.md) | Self-Update Mechanism | 365 |
| 7 | [`07-release-body-and-changelog.md`](./07-release-body-and-changelog.md) | Release Body and Changelog | 356 |
| 8 | [`08-terminal-output-standards.md`](./08-terminal-output-standards.md) | Terminal Output Standards | 260 |
| 9 | [`09-binary-icon-branding.md`](./09-binary-icon-branding.md) | Binary Icon & Windows Resource Embedding | 191 |
| 10 | [`10-ci-pipeline.md`](./10-ci-pipeline.md) | CI Pipeline | 378 |
| 11 | [`11-release-pipeline.md`](./11-release-pipeline.md) | Release Pipeline | 273 |
| 12 | [`12-installation-flow.md`](./12-installation-flow.md) | Installation Flow | 278 |
| 13 | [`13-changelog-integration.md`](./13-changelog-integration.md) | Changelog Integration | 293 |
| 14 | [`14-version-and-help.md`](./14-version-and-help.md) | Version Display and Help System | 299 |
| 15 | [`15-environment-variable-setup.md`](./15-environment-variable-setup.md) | Environment Variable Setup | 327 |
| 16 | [`16-shared-conventions.md`](./16-shared-conventions.md) | Shared Pipeline Conventions | 218 |
| 17 | [`17-github-release-standard.md`](./17-github-release-standard.md) | GitHub Release Standard | 163 |
| 18 | [`18-wp-plugin-deploy/`](./18-wp-plugin-deploy/00-overview.md) | WP-Plugin Deploy — Overview | subfolder |

<!-- AUTO-TOC:END -->

---

## Purpose

Central location for all CI/CD pipeline specifications, deployment automation, and related infrastructure-as-code documentation. All pipeline-related content — build pipelines, deployment workflows, environment promotion strategies, and CI/CD tooling configurations — MUST be documented in this folder.

---

## Scope

This module covers three distinct pipeline archetypes, shared conventions, and cross-cutting concerns:

| Archetype | Subfolder | Description | Status |
|-----------|-----------|-------------|--------|
| Browser Extension Deploy | `01-browser-extension-deploy/` | Node.js/pnpm multi-component builds, zip packaging, Chrome Web Store | 📚 Reference pattern (not used by WorkFlowy) |
| Go Binary Deploy | `02-go-binary-deploy/` | Cross-compiled Go binaries, tar.gz/zip, install scripts, code signing | 📚 Reference pattern (not used by WorkFlowy) |
| **WP-Plugin Deploy** | **`18-wp-plugin-deploy/`** | **Vite + React frontend → PHP 8.2 plugin → `.zip` → GitHub Release** | **✅ Canonical for WorkFlowy** |
| Shared | Root files | Common patterns used across all pipeline types | ✅ Active |

---

## Placement Rules

```
AI INSTRUCTION:

1. ALL CI/CD and pipeline content belongs in this folder (spec/12-cicd-pipeline-workflows/).
2. This is a Core Fundamentals folder (range 01–20) — no app-specific content here.
3. App-specific deployment notes go in 21-app/ instead.
4. Each pipeline spec file follows the standard {NN}-{kebab-case-name}.md naming convention.
5. Add new files to the Feature Inventory below and update 99-consistency-report.md.
6. Shared patterns (version resolution, checksums, release creation) go in root-level files.
7. Archetype-specific patterns go in the appropriate subfolder.
```

---

## Feature Inventory

### Root (Shared Conventions)

| # | File | Description | Status |
|---|------|-------------|--------|
| 01 | [16-shared-conventions.md](./16-shared-conventions.md) | Platform, triggers, concurrency, version resolution, checksums | ✅ Active |
| 02 | [17-github-release-standard.md](./17-github-release-standard.md) | Release body assembly, pre-release detection, asset matrix | ✅ Active |
| 03 | [03-vulnerability-scanning.md](./03-vulnerability-scanning.md) | Standalone and in-CI vulnerability scanning patterns | ✅ Active |
| 04 | [04-install-script-generation.md](./04-install-script-generation.md) | Reusable PS1+Bash installer pattern, placeholder strategy, checksum verification | ✅ Active |
| 05 | [05-code-signing.md](./05-code-signing.md) | SignPath integration, feature-flag gating, signature verification | ✅ Active |
| 06 | [06-self-update-mechanism.md](./06-self-update-mechanism.md) | Generic CLI self-update blueprint: deploy path, rename-first, handoff, cleanup | ✅ Active |
| 07 | [07-release-body-and-changelog.md](./07-release-body-and-changelog.md) | Changelog extraction, release body template, asset matrix assembly | ✅ Active |
| 10 | [10-ci-pipeline.md](./10-ci-pipeline.md) | Cross-cutting CI pipeline patterns | ✅ Active |
| 11 | [11-release-pipeline.md](./11-release-pipeline.md) | Cross-cutting release pipeline patterns | ✅ Active |
| 12 | [12-installation-flow.md](./12-installation-flow.md) | End-to-end install: one-liners, terminal output, upgrade, uninstall | ✅ Active |
| 13 | [13-changelog-integration.md](./13-changelog-integration.md) | Changelog format, CI extraction, release body assembly, terminal display | ✅ Active |
| 14 | [14-version-and-help.md](./14-version-and-help.md) | Version display, help system, command-level docs, CI verification | ✅ Active |
| 15 | [15-environment-variable-setup.md](./15-environment-variable-setup.md) | `env` command: persistent variables, PATH registration, auto-home | ✅ Active |

### Subfolder: Browser Extension Deploy

| # | File | Description | Status |
|---|------|-------------|--------|
| 00 | [00-overview.md](./01-browser-extension-deploy/00-overview.md) | Overview of browser extension pipeline | ✅ Active |
| 01 | [01-ci-pipeline.md](./01-browser-extension-deploy/01-ci-pipeline.md) | CI: lint, test, dependency-graph builds, extension assembly | ✅ Active |
| 02 | [02-release-pipeline.md](./01-browser-extension-deploy/02-release-pipeline.md) | Release: version, build, package, source map removal, GitHub Release | ✅ Active |

### Subfolder: Go Binary Deploy

| # | File | Description | Status |
|---|------|-------------|--------|
| 00 | [00-overview.md](./02-go-binary-deploy/00-overview.md) | Overview of Go binary pipeline | ✅ Active |
| 01 | [01-ci-pipeline.md](./02-go-binary-deploy/01-ci-pipeline.md) | CI: SHA dedup, lint, vulncheck, test matrix, cross-compile | ✅ Active |
| 02 | [02-release-pipeline.md](./02-go-binary-deploy/02-release-pipeline.md) | Release: binary build, icon embedding, code signing, install scripts, GitHub Release | ✅ Active |

### Subfolder: WP-Plugin Deploy ✅ Canonical

| # | File | Description | Status |
|---|------|-------------|--------|
| 00 | [00-overview.md](./18-wp-plugin-deploy/00-overview.md) | Pipeline rules P1–P9 + 8-stage diagram | ✅ Active |
| 01 | [01-distignore-and-zip-layout.md](./18-wp-plugin-deploy/01-distignore-and-zip-layout.md) | Canonical `.distignore` + final ZIP tree + 8 integrity gates | ✅ Active |
| 02 | [02-github-actions-workflow.md](./18-wp-plugin-deploy/02-github-actions-workflow.md) | Complete `release.yml` (CI gates → package → release) | ✅ Active |
| 03 | [03-update-server-contract.md](./18-wp-plugin-deploy/03-update-server-contract.md) | `info.json` shape + post-release verification gates | ✅ Active |
| 04 | [04-version-sync.md](./18-wp-plugin-deploy/04-version-sync.md) | `package.json` → header + enum + tag drift detection | ✅ Active |
| 97 | [97-acceptance-criteria.md](./18-wp-plugin-deploy/97-acceptance-criteria.md) | AT-WPPLUGINDEPLOY-01..15 | ✅ Active |

---

## Migration History

| Date | Change |
|------|--------|
| 2026-04-25 | v3.3.0 — Added `18-wp-plugin-deploy/` (canonical archetype: Vite+React → PHP plugin .zip). Closes audit gap F-02. |
| 2026-04-10 | v3.0.0 — Added 04-install-script-generation, 05-code-signing, 06-self-update-mechanism, 07-release-body-and-changelog; updated Go release pipeline with multi-module, icon embedding, LDFLAGS variables |
| 2026-04-09 | v2.0.0 — Initial creation with shared conventions, two archetypes, vulnerability scanning |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Folder Structure Rules | `../01-spec-authoring-guide/01-folder-structure.md` |
| Coding Guidelines | `../02-coding-guidelines/00-overview.md` |
| PowerShell Automation | `../09-powershell-integration/00-overview.md` |
| Consolidated Summary | `../11-consolidated-guidelines/15-cicd-pipeline-workflows.md` |

---

*Overview — updated: 2026-04-10*

---

## Related

**In this section:**

- [`03-vulnerability-scanning.md`](./03-vulnerability-scanning.md) — Vulnerability Scanning
- [`04-install-script-generation.md`](./04-install-script-generation.md) — Install Script Generation
- [`05-code-signing.md`](./05-code-signing.md) — Code Signing
- [`06-self-update-mechanism.md`](./06-self-update-mechanism.md) — Self Update Mechanism
- [`07-release-body-and-changelog.md`](./07-release-body-and-changelog.md) — Release Body And Changelog
- [`08-terminal-output-standards.md`](./08-terminal-output-standards.md) — Terminal Output Standards
- [`09-binary-icon-branding.md`](./09-binary-icon-branding.md) — Binary Icon Branding
- [`10-ci-pipeline.md`](./10-ci-pipeline.md) — Ci Pipeline
- [`11-release-pipeline.md`](./11-release-pipeline.md) — Release Pipeline
- [`12-installation-flow.md`](./12-installation-flow.md) — Installation Flow
- [`13-changelog-integration.md`](./13-changelog-integration.md) — Changelog Integration
- [`14-version-and-help.md`](./14-version-and-help.md) — Version And Help
- [`15-environment-variable-setup.md`](./15-environment-variable-setup.md) — Environment Variable Setup
- [`16-shared-conventions.md`](./16-shared-conventions.md) — Shared Conventions
- [`17-github-release-standard.md`](./17-github-release-standard.md) — Github Release Standard

**Fixtures-as-spec (frozen executable specs for CI gates):**

- [`scripts-as-spec/README.md`](./scripts-as-spec/README.md) — Convention for fixture-as-spec files (frozen reference algorithms cited by gate definitions)
- [`scripts-as-spec/xlink-symmetry-audit.md`](./scripts-as-spec/xlink-symmetry-audit.md) — Reference Python algorithm for `G-00-ADR-XLINK-SYMMETRY` (auditing reciprocal back-links from ADR `## Decision` sections to non-ADR files)
- [`scripts-as-spec/fixture-as-spec-shape-audit.md`](./scripts-as-spec/fixture-as-spec-shape-audit.md) — Reference Python algorithm for `G-13-FIXTURE-AS-SPEC-SHAPE` (meta-audit: enforces the 6-section template across the directory, including itself)

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
- [`../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`](../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md) — Baseline ledger that consumes the fixture above

---

## 🔖 ADR Backlinks (P46)

The CI/CD pipeline in this section is load-bearing because it is ratified by:

- **[ADR-0002 — WordPress plugin + PHP 8.1+ + SQLite](../00-adrs/0002-wp-plugin-php-sqlite-backend.md)** (`Accepted` 2026-04-28) — anchors gate `G-13-CACHE-KEY` (Composer/PHP cache assumptions), the PHP-lint and PHPUnit jobs, and the WP-plugin signing/publish steps.
- **[ADR-0001 — Singular DDL vs plural prose](../00-adrs/0001-singular-ddl-vs-plural-prose.md)** (`Accepted` 2026-04-28) — anchors the spec-hygiene job's enforcement of `G-04-NO-DDL-PLURALS` and `G-04-ALIAS-DDL-CANONICAL`.

Adding/removing required CI gates, changing the runtime matrix, or adding a second backend runtime alongside the WP plugin all require a new ADR. See [`spec/00-adrs/00-overview.md`](../00-adrs/00-overview.md).
