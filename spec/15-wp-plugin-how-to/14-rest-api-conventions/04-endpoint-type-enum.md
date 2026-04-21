# 14.4 EndpointType Enum — Route Registry

> **Parent:** [Phase 14 overview](./00-overview.md)

---

Every route path is defined as an `EndpointType` enum case. No string literals in route registration.

### Structure

```php
enum EndpointType: string
{
    // ── System ──────────────────────────────────────────────
    case Status       = 'status';
    case Openapi      = 'openapi';
    case OpcacheReset = 'opcache-reset';

    // ── Plugins ─────────────────────────────────────────────
    case Plugins       = 'plugins';
    case PluginInfo    = 'plugins/info';
    case PluginEnable  = 'plugins/enable';
    case PluginDisable = 'plugins/disable';
    case PluginDelete  = 'plugins/delete';

    // ── Logs ────────────────────────────────────────────────
    case Logs       = 'logs';
    case LogsStatus = 'logs/status';
    case LogsClear  = 'logs/clear';

    /** Prefixes value with '/' for register_rest_route(). */
    public function route(): string
    {
        return '/' . $this->value;
    }

    // ── Group helpers ───────────────────────────────────────
    public function isPlugin(): bool  { return str_starts_with($this->value, 'plugins/'); }
    public function isLog(): bool     { return str_starts_with($this->value, 'logs/'); }
    public function isAgent(): bool   { return str_starts_with($this->value, 'agents'); }

    // Standard comparison methods
    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

### Enum rules

| Rule | Detail |
|------|--------|
| Case name is PascalCase | `PluginEnable`, not `plugin_enable` |
| Value is the path fragment (kebab-case) | `'plugins/enable'` |
| Group by category with comment headers | `// ── Plugins ──` |
| `route()` always prepends `/` | Used by `register_rest_route()` |
| Group helpers use `str_starts_with()` | For category-level checks |
| Dynamic segments use WordPress regex | `'users/(?P<id>\d+)'` |

---
