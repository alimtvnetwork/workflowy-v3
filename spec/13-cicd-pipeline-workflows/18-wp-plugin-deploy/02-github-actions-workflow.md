# 03.02 — GitHub Actions Release Workflow

> **Version:** 1.0.0
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Updated:** 2026-04-25

---

## Purpose

The complete, copy-pastable `.github/workflows/release.yml` for the WorkFlowy plugin. Triggered by tag pushes matching `v*.*.*`. Implements all 8 stages from the overview pipeline diagram.

---

## File Location

```
.github/workflows/release.yml
```

---

## Canonical Workflow

```yaml
name: Release WorkFlowy Plugin

on:
  push:
    tags:
      - 'v*.*.*'

# Concurrency: one release per tag at a time (see ../16-shared-conventions.md)
concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write   # needed for softprops/action-gh-release

env:
  PLUGIN_SLUG: workflowy
  NODE_VERSION: '20'
  PHP_VERSION: '8.2'

jobs:
  # ---------------------------------------------------------------- #
  # Stage 2: CI GATES                                                #
  # ---------------------------------------------------------------- #
  ci-gates:
    name: CI Gates (TS, PHP, audit)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          tools: composer:v2

      - name: Install JS deps
        run: bun install --frozen-lockfile

      - name: TypeScript build (no emit)
        run: bunx tsc --noEmit

      - name: ESLint
        run: bunx eslint src --max-warnings 0

      - name: npm audit (high/critical only)
        run: bun audit --severity high

      - name: Install PHP deps
        run: composer install --prefer-dist --no-progress

      - name: PHPStan
        run: vendor/bin/phpstan analyse --no-progress

      - name: PHPUnit
        run: vendor/bin/phpunit --no-coverage

  # ---------------------------------------------------------------- #
  # Stages 3–7: BUILD + ASSEMBLE + PACKAGE + CHECKSUM                #
  # ---------------------------------------------------------------- #
  package:
    name: Package plugin ZIP
    needs: ci-gates
    runs-on: ubuntu-latest
    outputs:
      zip-name: ${{ steps.meta.outputs.zip-name }}
      version:  ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          tools: composer:v2

      - name: Resolve version + zip name
        id: meta
        run: |
          VERSION="${GITHUB_REF#refs/tags/v}"
          ZIP="${PLUGIN_SLUG}-v${VERSION}.zip"
          echo "version=${VERSION}"   >> "$GITHUB_OUTPUT"
          echo "zip-name=${ZIP}"      >> "$GITHUB_OUTPUT"

      # ---- Stage 3: FRONTEND ---- #
      - name: Install JS deps
        run: bun install --frozen-lockfile

      - name: Build Vite frontend
        run: bun run build
        # produces dist/

      # ---- Stage 4: PHP DEPS ---- #
      - name: Install PHP prod deps
        run: composer install --no-dev --optimize-autoloader --no-progress

      # ---- Stage 5: ASSEMBLE ---- #
      - name: Sync into staging dir
        run: |
          STAGE="${RUNNER_TEMP}/stage/${PLUGIN_SLUG}"
          mkdir -p "${STAGE}/assets/dist"
          rsync -a --exclude-from=.distignore ./ "${STAGE}/"
          rsync -a dist/ "${STAGE}/assets/dist/"

      # ---- Stage 6: PACKAGE ---- #
      - name: Create ZIP
        run: |
          STAGE="${RUNNER_TEMP}/stage"
          ZIP="${{ steps.meta.outputs.zip-name }}"
          (cd "${STAGE}" && zip -rq "${GITHUB_WORKSPACE}/${ZIP}" "${PLUGIN_SLUG}/")
          echo "Created ${ZIP} ($(du -h "${ZIP}" | cut -f1))"

      # ---- Stage 7: CHECKSUM ---- #
      - name: Generate SHA-256
        run: sha256sum "${{ steps.meta.outputs.zip-name }}" > "${{ steps.meta.outputs.zip-name }}.sha256"

      # ---- ZIP integrity gates (see 01-distignore-and-zip-layout.md) ---- #
      - name: Verify ZIP integrity
        run: |
          ZIP="${{ steps.meta.outputs.zip-name }}"
          # Gate 1: single top-level folder
          [ "$(unzip -l "$ZIP" | awk 'NR>3 && NF>=4 {print $4}' | cut -d/ -f1 | sort -u | grep -c .)" = "1" ]
          # Gate 2: main plugin file
          unzip -p "$ZIP" "${PLUGIN_SLUG}/${PLUGIN_SLUG}.php" | grep -q "Plugin Name"
          # Gate 3: no double-nesting
          ! unzip -l "$ZIP" | grep -q "${PLUGIN_SLUG}/${PLUGIN_SLUG}/"
          # Gate 4: vite bundle present
          unzip -l "$ZIP" | grep -qE "assets/dist/assets/index-.*\.js"
          # Gate 5: no source files
          ! unzip -l "$ZIP" | grep -qE "${PLUGIN_SLUG}/(src/|spec/|tests/|node_modules/)"
          # Gate 6: vendor autoloader
          unzip -l "$ZIP" | grep -q "vendor/autoload.php"
          # Gate 7: no dev deps
          ! unzip -l "$ZIP" | grep -q "vendor/phpunit/"
          # Gate 8: checksum verifies
          sha256sum -c "${ZIP}.sha256"

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: plugin-zip
          path: |
            ${{ steps.meta.outputs.zip-name }}
            ${{ steps.meta.outputs.zip-name }}.sha256
          retention-days: 7

  # ---------------------------------------------------------------- #
  # Stage 8: RELEASE                                                 #
  # ---------------------------------------------------------------- #
  release:
    name: Publish GitHub Release
    needs: package
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # for changelog extraction

      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: plugin-zip

      - name: Extract changelog section
        id: changelog
        run: |
          VERSION="${{ needs.package.outputs.version }}"
          # Extract section between "## [VERSION]" and the next "## ["
          awk "/^## \[${VERSION}\]/{flag=1;next}/^## \[/{flag=0}flag" CHANGELOG.md > release-body.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: WorkFlowy ${{ github.ref_name }}
          body_path: release-body.md
          prerelease: ${{ contains(github.ref_name, '-') }}
          files: |
            ${{ needs.package.outputs.zip-name }}
            ${{ needs.package.outputs.zip-name }}.sha256
```

---

## Required Repository Settings

| Setting | Value | Why |
|---------|-------|-----|
| Actions permissions | "Read and write" | Needed for `softprops/action-gh-release` to create releases |
| Tag protection rule | `v*.*.*` requires admin push | Prevents accidental releases from non-maintainers |
| Branch protection on `main` | Require PR + status checks | CI gates run on PRs to catch failures pre-tag |

---

## Failure Modes (and what to do)

| Failure | Likely cause | Fix |
|---------|-------------|-----|
| `bun audit` fails on high CVE | Outdated transitive dep | `bun update <pkg>`, retag |
| `tsc --noEmit` fails | Type regression | Fix in source, retag (do NOT bypass) |
| ZIP gate 4 fails (no Vite bundle) | `dist/` not produced or rsync excluded it | Confirm `vite build` succeeded; check `.distignore` does NOT contain `dist/` |
| ZIP gate 7 fails (phpunit shipped) | `--no-dev` flag missing | Re-check the "Install PHP prod deps" step |
| Release step 403 | Workflow lacks `contents: write` | Add `permissions:` block at workflow root |

---

*GitHub Actions release workflow — v1.0.0 — 2026-04-25.*
