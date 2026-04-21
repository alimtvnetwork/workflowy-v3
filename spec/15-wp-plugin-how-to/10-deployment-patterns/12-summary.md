# 10.12 Summary Table

> **Updated:** 2026-04-19

---

| Aspect | Pattern | Reference |
|--------|---------|-----------|
| Version source | Plugin header + `PluginConfigType::Version` | [§10.1](./01-versioning-strategy.md) |
| ZIP packaging | `.distignore` + `scripts/package.sh` | [§10.3](./03-zip-packaging.md) |
| Update detection | `pre_set_site_transient_update_plugins` filter | [§10.4](./04-update-server.md) |
| Plugin info modal | `plugins_api` filter | [§10.4](./04-update-server.md) |
| Self-update | Download → Validate → Activate → Health Check → Rollback | [§10.5](./05-self-update-rollback.md) |
| URL resolution | Follow 301/302 chains with configurable max | [§10.6](./06-url-resolution.md) |
| Rollback | Backup before update, restore on failure | [§10.5](./05-self-update-rollback.md) |
| Uninstall cleanup | `uninstall.php` removes options, data, logs | [§10.9](./09-uninstall-cleanup.md) |
| CI/CD | GitHub Actions: test → package → release | [§10.11](./11-cicd-automation.md) |

---

*Phase 10 completes the plugin lifecycle: from development (Phases 1–9) through packaging, distribution, updating, and clean removal.*
