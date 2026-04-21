# 14.1 Namespace Convention

> **Parent:** [Phase 14 overview](./00-overview.md)

---

Every plugin registers its REST routes under a single namespace:

```
{plugin-slug}/v{major}
```

| Component | Source | Example |
|-----------|--------|---------|
| Plugin slug | `PluginConfigType::Slug->value` | `my-plugin` |
| API version | `PluginConfigType::ApiVersion->value` | `v1` |
| Full namespace | `PluginConfigType::apiFullNamespace()` | `my-plugin/v1` |

### Rules

| Rule | Detail |
|------|--------|
| One namespace per plugin | Never register routes under someone else's namespace |
| Version is major only | `v1`, `v2` — never `v1.2` |
| Bump major only for breaking changes | New endpoints do NOT require a version bump |
| Namespace is constructed via enum | Never hardcode the namespace string in route registration |

### apiFullNamespace() implementation

```php
// In PluginConfigType enum
public static function apiFullNamespace(): string
{
    return self::Slug->value . '/' . self::ApiVersion->value;
}
```

---
