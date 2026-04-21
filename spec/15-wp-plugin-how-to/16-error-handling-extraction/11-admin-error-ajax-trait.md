# 16.11 AdminErrorAjaxTrait — Log File Operations

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Admin pages that display log files need AJAX handlers for reading, clearing, and bulk-clearing log files. This trait provides the standard pattern.

## Location

`includes/Admin/Traits/AdminErrorAjaxTrait.php`

## Full implementation pattern

```php
namespace PluginName\Admin\Traits;

use PluginName\Enums\AjaxActionType;
use PluginName\Enums\CapabilityType;
use PluginName\Helpers\PathHelper;

trait AdminErrorAjaxTrait
{
    /**
     * AJAX handler: Read a log file's content.
     * Action: wp_ajax_{plugin}_read_log_file
     */
    public function ajaxReadLogFile(): void
    {
        check_ajax_referer(AjaxActionType::ReadLogFile->nonceAction(), 'nonce');

        $hasPermission = current_user_can(CapabilityType::ManageOptions->value);
        if (!$hasPermission) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $filename = sanitize_file_name($_POST['filename'] ?? '');
        $allowedFiles = ['error.log', 'info.log', 'stacktrace.log', 'fatal-errors.log'];
        $isAllowed = in_array($filename, $allowedFiles, true);

        if (!$isAllowed) {
            wp_send_json_error(['message' => 'Invalid log file'], 400);
        }

        $filePath = PathHelper::getLogsDir() . '/' . $filename;
        $fileExists = file_exists($filePath);
        $content = $fileExists ? file_get_contents($filePath) : '';

        wp_send_json_success([
            'filename' => $filename,
            'content'  => $content,
            'size'     => $fileExists ? filesize($filePath) : 0,
            'isEmpty'  => ($content === '' || $content === false),
        ]);
    }

    /**
     * AJAX handler: Clear a single log file.
     * Action: wp_ajax_{plugin}_clear_log_file
     */
    public function ajaxClearLogFile(): void
    {
        check_ajax_referer(AjaxActionType::ClearLogFile->nonceAction(), 'nonce');

        $hasPermission = current_user_can(CapabilityType::ManageOptions->value);
        if (!$hasPermission) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $filename = sanitize_file_name($_POST['filename'] ?? '');
        $filePath = PathHelper::getLogsDir() . '/' . $filename;
        $fileExists = file_exists($filePath);

        if ($fileExists) {
            file_put_contents($filePath, '');
        }

        wp_send_json_success(['filename' => $filename, 'cleared' => true]);
    }

    /**
     * AJAX handler: Clear all log files.
     * Action: wp_ajax_{plugin}_clear_all_logs
     */
    public function ajaxClearAllLogs(): void
    {
        check_ajax_referer(AjaxActionType::ClearAllLogs->nonceAction(), 'nonce');

        $hasPermission = current_user_can(CapabilityType::ManageOptions->value);
        if (!$hasPermission) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $logsDir = PathHelper::getLogsDir();
        $logFiles = glob($logsDir . '/*.log');
        $clearedCount = 0;

        foreach ($logFiles as $file) {
            file_put_contents($file, '');
            $clearedCount++;
        }

        wp_send_json_success(['cleared' => $clearedCount]);
    }
}
```

## AJAX Action Registration

In the `Admin` class constructor:

```php
add_action(HookType::ajax(AjaxActionType::ReadLogFile->value), [$this, 'ajaxReadLogFile']);
add_action(HookType::ajax(AjaxActionType::ClearLogFile->value), [$this, 'ajaxClearLogFile']);
add_action(HookType::ajax(AjaxActionType::ClearAllLogs->value), [$this, 'ajaxClearAllLogs']);
```

## Required Enum Cases

```php
enum AjaxActionType: string
{
    case ReadLogFile = 'pluginname_read_log_file';
    case ClearLogFile = 'pluginname_clear_log_file';
    case ClearAllLogs = 'pluginname_clear_all_logs';

    public function nonceAction(): string
    {
        return $this->value . '_nonce';
    }
}
```

## REST vs AJAX Decision Matrix

| Operation | Pattern | Reason |
|-----------|---------|--------|
| Log file read/clear (admin-only) | **AJAX** (`wp_ajax_*`) | No external consumers, admin-page JS only |
| Error log query (structured data) | **REST** | May be consumed by Go backend or external tools |
| Error session management | **REST** | Structured data with filtering, pagination |
| Flash banner dismiss | **AJAX** | Simple toggle, admin-page JS only |
| Plugin settings update | **REST** | Standard CRUD, may have external consumers |
