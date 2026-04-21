# 15.11 Warnings & Endpoint Configuration Table

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 11.1 Inline Warnings

Critical settings sections include warnings:

```php
<p class="riseup-warning">
    <span class="dashicons dashicons-warning"></span>
    <?php esc_html_e('Warning: Disabling authentication can expose your site.', $pluginSlug); ?>
</p>
```

---

## 11.2 Conditional Error Display

Error states from previous operations are shown conditionally:

```php
<?php $hasLastError = BooleanHelpers::hasValue($settings['last_error'] ?? null); ?>
<?php if ($hasLastError): ?>
<tr>
    <th scope="row"><?php esc_html_e('Last Error', $pluginSlug); ?></th>
    <td>
        <span class="riseup-error-text"><?php echo esc_html($settings['last_error']); ?></span>
    </td>
</tr>
<?php endif; ?>
```

---

## 11.3 Version Comparison

```php
<?php if (version_compare($settings['new_version'], PluginConfigType::Version->value, '>')): ?>
    <span class="dashicons dashicons-arrow-up-alt" style="color: #46b450;"></span>
    <span style="color: #46b450;"><?php esc_html_e('Update available!', $pluginSlug); ?></span>
<?php endif; ?>
```

---

## 11.4 Endpoint Configuration Table

A specialized settings pattern for per-endpoint toggles:

```php
<table class="wp-list-table widefat fixed striped riseup-endpoints-table">
    <thead>
        <tr>
            <th><?php esc_html_e('Endpoint', $pluginSlug); ?></th>
            <th><?php esc_html_e('Description', $pluginSlug); ?></th>
            <th><?php esc_html_e('Enabled', $pluginSlug); ?></th>
            <th><?php esc_html_e('Auth Required', $pluginSlug); ?></th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($endpointGroups as $groupKey => $group): ?>
            <tr class="endpoint-group-header">
                <td colspan="4">
                    <span class="dashicons <?php echo esc_attr($group['icon']); ?>"></span>
                    <?php echo esc_html($group['label']); ?>
                </td>
            </tr>
            <?php foreach ($group['endpoints'] as $endpoint => $meta): ?>
                <tr>
                    <td>
                        <strong><?php echo esc_html($meta['label']); ?></strong><br>
                        <code>/<?php echo esc_html($endpoint); ?></code>
                    </td>
                    <td><?php echo esc_html($meta['desc']); ?></td>
                    <td>
                        <label class="toggle-switch">
                            <input type="checkbox"
                                   name="Settings[endpoints][<?php echo esc_attr($endpoint); ?>][enabled]"
                                   value="1" <?php checked($isEnabled); ?>>
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                    <td>
                        <label class="toggle-switch">
                            <input type="checkbox"
                                   name="Settings[endpoints][<?php echo esc_attr($endpoint); ?>][auth_required]"
                                   value="1" <?php checked($isAuthRequired); ?>>
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                </tr>
            <?php endforeach; ?>
        <?php endforeach; ?>
    </tbody>
</table>
```

**Rules:**
1. Endpoints are grouped by category with group headers
2. Each endpoint has independent enabled/auth toggles
3. Group data comes from `data/endpoints.json` processed by PHP
4. Toggle names use nested array notation for WordPress serialization
