# 20.4 Step 3 — Autoloader

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 1, §1.4** + **Phase 7, §7.2** — PSR-4 mapping, diagnostic logging, self-register.

---

**File: `includes/Autoloader.php`**

Copy the reference autoloader from Phase 7, §7.2 verbatim, then search-replace:

| Find | Replace |
|------|---------|
| `PluginNameAutoloader` | `TaskTrackerAutoloader` |
| `PluginName\\` | `TaskTracker\\` |
| `plugin-name` | `task-tracker` |
| `[PluginName]` | `[TaskTracker]` |

The autoloader is **non-namespaced** and registers itself at the bottom via `spl_autoload_register()`.
