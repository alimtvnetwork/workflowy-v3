# 10.10 Trait Decomposition for UpdateResolver

> **Updated:** 2026-04-19

---

Following the Gold Standard trait composition pattern (Phase 3), the UpdateResolver is decomposed into focused traits:

```
Update/
├── UpdateResolver.php                    ← Shell class (singleton)
├── SelfUpdateValidator.php               ← Pre-activation checks
├── SelfUpdateHealthCheck.php             ← Post-activation checks
├── SelfUpdateBackupHelper.php            ← Backup creation utilities
└── Traits/
    ├── UpdateResolverUrlTrait.php         ← URL resolution + redirect handling
    ├── UpdateResolverFetchTrait.php       ← HTTP fetching of update info
    ├── UpdateResolverWpHooksTrait.php     ← WordPress filter callbacks
    ├── UpdateResolverIntegrityTrait.php   ← ZIP integrity verification
    └── UpdateResolverBackupTrait.php      ← Backup creation + rollback
```

| Trait | Responsibility |
|-------|---------------|
| `UpdateResolverUrlTrait` | Resolve URLs through 301/302 redirects, cache resolved URLs |
| `UpdateResolverFetchTrait` | Fetch update JSON from remote server, parse response |
| `UpdateResolverWpHooksTrait` | `checkForPluginUpdate()` and `pluginInfo()` filter callbacks |
| `UpdateResolverIntegrityTrait` | Verify ZIP checksums, validate extracted contents |
| `UpdateResolverBackupTrait` | Create pre-update backup, restore on failure |

---

*Trait decomposition — v3.2.0 — 2026-04-19*
