# 10.3 ZIP Packaging

> **Updated:** 2026-04-19

---

## Manual packaging (development)

```bash
# From the directory containing the plugin folder
cd wp-plugins/

# Install production dependencies only
cd plugin-slug && composer install --no-dev --optimize-autoloader && cd ..

# Create ZIP excluding dev files
zip -r plugin-slug-v2.31.0.zip plugin-slug/ \
  -x "plugin-slug/.git/*" \
  -x "plugin-slug/.github/*" \
  -x "plugin-slug/.ai-instructions" \
  -x "plugin-slug/tests/*" \
  -x "plugin-slug/phpunit.xml" \
  -x "plugin-slug/phpstan.neon" \
  -x "plugin-slug/phpstan-bootstrap.php" \
  -x "plugin-slug/composer.lock" \
  -x "plugin-slug/spec/*" \
  -x "plugin-slug/*.log"
```

---

## Automated packaging script

Create `scripts/package.sh` in the plugin root:

```bash
#!/bin/bash
set -euo pipefail

PLUGIN_SLUG="plugin-slug"
VERSION=$(grep -oP "Version:\s*\K[0-9.]+" "${PLUGIN_SLUG}.php")
OUTPUT="${PLUGIN_SLUG}-v${VERSION}.zip"

echo "📦 Packaging ${PLUGIN_SLUG} v${VERSION}..."

# Production dependencies
composer install --no-dev --optimize-autoloader --quiet

# Build ZIP respecting .distignore
if command -v rsync &> /dev/null; then
    TMPDIR=$(mktemp -d)
    rsync -a --exclude-from=.distignore . "${TMPDIR}/${PLUGIN_SLUG}/"
    cd "${TMPDIR}"
    zip -r "${OLDPWD}/${OUTPUT}" "${PLUGIN_SLUG}/"
    rm -rf "${TMPDIR}"
else
    # Fallback: manual exclusions
    cd ..
    zip -r "${PLUGIN_SLUG}/${OUTPUT}" "${PLUGIN_SLUG}/" \
        -x "${PLUGIN_SLUG}/.git/*" \
        -x "${PLUGIN_SLUG}/tests/*" \
        -x "${PLUGIN_SLUG}/spec/*" \
        -x "${PLUGIN_SLUG}/phpunit.xml" \
        -x "${PLUGIN_SLUG}/phpstan.neon" \
        -x "${PLUGIN_SLUG}/composer.lock"
fi

echo "✅ Created ${OUTPUT} ($(du -h "${OUTPUT}" | cut -f1))"
```

---

## ZIP integrity requirements

| Check | Rule |
|-------|------|
| Main plugin file exists | `plugin-slug/plugin-slug.php` must be at ZIP root level |
| No nested folders | ZIP must not contain `plugin-slug/plugin-slug/` (double-nesting) |
| vendor/ present | Autoloader must be included — plugin won't boot without it |
| No dev dependencies | `vendor/phpunit/` must NOT appear in the ZIP |
| File permissions | PHP files: 644, directories: 755 |

---

*ZIP packaging — v3.2.0 — 2026-04-19*
