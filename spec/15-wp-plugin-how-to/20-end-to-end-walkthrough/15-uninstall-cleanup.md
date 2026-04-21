# 20.15 Step 14 — Uninstall Cleanup

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 7, §7.4** — Destructive cleanup when plugin is deleted.

---

**File: `uninstall.php`**

```php
<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options
delete_option('task_tracker_notifications');
delete_option('task_tracker_settings');

// Delete upload directory (logs, database)
$uploadDir = wp_upload_dir();
$pluginDir = $uploadDir['basedir'] . '/task-tracker';
$hasDir = is_dir($pluginDir);

if ($hasDir) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($pluginDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );

    foreach ($iterator as $item) {
        $isDir = $item->isDir();

        if ($isDir) {
            rmdir($item->getRealPath());
        } else {
            unlink($item->getRealPath());
        }
    }

    rmdir($pluginDir);
}
```
