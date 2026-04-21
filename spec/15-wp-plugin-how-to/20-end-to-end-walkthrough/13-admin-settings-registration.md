# 20.13 Step 12 — Admin Settings Registration

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 15** — [`OptionNameType` enum](../15-settings-architecture/01-data-model.md) for wp_options keys.

---

Register settings in `admin_init`:

```php
public function registerSettings(): void
{
    register_setting(
        PluginConfigType::SettingsGroup->value,
        OptionNameType::NotificationsEnabled->value,
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'no',
        ],
    );
}
```

Wire in Plugin constructor: `add_action('admin_init', [$this, 'registerSettings']);`
