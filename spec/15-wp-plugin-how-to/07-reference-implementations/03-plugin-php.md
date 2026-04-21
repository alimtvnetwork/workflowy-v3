# 7.3 Plugin.php — `includes/Core/Plugin.php`

> **Parent:** [Phase 7 overview](./00-overview.md)

```php
<?php
/**
 * Plugin — Composition root and singleton entry point.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

namespace PluginName\Core;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use PluginName\Logging\FileLogger;
use PluginName\Enums\PluginConfigType;
use PluginName\Enums\HookType;

// Trait imports — grouped by domain
use PluginName\Traits\Auth\AuthTrait;
use PluginName\Traits\Route\RouteRegistrationTrait;
use PluginName\Traits\Core\ResponseTrait;
use PluginName\Traits\Core\TypeCheckerTrait;
use PluginName\Traits\Core\StatusHandlerTrait;
use PluginName\Traits\Core\PluginInventoryTrait;
// Add feature-domain trait imports here

final class Plugin
{
    // ── Auth ──
    use AuthTrait;

    // ── Routes ──
    use RouteRegistrationTrait;

    // ── Core infrastructure ──
    use ResponseTrait;
    use TypeCheckerTrait;
    use StatusHandlerTrait;
    use PluginInventoryTrait;

    // ── Feature domains (add new traits here) ──
    // use UploadHandlerTrait;
    // use ActivateHandlerTrait;

    /** @var self|null Singleton instance. */
    private static ?self $instance = null;

    /** @var FileLogger Structured file logger. */
    private FileLogger $fileLogger;

    /**
     * Get the singleton instance. Creates it on first call.
     */
    public static function getInstance(): self
    {
        $hasInstance = (self::$instance !== null);

        if (!$hasInstance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Private constructor — called once via getInstance().
     * Wires hooks and initialises logging. No business logic here.
     */
    private function __construct()
    {
        $startTime = microtime(true);

        // Obtain logger
        $this->fileLogger = FileLogger::getInstance();

        // Register REST routes
        $this->registerRoutes();

        // Register shutdown handler for fatal errors
        $this->registerShutdownHandler();

        // Log boot summary
        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);
        $this->fileLogger->info('Plugin initialized', [
            'version'  => PluginConfigType::Version->value,
            'timeMs'   => $elapsedMs,
            'isDebug'  => PluginConfigType::isDebugMode(),
        ]);
    }

    /**
     * Return the plugin slug for logging and identification.
     */
    public function getPluginSlug(): string
    {
        return PluginConfigType::Slug->value;
    }

    /**
     * Register the shutdown handler for uncaught fatal errors.
     */
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

    /** Prevent cloning. */
    private function __clone() {}

    /** Prevent unserialization. */
    public function __wakeup(): void
    {
        throw new \RuntimeException('Cannot unserialize singleton');
    }
}
```
