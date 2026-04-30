# 03.01 — `.distignore` and Final ZIP Layout

> **Version:** 1.0.0
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Updated:** 2026-04-25

---

## Purpose

(gate **G-10-BOUNDARY-DISTIGNORE-EXCLUDED**) Defines (a) the canonical `.distignore` contract that excludes development files from the release ZIP and (b) the exact directory tree that MUST appear inside `workflowy-v{semver}.zip`.

---

## Canonical `.distignore`

This file MUST live at the repository root. Lines starting with `#` are comments; blank lines ignored. (gate **G-10-BOUNDARY-DISTIGNORE-EXCLUDED**) Patterns are passed verbatim to `rsync --exclude-from=`.

```gitignore
# === Source-of-truth files (compiled into dist/) ===
src/
public/
index.html
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
tailwind.config.ts
postcss.config.js

# === Node tooling ===
node_modules/
package-lock.json
bun.lock
bun.lockb
.npmrc

# === PHP dev tooling ===
tests/
phpunit.xml
phpstan.neon
phpstan-bootstrap.php
composer.lock
composer.json
.php-cs-fixer.php

# === Specifications and docs (NEVER ship to production) ===
spec/
docs/
.lovable/
README.md
readme.md
CHANGELOG.md

# === VCS / CI ===
.git/
.github/
.gitignore
.gitattributes

# === Editor / OS ===
.vscode/
.idea/
.DS_Store
Thumbs.db
*.log
*.swp

# === Build artifacts (intermediate, not shipped) ===
dist-ssr/
coverage/
.turbo/
.cache/

# === Lovable infrastructure ===
.release/
mem/
```

> **Rule (P1, P2):** `dist/` is **NOT** excluded — it MUST be present inside `assets/dist/` in the final ZIP. (gate **G-10-BOUNDARY-DISTIGNORE-EXCLUDED**) The release script copies it explicitly during stage 5 (Assemble).

---

## Final ZIP Tree (after stages 1–6)

```
workflowy-v0.34.0.zip
└── workflowy/                       ← single top-level folder (P4)
    ├── workflowy.php                ← main plugin file with version header
    ├── uninstall.php                ← cleanup hook
    ├── composer.json                ← (kept for autoloader path resolution)
    ├── vendor/                      ← composer install --no-dev output
    │   ├── autoload.php
    │   └── composer/
    ├── includes/                    ← PHP source (Enums/, Helpers/, Rest/, etc.)
    │   ├── Bootstrap.php
    │   ├── Enums/
    │   ├── Helpers/
    │   └── Rest/
    ├── assets/
    │   ├── dist/                    ← Vite build output (P2)
    │   │   ├── index.html
    │   │   ├── assets/
    │   │   │   ├── index-{hash}.js
    │   │   │   └── index-{hash}.css
    │   │   └── manifest.json
    │   └── images/                  ← static branding (icon, banner)
    └── data/                        ← runtime SQLite seed (created on activation)
        └── .gitkeep
```

---

## ZIP Integrity Acceptance Gates

| # | Check | Verification command |
|---|-------|----------------------|
| 1 | Single top-level folder | `unzip -l workflowy-v0.34.0.zip \| awk '{print $4}' \| cut -d/ -f1 \| sort -u \| wc -l` returns `1` |
| 2 | Main plugin file at root | `unzip -p workflowy-v0.34.0.zip workflowy/workflowy.php \| grep -c "Plugin Name"` returns `1` |
| 3 | No double-nesting | `unzip -l workflowy-v0.34.0.zip \| grep -c "workflowy/workflowy/"` returns `0` |
| 4 | Vite bundle present | `unzip -l workflowy-v0.34.0.zip \| grep -c "assets/dist/assets/index-.*\.js"` ≥ `1` |
| 5 | No source files | `unzip -l workflowy-v0.34.0.zip \| grep -cE "^.*workflowy/(src/\|spec/\|tests/\|node_modules/)"` returns `0` |
| 6 | Vendor autoloader present | `unzip -l workflowy-v0.34.0.zip \| grep -c "vendor/autoload.php"` returns `1` |
| 7 | No dev dependencies | `unzip -l workflowy-v0.34.0.zip \| grep -c "vendor/phpunit/"` returns `0` |
| 8 | SHA-256 checksum file alongside | `test -f workflowy-v0.34.0.zip.sha256 && sha256sum -c workflowy-v0.34.0.zip.sha256` exits `0` |

All 8 gates MUST pass before stage 8 (Release) executes. See [`02-github-actions-workflow.md`](./02-github-actions-workflow.md) for the verification job.

---

*Distignore + ZIP layout — v1.0.0 — 2026-04-25.*
