# 16.9 Error Notification Settings

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Stored under `OptionNameType::ErrorNotification`:

```php
case ErrorNotification = 'RiseupErrorNotificationSettings';
```

## Configurable Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `email_enabled` | bool | false | Send email on fatal errors |
| `email_address` | string | admin_email | Recipient address |
| `threshold` | int | 5 | Minimum errors before notification |
| `cooldown_minutes` | int | 60 | Minimum time between notifications |
