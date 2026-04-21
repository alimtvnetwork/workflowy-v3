# 7.2 Autoloader — `includes/Autoloader.php`

> **Parent:** [Phase 7 overview](./00-overview.md)

```php
<?php
/**
 * Autoloader — PSR-4 class loader for the plugin namespace.
 *
 * This file is non-namespaced because it must load before
 * the namespace system is available.
 *
 * @package PluginName
 * @since   1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

final class PluginNameAutoloader
{
    /** @var string The root namespace this autoloader handles. */
    private const NAMESPACE_PREFIX = 'PluginName\\';

    /** @var string The base directory for class files. */
    private string $baseDir;

    /** @var string Path to the autoloader diagnostic log file. */
    private string $logPath;

    public function __construct()
    {
        $this->baseDir = __DIR__ . '/';

        $uploadDir = wp_upload_dir();
        $hasUploadDir = (!empty($uploadDir['basedir']));
        $uploadsBase = $hasUploadDir ? $uploadDir['basedir'] : WP_CONTENT_DIR . '/uploads';

        $logDir = $uploadsBase . '/plugin-name/logs';
        $hasDirExists = is_dir($logDir);

        if (!$hasDirExists) {
            wp_mkdir_p($logDir);
        }

        $this->logPath = $logDir . '/autoloader.log';
    }

    /**
     * Attempt to load a class file for the given fully-qualified class name.
     *
     * @param string $className The fully-qualified class name (e.g., 'PluginName\Enums\HttpStatusType')
     */
    public function loadClass(string $className): void
    {
        $prefixLength = strlen(self::NAMESPACE_PREFIX);
        $isOurNamespace = (strncmp($className, self::NAMESPACE_PREFIX, $prefixLength) === 0);

        if (!$isOurNamespace) {
            return;
        }

        $relativeClass = substr($className, $prefixLength);
        $filePath = $this->baseDir . str_replace('\\', '/', $relativeClass) . '.php';

        $hasFile = file_exists($filePath);

        if (!$hasFile) {
            $this->log("Class file not found: {$className} → {$filePath}");

            return;
        }

        try {
            require_once $filePath;
        } catch (\Throwable $e) {
            $this->log(
                "Failed to load {$className}: {$e->getMessage()}\n{$e->getTraceAsString()}"
            );

            throw $e;
        }
    }

    /**
     * Write a diagnostic entry to the autoloader log.
     *
     * @param string $message The log message
     */
    private function log(string $message): void
    {
        $timestamp = gmdate('d-M-y g:i A');
        $entry = "[{$timestamp}] [Autoloader] {$message}\n";

        error_log(trim($entry));
        @file_put_contents($this->logPath, $entry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Register this autoloader with PHP's SPL autoload stack.
     */
    public function register(): void
    {
        spl_autoload_register([$this, 'loadClass']);
    }
}

// Self-register on include
(new PluginNameAutoloader())->register();
```

## Why this design

| Decision | Reason |
|----------|--------|
| `final` class | No inheritance expected or wanted |
| Non-namespaced | Loaded before namespaces are available |
| `strncmp` for prefix check | Faster than `str_starts_with()` and available in PHP 8.0 fallback scenarios |
| Dual logging (error_log + file) | `error_log` goes to WP_DEBUG log; file is plugin-specific and always readable |
| `@file_put_contents` with `@` | Suppresses warnings if log directory was deleted mid-request |
| Re-throw on require failure | Caller (bootstrap) needs to know the load failed |
