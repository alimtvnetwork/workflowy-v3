# 10.11 CI/CD Automation (GitHub Actions)

> **Updated:** 2026-04-19

---

## Recommended workflow

```yaml
# .github/workflows/release.yml
name: Release Plugin

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install
      - run: vendor/bin/phpunit
      - run: vendor/bin/phpstan analyse

  package:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --no-dev --optimize-autoloader
      - name: Package ZIP
        run: |
          PLUGIN_SLUG="${{ github.event.repository.name }}"
          VERSION="${GITHUB_REF#refs/tags/v}"
          mkdir -p dist
          rsync -a --exclude-from=.distignore . "dist/${PLUGIN_SLUG}/"
          cd dist && zip -r "../${PLUGIN_SLUG}-v${VERSION}.zip" "${PLUGIN_SLUG}/"
      - name: Upload release asset
        uses: softprops/action-gh-release@v1
        with:
          files: '*.zip'
```

---

## Release checklist

```
1. ✅ All tests pass (phpunit + phpstan)
2. ✅ Version bumped in plugin header + PluginConfigType
3. ✅ CHANGELOG.md updated
4. ✅ composer install --no-dev succeeds
5. ✅ ZIP packages correctly (no double-nesting, vendor/ present)
6. ✅ ZIP installs cleanly on a fresh WordPress site
7. ✅ Auto-update detects new version from update server
8. ✅ Self-update completes with health check passing
9. ✅ Rollback works when validation fails
```

---

*CI/CD automation — v3.2.0 — 2026-04-19*
