# CI/CD Pipeline Workflows — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for the CI/CD Pipeline Workflows domain. Per-archetype detail lives in each subfolder's own `97-acceptance-criteria.md`. ID range: `AT-CICD-NN`.

---

## Coverage Map

| # | Topic | Source | ID Range | Status |
|---|-------|--------|----------|--------|
| 1 | Shared conventions | [`16-shared-conventions.md`](./16-shared-conventions.md) | AT-CICD-01..05 | ✅ |
| 2 | GitHub Release standard | [`17-github-release-standard.md`](./17-github-release-standard.md) | AT-CICD-06..08 | ✅ |
| 3 | Vulnerability scanning | [`03-vulnerability-scanning.md`](./03-vulnerability-scanning.md) | AT-CICD-09..10 | ✅ |
| 4 | Browser-Extension archetype | [`01-browser-extension-deploy/`](./01-browser-extension-deploy/00-overview.md) | AT-CICD-11..13 | 📚 Reference |
| 5 | Go-Binary archetype | [`02-go-binary-deploy/`](./02-go-binary-deploy/00-overview.md) | AT-CICD-14..16 | 📚 Reference |
| 6 | **WP-Plugin archetype (canonical)** | [`18-wp-plugin-deploy/`](./18-wp-plugin-deploy/00-overview.md) | **AT-WPPLUGINDEPLOY-01..15** | ✅ Active |

---

## Cross-Cutting Criteria

### AT-CICD-01 — Tag-driven releases only
All release workflows MUST trigger on `push: tags: ['v*']` and never on branch pushes.
Source: [`16-shared-conventions.md`](./16-shared-conventions.md)

### AT-CICD-02 — Concurrency group per ref
Each release workflow MUST set `concurrency.group: release-${{ github.ref }}` with `cancel-in-progress: false`.

### AT-CICD-03 — Version SSOT per archetype
Each archetype MUST declare a single source of truth for the version number (WP-Plugin: `package.json`; Go: `cmd/.../version.go`; Extension: `package.json`).

### AT-CICD-04 — Asset checksum sidecar
Every shipped binary/ZIP MUST be accompanied by a `.sha256` checksum file generated in the same job.

### AT-CICD-05 — Permissions least-privilege
Workflows MUST declare `permissions:` explicitly; bare `contents: write` is acceptable for release; never `permissions: write-all`.

### AT-CICD-06 — Release body from CHANGELOG
The GitHub Release body MUST be extracted from `CHANGELOG.md` between the matching `## [version]` heading and the next `## [` heading.
Source: [`17-github-release-standard.md`](./17-github-release-standard.md)

### AT-CICD-07 — Pre-release detection
A release whose tag contains `-` (e.g. `v0.34.0-rc.1`) MUST be marked `prerelease: true`.

### AT-CICD-08 — Reproducible asset names
Asset names MUST follow `{slug}-v{semver}.{ext}` exactly; no spaces, no Build IDs.

### AT-CICD-09 — Vulnerability scan blocks release
A high or critical CVE in dependencies MUST cause the release pipeline to abort.
Source: [`03-vulnerability-scanning.md`](./03-vulnerability-scanning.md)

### AT-CICD-10 — Audit reports retained
Vulnerability scan output MUST be uploaded as a workflow artifact for 30 days.

### AT-CICD-11..13 — Browser Extension archetype
See [`01-browser-extension-deploy/`](./01-browser-extension-deploy/00-overview.md) — reference patterns only.

### AT-CICD-14..16 — Go Binary archetype
See [`02-go-binary-deploy/`](./02-go-binary-deploy/00-overview.md) — reference patterns only.

### AT-WPPLUGINDEPLOY-01..15 — WP-Plugin archetype (canonical)
See [`18-wp-plugin-deploy/97-acceptance-criteria.md`](./18-wp-plugin-deploy/97-acceptance-criteria.md). 15 concrete, shell-verifiable criteria covering trigger, stage order, ZIP integrity (8 gates), workflow file presence, update-server contract, and version sync drift detection.

---

## Verification

```bash
# List all referenced sources in this folder
grep -rn "AT-CICD-\|AT-WPPLUGINDEPLOY-" spec/13-cicd-pipeline-workflows/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/15-wp-plugin-how-to/10-deployment-patterns/`](../15-wp-plugin-how-to/10-deployment-patterns/00-overview.md) — Canonical WP packaging patterns (referenced by archetype 3)
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Acceptance criteria v2.0.0 — updated 2026-04-25 (UTC+8) — closes audit gap F-02.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).


---

## P13 stub rows

> Auto-appended by [`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs`](../../scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [`40-generate-contract-json.mjs`](../../scripts/spec-hygiene/40-generate-contract-json.mjs). Each row is a **placeholder definition** — replace the body with concrete Given/When/Then + JSON fixture during P2 (I/O table conversion). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-CICD-11 — Browser-Extension archetype reference

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-CICD-14 — Go-Binary archetype reference

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.
