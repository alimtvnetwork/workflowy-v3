# Deployment Patterns — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-DEPLOYMENTPATTERNS-01` … `AT-DEPLOYMENTPATTERNS-16`

---

## Criteria

### Versioning & distribution (files 01, 02, 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEPLOYMENTPATTERNS-01 | Versions follow **strict SemVer** (`MAJOR.MINOR.PATCH`); pre-release suffixes use the documented `-alpha.N` / `-beta.N` / `-rc.N` form only. | [`01-versioning-strategy.md`](./01-versioning-strategy.md) |
| AT-DEPLOYMENTPATTERNS-02 | Plugin header `Version:` MUST match `package.json` / `composer.json` / `<plugin>.php` byte-identical; divergence is a release-engineering bug. | [`01-versioning-strategy.md`](./01-versioning-strategy.md) |
| AT-DEPLOYMENTPATTERNS-03 | Distributed plugin folder structure matches §02 exactly (no `node_modules/`, `tests/`, `.git/`, `.lovable/` shipped); shipping dev-only artifacts fails review. | [`02-distribution-structure.md`](./02-distribution-structure.md) |
| AT-DEPLOYMENTPATTERNS-04 | Release ZIP root MUST be the plugin slug folder (NOT loose files); a ZIP that extracts to CWD instead of `<slug>/…` fails review. | [`03-zip-packaging.md`](./03-zip-packaging.md) |

### Update server & self-update (files 04, 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEPLOYMENTPATTERNS-05 | The update server response is a JSON envelope matching §04 schema (`version`, `download_url`, `tested`, `requires`, `changelog_url`); ad-hoc fields are forbidden. | [`04-update-server.md`](./04-update-server.md), [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) |
| AT-DEPLOYMENTPATTERNS-06 | Self-update MUST snapshot the previous version before swap and rollback automatically on (a) checksum mismatch, (b) post-swap activation failure, (c) manual rollback request; missing rollback is a Code-Red availability bug. | [`05-self-update-rollback.md`](./05-self-update-rollback.md) |
| AT-DEPLOYMENTPATTERNS-07 | Downloaded update artifacts MUST verify a SHA-256 checksum against the server's signed manifest before extraction; unsigned downloads are a Code-Red supply-chain bug. | [`05-self-update-rollback.md`](./05-self-update-rollback.md) |

### URL resolution & update config enum (files 06, 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEPLOYMENTPATTERNS-08 | The update-server URL is resolved via `UpdateConfigType` (NOT a hardcoded constant); changing environments (dev/staging/prod) MUST require zero code changes. | [`06-url-resolution.md`](./06-url-resolution.md), [`07-update-config-enum.md`](./07-update-config-enum.md) |
| AT-DEPLOYMENTPATTERNS-09 | `UpdateChannel` enum cases (Stable, Beta, Nightly) are the SSOT; channel as free-text or boolean is forbidden. | [`07-update-config-enum.md`](./07-update-config-enum.md), [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) |

### Changelog & uninstall (files 08, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEPLOYMENTPATTERNS-10 | Changelog format MUST match Keep-a-Changelog 1.1 (sections: Added/Changed/Deprecated/Removed/Fixed/Security); free-form prose changelogs fail review. | [`08-changelog-format.md`](./08-changelog-format.md) |
| AT-DEPLOYMENTPATTERNS-11 | Every release MUST include a changelog entry with date, version, and at least one bullet; an empty release section fails the release gate. | [`08-changelog-format.md`](./08-changelog-format.md) |
| AT-DEPLOYMENTPATTERNS-12 | Uninstall MUST remove ALL plugin tables, options, transients, cron events, and uploaded files (idempotent); leaking artifacts is a Code-Red lifecycle bug. | [`09-uninstall-cleanup.md`](./09-uninstall-cleanup.md), [`../07-reference-implementations/97-acceptance-criteria.md`](../07-reference-implementations/97-acceptance-criteria.md) |

### Trait decomposition, CI/CD, summary (files 10, 11, 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEPLOYMENTPATTERNS-13 | The deployment subsystem decomposes into single-responsibility traits per §10 (`Packager`, `Uploader`, `UpdateNotifier`, `Rollbacker`); god-classes mixing responsibilities fail review. | [`10-trait-decomposition.md`](./10-trait-decomposition.md) |
| AT-DEPLOYMENTPATTERNS-14 | CI MUST run on every PR: lint + unit tests + build + ZIP packaging dry-run + spec-hygiene; missing any step is a release-gate bug. | [`11-cicd-automation.md`](./11-cicd-automation.md) |
| AT-DEPLOYMENTPATTERNS-15 | CD MUST tag the release, generate the ZIP, upload to the update server, and publish the manifest atomically — partial deploys (manifest updated but ZIP missing) are a Code-Red bug. | [`11-cicd-automation.md`](./11-cicd-automation.md) |
| AT-DEPLOYMENTPATTERNS-16 | The §12 summary checklist gates every release: SemVer correct, version mirrored, ZIP layout valid, changelog present, uninstall idempotent, CI green, signed manifest published. | [`12-summary.md`](./12-summary.md) |

---

## Verification

```bash
# Version drift across files
grep -E '"version"' package.json composer.json 2>/dev/null
grep -E '^\s*\*\s*Version:' includes/../*.php 2>/dev/null

# Forbidden artifacts in dist
unzip -l dist/*.zip | grep -E 'node_modules/|\.git/|tests/|\.lovable/'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../07-reference-implementations/97-acceptance-criteria.md`](../07-reference-implementations/97-acceptance-criteria.md) — Uninstall lifecycle
- [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) — Enum SSOT (UpdateChannel)
- [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) — Envelope contract

---

*Curated 2026-04-25 — closes A-25 (batch 14). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
