# 8.3 WP-Cron — Scheduled Tasks

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## When to use

Recurring background tasks: log rotation, cache cleanup, data sync, health checks.

## Registration pattern

```php
namespace PluginName\Traits\Cron;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\CronScheduleType;

trait CronSchedulerTrait
{
    /**
     * Register cron hooks. Call from Plugin::__construct().
     */
    public function registerCronHooks(): void
    {
        add_action(CronScheduleType::LogRotation->hookName(), [$this, 'executeLogRotation']);
        add_action(CronScheduleType::CacheCleanup->hookName(), [$this, 'executeCacheCleanup']);
    }

    /**
     * Schedule cron events. Called from Activator::activate().
     */
    public static function scheduleCronEvents(): void
    {
        foreach (CronScheduleType::cases() as $schedule) {
            $isAlreadyScheduled = (wp_next_scheduled($schedule->hookName()) !== false);

            if ($isAlreadyScheduled) {
                continue;
            }

            wp_schedule_event(time(), $schedule->recurrence(), $schedule->hookName());
        }
    }

    /**
     * Unschedule all cron events. Called from Deactivator::deactivate().
     */
    public static function unscheduleCronEvents(): void
    {
        foreach (CronScheduleType::cases() as $schedule) {
            $nextRun = wp_next_scheduled($schedule->hookName());
            $hasEvent = ($nextRun !== false);

            if ($hasEvent) {
                wp_unschedule_event($nextRun, $schedule->hookName());
            }
        }
    }

    /**
     * Execute log rotation task.
     */
    public function executeLogRotation(): void
    {
        try {
            $this->fileLogger->info('Cron: log rotation started');
            // ... rotation logic
            $this->fileLogger->info('Cron: log rotation complete');
        } catch (\Throwable $e) {
            $this->fileLogger->logException($e, 'Cron:log-rotation');
        }
    }

    /**
     * Execute cache cleanup task.
     */
    public function executeCacheCleanup(): void
    {
        try {
            $this->fileLogger->info('Cron: cache cleanup started');
            // ... cleanup logic
            $this->fileLogger->info('Cron: cache cleanup complete');
        } catch (\Throwable $e) {
            $this->fileLogger->logException($e, 'Cron:cache-cleanup');
        }
    }
}
```

## CronScheduleType enum

```php
enum CronScheduleType: string
{
    case LogRotation  = 'log_rotation';
    case CacheCleanup = 'cache_cleanup';

    /** WordPress hook name for this scheduled task. */
    public function hookName(): string
    {
        return 'plugin_name_cron_' . $this->value;
    }

    /** WordPress cron recurrence interval. */
    public function recurrence(): string
    {
        return match ($this) {
            self::LogRotation  => 'daily',
            self::CacheCleanup => 'hourly',
        };
    }

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

## Custom cron intervals

If WordPress's built-in intervals (`hourly`, `twicedaily`, `daily`, `weekly`) aren't enough:

```php
// In Plugin::__construct()
add_filter('cron_schedules', [$this, 'addCronIntervals']);

public function addCronIntervals(array $schedules): array
{
    $schedules['every_five_minutes'] = [
        'interval' => 300,
        'display'  => 'Every 5 Minutes',
    ];

    return $schedules;
}
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| WP-Cron disabled (`DISABLE_WP_CRON`) | Document that server-level cron must call `wp-cron.php` |
| Cron runs overlapping (long task) | Use a transient lock: `set_transient('lock', true, 300)` at start, check before running |
| Cron fires after plugin deactivated | Check `function_exists()` or class existence at hook callback start |
| Multiple cron events for same hook | `wp_next_scheduled()` only returns the next one — use `_get_cron_array()` to check all |

## Transient lock pattern (prevent overlapping runs)

```php
public function executeLogRotation(): void
{
    $lockKey = 'plugin_name_lock_log_rotation';
    $isLocked = (get_transient($lockKey) !== false);

    if ($isLocked) {
        $this->fileLogger->debug('Cron: log rotation skipped — already running');

        return;
    }

    // Acquire lock (5-minute TTL)
    set_transient($lockKey, true, 300);

    try {
        // ... rotation logic
    } catch (\Throwable $e) {
        $this->fileLogger->logException($e, 'Cron:log-rotation');
    } finally {
        delete_transient($lockKey);
    }
}
```
