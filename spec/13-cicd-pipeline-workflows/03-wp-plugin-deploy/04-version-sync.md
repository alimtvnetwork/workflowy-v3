# 03.04 — Version Synchronization (`package.json` → PHP)

> **Version:** 1.0.0
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Updated:** 2026-04-25

---

## Purpose

Per pipeline rule **P5**, `package.json` `"version"` is the **single source of truth** for the project version. This file describes the deterministic mechanism that propagates that version into:

1. The plugin header comment (`workflowy.php`) — read by WordPress
2. The `PluginConfigType::Version` enum case — read by the in-plugin updater
3. The git tag (`v{version}`) — triggers the release workflow

Drift between any of these locations MUST cause the release to abort.

---

## Source of Truth

```json
// package.json
{
  "name": "workflowy",
  "version": "0.34.0",
  ...
}
```

This file is editable by humans, by `npm version`, and by Lovable's auto-bump policy (per `mem://~user`: "code changes must bump at least minor version" — note: that rule actually says minor; preserve it).

---

## Sync Targets

### Target 1 — Plugin Header

```php
<?php
/**
 * Plugin Name: WorkFlowy
 * Description: Outliner with infinite nesting, mirrors, and board view.
 * Version: 0.34.0          ← MUST equal package.json "version"
 * Requires at least: 6.4
 * Requires PHP: 8.2
 * Author: WorkFlowy
 * License: GPL-2.0-or-later
 * Text Domain: workflowy
 */
```

### Target 2 — `PluginConfigType` Enum

```php
<?php
namespace Workflowy\Enums;

enum PluginConfigType: string {
    case Slug          = 'workflowy';
    case Version       = '0.34.0';   // ← MUST equal package.json "version"
    case TextDomain    = 'workflowy';
    case MinPhp        = '8.2';
    case MinWordPress  = '6.4';

    public function isEqual(self $other): bool {
        return $this === $other;
    }
}
```

### Target 3 — Git Tag

```bash
git tag "v$(jq -r .version package.json)"
git push origin --tags
```

---

## Sync Script

Create `scripts/sync-version.sh` at the repo root. Run it as part of the release prep checklist (or as a pre-commit hook).

```bash
#!/usr/bin/env bash
set -euo pipefail

VERSION=$(jq -r .version package.json)
PLUGIN_FILE="workflowy.php"
ENUM_FILE="includes/Enums/PluginConfigType.php"

# 1. Update plugin header
sed -i.bak -E "s/(\* Version:\s*)[0-9]+\.[0-9]+\.[0-9]+/\1${VERSION}/" "${PLUGIN_FILE}"
rm -f "${PLUGIN_FILE}.bak"

# 2. Update PluginConfigType enum
sed -i.bak -E "s/(case Version\s*=\s*')[0-9]+\.[0-9]+\.[0-9]+(';)/\1${VERSION}\2/" "${ENUM_FILE}"
rm -f "${ENUM_FILE}.bak"

echo "✅ Synced version ${VERSION} → ${PLUGIN_FILE}, ${ENUM_FILE}"
```

---

## Pipeline Verification (drift detection)

Add this step to the `package` job in [`02-github-actions-workflow.md`](./02-github-actions-workflow.md), before the build:

```yaml
- name: Verify version sync (no drift)
  run: |
    PKG=$(jq -r .version package.json)
    TAG="${GITHUB_REF#refs/tags/v}"
    HEADER=$(grep -oE "Version:\s*[0-9]+\.[0-9]+\.[0-9]+" workflowy.php | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")
    ENUMV=$(grep -oE "case Version\s*=\s*'[0-9]+\.[0-9]+\.[0-9]+'" includes/Enums/PluginConfigType.php | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")

    echo "package.json:       ${PKG}"
    echo "git tag:            ${TAG}"
    echo "plugin header:      ${HEADER}"
    echo "PluginConfigType:   ${ENUMV}"

    if [ "${PKG}" != "${TAG}" ] || [ "${PKG}" != "${HEADER}" ] || [ "${PKG}" != "${ENUMV}" ]; then
      echo "::error::Version drift detected — all four locations must match."
      exit 1
    fi
```

---

## Acceptance Gates

| # | Gate | How to verify |
|---|------|---------------|
| 1 | `package.json` is SSOT | No other file may be edited by humans for version bumps; only via `scripts/sync-version.sh` |
| 2 | Sync script is idempotent | Running it twice in a row produces no diff |
| 3 | CI verifies all four locations | The "Verify version sync" step above is required in the workflow |
| 4 | Drift aborts release | A mismatched version causes job exit code ≠ 0 within 30 seconds |

---

*Version sync — v1.0.0 — 2026-04-25.*
