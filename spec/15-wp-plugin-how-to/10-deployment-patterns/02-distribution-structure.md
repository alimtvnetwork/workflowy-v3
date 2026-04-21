# 10.2 Plugin File Structure for Distribution

> **Updated:** 2026-04-19

---

## What ships vs. what stays behind

```
plugin-slug/                      ← ZIP root
├── plugin-slug.php               ← Main plugin file (required)
├── uninstall.php                 ← Clean removal hook
├── README.md                     ← Plugin readme
├── CHANGELOG.md                  ← Version history
├── composer.json                 ← Dependency manifest
├── settings.json                 ← Default configuration
├── assets/                       ← Admin CSS/JS/images
├── data/
│   └── seeds/                    ← Seed JSON files + manifest
├── includes/                     ← All PHP source (PSR-4)
├── templates/                    ← PHP view templates
└── vendor/                       ← Composer autoloader (production only)
```

---

## Excluded from distribution ZIP

```
.git/
.github/
.ai-instructions
node_modules/
tests/
phpunit.xml
phpstan.neon
phpstan-bootstrap.php
composer.lock
spec/
*.log
.DS_Store
Thumbs.db
```

---

## .distignore file

Create a `.distignore` at the plugin root listing files excluded from the ZIP:

```
.git
.github
.ai-instructions
tests
phpunit.xml
phpstan.neon
phpstan-bootstrap.php
composer.lock
spec
*.log
.DS_Store
Thumbs.db
```

---

*Distribution structure — v3.2.0 — 2026-04-19*
