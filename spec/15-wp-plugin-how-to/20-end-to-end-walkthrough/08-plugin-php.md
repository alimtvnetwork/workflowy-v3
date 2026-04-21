# 20.8 Step 7 — Plugin.php (Composition Root)

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 1, §1.5** + **Phase 7, §7.3** — Singleton, compose all traits, wire hooks, no business logic.

---

**File: `includes/Core/Plugin.php`**

```php
<?php
namespace TaskTracker\Core;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use TaskTracker\Logging\FileLogger;
use TaskTracker\Enums\PluginConfigType;
use TaskTracker\Enums\HookType;

// Trait imports — grouped by domain
use TaskTracker\Traits\Auth\AuthTrait;
use TaskTracker\Traits\Route\RouteRegistrationTrait;
use TaskTracker\Traits\Core\ResponseTrait;
use TaskTracker\Traits\Core\TypeCheckerTrait;

// Feature-domain traits
use TaskTracker\Traits\Task\TaskCreateTrait;
use TaskTracker\Traits\Task\TaskListTrait;
use TaskTracker\Traits\Task\TaskCompleteTrait;

final class Plugin
{
    // ── Auth ──
    use AuthTrait;

    // ── Routes ──
    use RouteRegistrationTrait;

    // ── Core infrastructure ──
    use ResponseTrait;
    use TypeCheckerTrait;

    // ── Feature domains ──
    use TaskCreateTrait;
    use TaskListTrait;
    use TaskCompleteTrait;

    private static ?self $instance = null;
    private FileLogger $fileLogger;

    public static function getInstance(): self
    {
        $hasInstance = (self::$instance !== null);

        if (!$hasInstance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct()
    {
        $startTime = microtime(true);

        $this->fileLogger = FileLogger::getInstance();

        // Register REST routes (fires on rest_api_init)
        add_action('rest_api_init', [$this, 'registerRoutes']);

        // Register admin menu
        add_action('admin_menu', [$this, 'registerAdminPages']);

        // Register shutdown handler
        $this->registerShutdownHandler();

        // Log boot summary
        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);
        $this->fileLogger->info('Plugin initialized', [
            'version' => PluginConfigType::Version->value,
            'timeMs'  => $elapsedMs,
            'isDebug' => PluginConfigType::isDebugMode(),
        ]);
    }

    public function getPluginSlug(): string
    {
        return PluginConfigType::Slug->value;
    }

    private function registerShutdownHandler(): void
    {
        register_shutdown_function(function (): void {
            $lastError = error_get_last();
            $hasError = ($lastError !== null);

            if (!$hasError) {
                return;
            }

            $fatalTypes = [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE];
            $isFatal = in_array($lastError['type'], $fatalTypes, true);

            if (!$isFatal) {
                return;
            }

            $memoryMb = round(memory_get_peak_usage(true) / 1048576, 2);

            error_log(sprintf(
                '[%s] FATAL: %s in %s:%d | Memory: %sMB',
                PluginConfigType::ShortName->value,
                $lastError['message'],
                $lastError['file'],
                $lastError['line'],
                $memoryMb,
            ));
        });
    }

    private function __clone() {}

    public function __wakeup(): void
    {
        throw new \RuntimeException('Cannot unserialize singleton');
    }
}
```

## Observations

| Pattern | Phase |
|---------|-------|
| No business logic in constructor | Phase 1, §1.5 |
| Traits composed by domain groups | Phase 3, §3.7 |
| Shutdown handler for fatals | Phase 7, §7.3 |
| Boot timing logged | Phase 4, §4.4 |
