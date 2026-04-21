# §5A Namespace Imports in Traits and Classes — CRITICAL

> **Added:** 2026-02-20 — Root cause of the v1.58.0 → v1.59.0 critical site-down incident.

## Incident Summary

In v1.58.0, two missing `use` import statements caused a **full site crash** ("critical error on this website"):

1. **`PluginRoutesTrait`** referenced `SnapshotRouteRegistrationTrait` (namespace `RiseupAsia\Traits\Snapshot`) without a `use` import. PHP resolved it within the current namespace (`RiseupAsia\Traits\Plugin\SnapshotRouteRegistrationTrait`), which does not exist → **fatal error at class compile time**.
2. **`ActivationHandler`** referenced `PluginConfigType` (namespace `RiseupAsia\Enums`) without a `use` import. On cold activations (no OPcache), this caused a **fatal "class not found" error**.

## Why Traits Are Especially Dangerous

- Trait `use` statements are resolved **at compile time**, before any error handler, shutdown function, or `try/catch` can intervene.
- A missing import in a trait used by the main `Plugin` class **kills the entire WordPress site** — not just the plugin.
- Unlike runtime errors, there is **no graceful degradation** — the PHP parser cannot even finish reading the file.

## Forbidden Patterns

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 5A.1 | `use SomeTraitName;` inside a trait body without a file-level `use` import for cross-namespace traits | Add `use RiseupAsia\Full\Namespace\SomeTraitName;` at the top of the file | PHP resolves unimported names in the current namespace → fatal error |
| 5A.2 | Referencing any enum, class, or interface from another namespace without a `use` import | Add explicit `use` import for every cross-namespace reference | Cold activations and OPcache flushes expose missing imports |
| 5A.3 | Assuming a class/enum "works because it was loaded elsewhere" | Every file must be independently self-sufficient with its own imports | Autoloader order is not guaranteed; OPcache invalidation resets everything |
| 5A.4 | Adding a new `use SomeTrait;` in a trait/class body without verifying the namespace | Check the trait's actual namespace in its source file; add the corresponding `use` import | Copy-paste errors silently point to wrong namespace |

## Dos and Don'ts

### ✅ DO:

- **Import every cross-namespace symbol** at the top of every PHP file, even if it "seems to work without it"
- **Verify the full namespace path** of any trait, class, or enum before adding a `use` statement
- **Run a cold activation test** (deactivate → delete OPcache → activate) after adding new trait compositions
- **Grep for unimported cross-namespace references** before every release: any `use SomeTrait;` in a trait body must have a matching file-level `use RiseupAsia\...\SomeTrait;`
- **Treat trait files identically to class files** — they do NOT inherit imports from the class that mixes them in

### ❌ DON'T:

- **Don't rely on OPcache** to mask missing imports — it works until the cache is flushed, then the site crashes
- **Don't assume "it works on my machine" means it's correct** — local environments often have warm OPcache that hides missing imports
- **Don't copy trait `use` statements without checking the namespace** — the trait name alone is not enough; the full namespace must match
- **Don't skip the `use` import because "the autoloader will find it"** — the autoloader resolves the class, but PHP still needs to know which namespace you mean
- **Don't mix up trait `use` (inside class body) with namespace `use` (at file top)** — both are required for cross-namespace traits

## Pre-Release Checklist Addition

```
[ ] Every trait `use` inside a class/trait body has a matching file-level `use` import
[ ] Every enum, class, and interface reference has a file-level `use` import
[ ] No file relies on "ambient" loading from other files
[ ] Cold activation tested (OPcache cleared, plugin deactivated and reactivated)
```

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — §5A (critical incident)*
