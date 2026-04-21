# 20.2 Step 1 — Folder Structure

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 1, §1.2** — Canonical folder structure

---

```
task-tracker/
├── task-tracker.php                    ← Bootstrap (Step 2)
├── uninstall.php                       ← Cleanup on delete (Step 14)
├── includes/
│   ├── Autoloader.php                  ← PSR-4 loader (Step 3)
│   ├── Core/
│   │   ├── Plugin.php                  ← Singleton composition root (Step 7)
│   │   ├── Activator.php              ← Activation hook handler
│   │   └── Deactivator.php            ← Deactivation hook handler
│   ├── Enums/
│   │   ├── PluginConfigType.php        ← Identity enum (Step 4)
│   │   ├── EndpointType.php            ← Route paths (Step 4)
│   │   ├── HttpMethodType.php          ← GET/POST/PUT/DELETE
│   │   ├── HttpStatusType.php          ← Status codes
│   │   ├── HookType.php                ← WordPress hook names
│   │   ├── TaskStatusType.php          ← pending/done (Step 4)
│   │   ├── OptionNameType.php          ← wp_options keys
│   │   ├── ResponseKeyType.php         ← Envelope keys
│   │   ├── PhpNativeType.php           ← Type-checker backing
│   │   ├── CapabilityType.php          ← WP capabilities
│   │   └── LogLevelType.php            ← Log levels
│   ├── Helpers/
│   │   ├── EnvelopeBuilder.php         ← Response envelope (Step 6)
│   │   ├── DateHelper.php              ← Timestamp formatting
│   │   ├── PathHelper.php              ← File path resolution
│   │   └── ErrorLogHelper.php          ← Tier 1 logging helper
│   ├── Logging/
│   │   └── FileLogger.php              ← Tier 2 logger (Step 5)
│   ├── Database/
│   │   └── DatabaseMigrationsTrait.php ← SQLite schema (Step 9)
│   └── Traits/
│       ├── Auth/
│       │   └── AuthTrait.php           ← Permission checks (Step 6)
│       ├── Core/
│       │   ├── ResponseTrait.php       ← safeExecute + envelope (Step 6)
│       │   └── TypeCheckerTrait.php    ← Safe type checking
│       ├── Route/
│       │   └── RouteRegistrationTrait.php  ← Route wiring (Step 8)
│       └── Task/
│           ├── TaskCreateTrait.php     ← POST /tasks (Step 10)
│           ├── TaskListTrait.php       ← GET /tasks (Step 10)
│           └── TaskCompleteTrait.php   ← POST /tasks/complete (Step 10)
├── templates/
│   └── settings.php                    ← Admin settings page (Step 12)
├── data/
│   └── seeds/
│       ├── manifest.json               ← Seed registry
│       └── default-settings.json       ← Default settings seed
├── assets/
│   └── css/
│       └── admin.css                   ← Admin page styles
└── tests/
    ├── bootstrap.php
    └── Unit/
        └── Enums/
            └── TaskStatusTypeTest.php  ← Example test (Step 13)
```
