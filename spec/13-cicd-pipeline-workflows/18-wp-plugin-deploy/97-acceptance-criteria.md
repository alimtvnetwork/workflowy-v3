# WP-Plugin Deploy — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-25 (UTC+8)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **ID range:** `AT-WPPLUGINDEPLOY-01..15`

---

## Purpose

Testable acceptance criteria for the WP-plugin CI/CD archetype. Each criterion is independently verifiable via shell command, GitHub Actions log inspection, or static spec inspection. Closes audit finding **F-02**.

---

## Coverage Map

| ID | Topic | Source |
|----|-------|--------|
| AT-WPPLUGINDEPLOY-01 | Pipeline trigger | [`00-overview.md` §"Load-Bearing Pipeline Rules"](./00-overview.md) |
| AT-WPPLUGINDEPLOY-02 | Pipeline stage order | [`00-overview.md` §"Pipeline Stages"](./00-overview.md) |
| AT-WPPLUGINDEPLOY-03 | `.distignore` shipped | [`01-distignore-and-zip-layout.md`](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-04 | ZIP single top-level folder | [`01-distignore-and-zip-layout.md` Gate 1](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-05 | Vite bundle in `assets/dist/` | [`01-distignore-and-zip-layout.md` Gate 4](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-06 | No source files in ZIP | [`01-distignore-and-zip-layout.md` Gate 5](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-07 | Vendor autoloader present | [`01-distignore-and-zip-layout.md` Gate 6](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-08 | No dev deps in vendor/ | [`01-distignore-and-zip-layout.md` Gate 7](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-09 | SHA-256 sidecar published | [`01-distignore-and-zip-layout.md` Gate 8](./01-distignore-and-zip-layout.md) |
| AT-WPPLUGINDEPLOY-10 | Workflow file present at canonical path | [`02-github-actions-workflow.md`](./02-github-actions-workflow.md) |
| AT-WPPLUGINDEPLOY-11 | CI gates job blocks the package job | [`02-github-actions-workflow.md` `needs:` chain](./02-github-actions-workflow.md) |
| AT-WPPLUGINDEPLOY-12 | `info.json` shape matches schema | [`03-update-server-contract.md`](./03-update-server-contract.md) |
| AT-WPPLUGINDEPLOY-13 | Update manifest checksum URL resolves | [`03-update-server-contract.md` Gate 4](./03-update-server-contract.md) |
| AT-WPPLUGINDEPLOY-14 | Version sync drift detection in CI | [`04-version-sync.md`](./04-version-sync.md) |
| AT-WPPLUGINDEPLOY-15 | `package.json` is the only human-edited version source | [`04-version-sync.md` Gate 1](./04-version-sync.md) |

---

## Criteria

### AT-WPPLUGINDEPLOY-01 — Tag-driven trigger

**Verify:** The release workflow MUST be triggered ONLY by a git tag matching `v*.*.*`.

```bash
grep -A2 "^on:" .github/workflows/release.yml | grep -E "tags:|v\*\.\*\.\*"
```

Pass = both lines present, `branches:` is absent under `on.push`.

---

### AT-WPPLUGINDEPLOY-02 — Stage order enforced

**Verify:** Job dependency chain MUST be `ci-gates → package → release`.

```bash
yq '.jobs.package.needs' .github/workflows/release.yml   # → ci-gates
yq '.jobs.release.needs' .github/workflows/release.yml   # → package
```

---

### AT-WPPLUGINDEPLOY-03 — `.distignore` present

**Verify:** Repo root MUST contain `.distignore` matching the canonical contract.

```bash
test -f .distignore && grep -q "^src/$" .distignore && grep -q "^spec/$" .distignore
```

---

### AT-WPPLUGINDEPLOY-04 — Single top-level folder

```bash
[ "$(unzip -l workflowy-v*.zip | awk 'NR>3 && NF>=4 {print $4}' | cut -d/ -f1 | sort -u | grep -c .)" = "1" ]
```

---

### AT-WPPLUGINDEPLOY-05 — Vite bundle present at `assets/dist/`

```bash
unzip -l workflowy-v*.zip | grep -qE "workflowy/assets/dist/assets/index-.*\.(js|css)"
```

---

### AT-WPPLUGINDEPLOY-06 — No source files in ZIP

```bash
! unzip -l workflowy-v*.zip | grep -qE "workflowy/(src/|spec/|tests/|node_modules/|vite\.config\.ts)"
```

---

### AT-WPPLUGINDEPLOY-07 — Composer autoloader present

```bash
unzip -l workflowy-v*.zip | grep -q "workflowy/vendor/autoload.php"
```

---

### AT-WPPLUGINDEPLOY-08 — No dev deps in vendor/

```bash
! unzip -l workflowy-v*.zip | grep -qE "workflowy/vendor/(phpunit|phpstan|squizlabs)"
```

---

### AT-WPPLUGINDEPLOY-09 — SHA-256 sidecar

```bash
test -f workflowy-v*.zip.sha256 && sha256sum -c workflowy-v*.zip.sha256
```

---

### AT-WPPLUGINDEPLOY-10 — Workflow at canonical path

```bash
test -f .github/workflows/release.yml
```

---

### AT-WPPLUGINDEPLOY-11 — CI gates block package

`yq '.jobs.package.needs' .github/workflows/release.yml` MUST equal `ci-gates`. Removing the `needs:` line MUST cause this AT to fail.

---

### AT-WPPLUGINDEPLOY-12 — `info.json` schema

A live `info.json` MUST contain all 11 required fields listed in [`03-update-server-contract.md`](./03-update-server-contract.md):

```bash
jq -e '.name and .slug and .version and .tested and .requires and .requires_php and .download_url and .checksum_url and .checksum_alg and .released_at and .changelog' info.json
```

---

### AT-WPPLUGINDEPLOY-13 — Manifest checksum verifies download

```bash
URL=$(jq -r .download_url info.json)
SUM=$(jq -r .checksum_url info.json)
curl -fsL "$URL" -o /tmp/x.zip
curl -fsL "$SUM" | sed "s|.*  |$(basename /tmp/x.zip)  |" > /tmp/x.zip.sha256
(cd /tmp && sha256sum -c x.zip.sha256)
```

---

### AT-WPPLUGINDEPLOY-14 — Drift detection in CI

The "Verify version sync" step MUST exist in `release.yml` and exit non-zero when `package.json`, the git tag, the plugin header, and `PluginConfigType::Version` disagree. Verifiable by intentionally desyncing one value on a feature branch and observing CI failure.

---

### AT-WPPLUGINDEPLOY-15 — Single human-editable version

Only `package.json` may be hand-edited for version bumps. Plugin header and `PluginConfigType` MUST be updated exclusively via `scripts/sync-version.sh`. Verifiable by `git log` audit + presence of the script.

---

## Verification

```bash
# List all referenced sources in this folder
grep -rn "AT-WPPLUGINDEPLOY-" spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

*Acceptance criteria v1.0.0 — created 2026-04-25 (UTC+8) — closes audit gap F-02.*
