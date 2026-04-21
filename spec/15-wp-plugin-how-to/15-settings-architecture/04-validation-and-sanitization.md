# 15.4 Validation & Sanitization

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 4.1 WordPress Registration

Settings MUST be registered with `register_setting()` including a sanitize callback:

```php
register_setting(
    PluginConfigType::SettingsGroup->value,
    OptionNameType::PluginSettings->value,
    [
        'type'              => 'array',
        'sanitize_callback' => [$this, 'sanitizePluginSettings'],
    ]
);
```

---

## 4.2 Sanitize Callback Pattern

```php
public function sanitizePluginSettings(array $input): array {
    $sanitized = [];

    // Boolean toggle → checkbox sends '1' or nothing
    $sanitized['endpoints'] = [];
    foreach ($input['endpoints'] ?? [] as $endpoint => $config) {
        $sanitized['endpoints'][$endpoint] = [
            'enabled'       => isset($config['enabled']) ? 1 : 0,
            'auth_required' => isset($config['auth_required']) ? 1 : 0,
        ];
    }

    // Numeric with range
    $maxLines = intval($input['log_retrieval']['max_lines'] ?? 500);
    $sanitized['log_retrieval']['max_lines'] = max(50, min(5000, $maxLines));

    // URL
    $sanitized['master_url'] = esc_url_raw($input['master_url'] ?? '');

    // Email
    $sanitized['support_email'] = sanitize_email($input['support_email'] ?? '');

    return $sanitized;
}
```

---

## 4.3 Validation Rules by Field Type

| Field Type | Sanitization | Validation |
|-----------|-------------|------------|
| Text | `sanitize_text_field()` | Max length check |
| URL | `esc_url_raw()` | Must start with `https://` |
| Email | `sanitize_email()` | WordPress email validation |
| Number | `intval()` / `floatval()` | Min/max range clamping |
| Checkbox | `isset() ? 1 : 0` | Boolean coercion |
| Select | `sanitize_text_field()` | Must match enum values |
| Textarea | `sanitize_textarea_field()` | Max length check |

---

## 4.4 Enum-Constrained Selects

Select fields whose values come from enums MUST validate against the enum:

```php
$frequency = $input['schedule_frequency'] ?? '';
$validFrequency = SnapshotFrequencyType::tryFrom($frequency);
$sanitized['schedule_frequency'] = $validFrequency?->value
    ?? SnapshotFrequencyType::Daily->value;
```
