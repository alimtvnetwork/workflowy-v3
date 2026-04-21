# 20.9 Step 8 — Route Registration

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 3, §3.5** + **Phase 14** — Grouped, fault-tolerant route registration.

---

**File: `includes/Traits/Route/RouteRegistrationTrait.php`**

```php
<?php
namespace TaskTracker\Traits\Route;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use TaskTracker\Enums\PluginConfigType;
use TaskTracker\Enums\EndpointType;
use TaskTracker\Enums\HttpMethodType;

trait RouteRegistrationTrait
{
    public function registerRoutes(): void
    {
        $namespace = PluginConfigType::apiFullNamespace();
        $registered = 0;
        $failed = 0;

        $safeRegister = function (
            string $route,
            string $method,
            callable $callback,
            callable $permission,
        ) use ($namespace, &$registered, &$failed): void {
            try {
                register_rest_route($namespace, $route, [
                    'methods'             => $method,
                    'callback'            => $callback,
                    'permission_callback' => $permission,
                ]);
                $registered++;
            } catch (Throwable $e) {
                $failed++;
                error_log(
                    "[TaskTracker] Route registration failed for {$route}: "
                    . $e->getMessage() . "\n" . $e->getTraceAsString()
                );
            }
        };

        // ── Task endpoints ──
        $safeRegister(
            EndpointType::Tasks->route(),
            HttpMethodType::POST->value,
            [$this, 'handleCreateTask'],
            [$this, 'checkPluginPermission'],
        );

        $safeRegister(
            EndpointType::Tasks->route(),
            HttpMethodType::GET->value,
            [$this, 'handleListTasks'],
            [$this, 'checkPluginPermission'],
        );

        $safeRegister(
            EndpointType::TaskComplete->route(),
            HttpMethodType::POST->value,
            [$this, 'handleCompleteTask'],
            [$this, 'checkPluginPermission'],
        );

        // ── Log summary ──
        $this->fileLogger->info('Routes registered', [
            'registered' => $registered,
            'failed'     => $failed,
        ]);
    }
}
```
