# 14.5 Route Registration Pattern

> **Parent:** [Phase 14 overview](./00-overview.md)

---

Routes are registered in `RouteRegistrationTrait` using a grouped, fault-tolerant pattern:

```php
trait RouteRegistrationTrait
{
    public function registerRoutes(): void
    {
        $namespace = PluginConfigType::apiFullNamespace();

        // Fault-tolerant closure — logs failures without stopping other routes
        $safeRegister = function (
            string $route,
            array $args,
            string $groupName = '',
        ) use ($namespace): bool {
            try {
                register_rest_route($namespace, $route, $args);

                return true;
            } catch (Throwable $e) {
                $this->fileLogger->logException($e, "Route:{$groupName}{$route}");

                return false;
            }
        };

        // ── Group: System ────────────────────────────────────
        $safeRegister(EndpointType::Status->route(), [
            'methods'             => HttpMethodType::Get->value,
            'callback'            => [$this, 'handleStatus'],
            'permission_callback' => [$this, 'checkStatusPermission'],
        ], 'system');

        // ── Group: Plugins ───────────────────────────────────
        $safeRegister(EndpointType::PluginEnable->route(), [
            'methods'             => HttpMethodType::Post->value,
            'callback'            => [$this, 'handlePluginEnable'],
            'permission_callback' => [$this, 'checkPluginPermission'],
        ], 'plugins');

        // ... additional groups follow the same pattern
    }
}
```

### Registration rules

| Rule | Detail |
|------|--------|
| Every route uses `EndpointType` for path | No string literals |
| Every route uses `HttpMethodType` for method | `HttpMethodType::Get->value`, not `'GET'` |
| Every route has a `permission_callback` | Never `__return_true` for authenticated endpoints |
| Routes are grouped by domain | Comment separators between groups |
| Each group is wrapped in `$safeRegister` | Failure in one group does not block others |
| Callback points to a public trait method | `[$this, 'handleMethodName']` |

---
