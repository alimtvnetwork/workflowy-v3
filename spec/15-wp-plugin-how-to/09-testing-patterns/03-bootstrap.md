# 9.3 Test Bootstrap — `tests/bootstrap.php`

> **Parent:** [Phase 9 overview](./00-overview.md)

---

For **unit tests**, the bootstrap mocks WordPress constants and functions so tests run without WordPress:

```php
<?php
/**
 * Test bootstrap — loads autoloader and mocks WordPress environment.
 */

// Define ABSPATH so guarded files load
if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/fake-wordpress/');
}

// Mock WordPress functions used by helpers/enums (only for unit tests)
if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field(string $str): string
    {
        return trim(strip_tags($str));
    }
}

if (!function_exists('absint')) {
    function absint($value): int
    {
        return abs((int) $value);
    }
}

if (!function_exists('wp_upload_dir')) {
    function wp_upload_dir(): array
    {
        return ['basedir' => sys_get_temp_dir() . '/wp-uploads'];
    }
}

if (!function_exists('wp_mkdir_p')) {
    function wp_mkdir_p(string $path): bool
    {
        $exists = is_dir($path);

        if ($exists) {
            return true;
        }

        return mkdir($path, 0755, true);
    }
}

// Load the plugin autoloader
require_once __DIR__ . '/../includes/Autoloader.php';
```

## Why mock WordPress functions?

Unit tests must run in CI without a WordPress installation. Only mock the functions your tested code actually calls. Keep mocks minimal — complex behaviour belongs in integration tests.
