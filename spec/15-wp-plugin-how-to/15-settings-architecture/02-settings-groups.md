# 15.2 Settings Groups

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 2.1 Group Architecture

Settings are organized into logical groups, each rendered as a `.riseup-card` section:

| Group | Option Name | Description | UI Section |
|-------|------------|-------------|------------|
| Plugin Settings | `RiseupAsiaSettings` | Endpoints, auth, log retrieval | Main settings card |
| Auto-Update | `RiseupUpdateSettings` | Master URL, cache, resolved URL | Auto-update card |
| Snapshot Settings | `RiseupSnapshotSettings` | Provider, schedule, retention, worker pool | Snapshot card (partial) |
| Log Retrieval | via `RiseupAsiaSettings[log_retrieval]` | Which logs to include in API | Log retrieval card (partial) |
| Error Notification | `RiseupErrorNotificationSettings` | Error alert configuration | Error notification card |
| Support | `RiseupSupportSettings` | Support email, fallback URL | Support card |

---

## 2.2 Nested Settings

Some option groups use nested arrays for logical sub-grouping:

```php
// Nested structure in RiseupAsiaSettings
$settings = [
    'endpoints' => [
        'upload' => ['enabled' => 1, 'auth_required' => 1],
        'status' => ['enabled' => 1, 'auth_required' => 0],
    ],
    'log_retrieval' => [
        'include_error_log' => 1,
        'include_full_log'  => 0,
        'max_lines'         => 500,
    ],
];
```

HTML `name` attributes encode the nesting:
```html
<input name="RiseupAsiaSettings[endpoints][upload][enabled]" value="1">
<input name="RiseupAsiaSettings[log_retrieval][max_lines]" value="500">
```
