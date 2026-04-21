# 7.7 `.ai-instructions` File Template

> **Parent:** [Phase 7 overview](./00-overview.md)

Place this file at the plugin root. AI code generators read it before generating code.

```markdown
# AI Instructions for {Plugin Name}

## Architecture
- This plugin follows the spec at `spec/18-how-to-write-wordpress-plugin/`
- Read ALL 11 phases before writing any code

## Critical Rules
1. **No `is_array()`, `is_string()`, `is_int()`, etc.** — Use `TypeCheckerTrait` methods (`$this->isArray()`) or `PhpNativeType::matches()` in static contexts. The syntax validator blocks T_ARRAY tokens.
2. **No `array()` syntax** — Use `[]` exclusively.
3. **No `Exception` catches** — Always catch `Throwable`.
4. **No negative conditions** — Extract to `$is…`/`$has…`/`$should…` booleans.
5. **No magic strings** — Every string literal that represents a domain concept must be an enum case.
6. **No direct error responses** — Always use `EnvelopeBuilder` via `safeExecute()` or `validationError()`.
7. **Stack traces are debug-mode gated** — Never expose in production (see Phase 4, §4.2).
8. **All REST handlers wrapped in `safeExecute()`** — No bare try-catch in endpoints.
9. **Every file starts with ABSPATH guard** (after namespace, if namespaced).
10. **Version lives in `PluginConfigType::Version` only** — never hardcoded elsewhere.
11. **Seed data lives in `data/seeds/`** — JSON files + `manifest.json` define initial DB state (see Phase 8, §8.5.1). Never hardcode INSERT statements in migrations for reference data.
12. **File size limit: 200 lines max** — Templates, classes, traits, partials, JS, CSS. Extract into partials or sub-components when exceeded (see Phase 11, §11.1).
13. **Templates are orchestrators** — Page templates set variables and include partials. No business logic in templates (see Phase 11, §11.3).
14. **React requires developer confirmation** — Never default to React for admin UI without explicit developer approval (see Phase 11, §11.10).
15. **Source maps: dev only** — Production builds must NOT include `.map` files (see Phase 11, §11.8).

## File Generation Order
When creating a new plugin from scratch:
1. `plugin-name.php` (bootstrap)
2. `includes/Autoloader.php`
3. `includes/Enums/` (all enums first — they have no dependencies)
4. `includes/Helpers/` (DateHelper, PathHelper, ErrorLogHelper, EnvelopeBuilder)
5. `includes/Logging/FileLogger.php`
6. `includes/Traits/Core/` (ResponseTrait, TypeCheckerTrait)
7. `includes/Traits/Auth/AuthTrait.php`
8. `includes/Traits/Route/RouteRegistrationTrait.php`
9. `includes/Core/Plugin.php`
10. `includes/Core/Activator.php` + `Deactivator.php`
11. `includes/Database/DatabaseMigrator.php` + `DatabaseSeeder.php`
12. `data/seeds/manifest.json` + seed JSON files (initial reference data)
13. `uninstall.php`
14. `templates/` — page templates + `partials/shared/` (page-header, pagination, etc.)
15. `assets/css/` + `assets/js/` — per-page styles and scripts
16. Feature-domain traits (one per endpoint)
17. *(Optional, if React confirmed)* `frontend/` — React source → builds to `assets/dist/`

## Formatting Rules
- R1: Always use braces, even for single-line if/foreach/while
- R4: Blank line before return/throw only when preceded by other statements
- R9a: 3+ parameters → one per line, trailing comma
- R9b: 3+ arguments → one per line, trailing comma
- R9c: 3+ array items → one per line, trailing comma
- R12: No empty line after opening brace
- R13: No empty first line after <?php
```
