# 15.6 Field Types & UI Patterns

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 6.1 Text Input

```php
<input type="text" id="field_id"
       name="<?php echo esc_attr(OptionNameType::Settings->value); ?>[key]"
       value="<?php echo esc_attr($value); ?>"
       class="regular-text"
       placeholder="Example text">
<p class="description"><?php esc_html_e('Help text.', $pluginSlug); ?></p>
```

---

## 6.2 URL Input

```php
<input type="url" id="field_id"
       name="<?php echo esc_attr(OptionNameType::Settings->value); ?>[key]"
       value="<?php echo esc_attr($value); ?>"
       class="regular-text"
       placeholder="https://example.com">
```

---

## 6.3 Email Input

```php
<input type="email" id="field_id"
       name="<?php echo esc_attr(OptionNameType::Settings->value); ?>[key]"
       value="<?php echo esc_attr($value ?? ''); ?>"
       class="regular-text"
       placeholder="support@example.com">
```

---

## 6.4 Number Input

```php
<input type="number" id="field_id"
       name="<?php echo esc_attr(OptionNameType::Settings->value); ?>[key]"
       value="<?php echo esc_attr($value); ?>"
       min="50" max="5000" step="50"
       class="small-text">
```

---

## 6.5 Select (Enum-Driven)

```php
<select id="field_id"
        name="<?php echo esc_attr(OptionNameType::Settings->value); ?>[key]">
    <?php foreach (MyEnumType::cases() as $case): ?>
        <option value="<?php echo esc_attr($case->value); ?>"
                <?php selected($currentValue, $case->value); ?>>
            <?php echo esc_html($case->label()); ?>
        </option>
    <?php endforeach; ?>
</select>
```

---

## 6.6 Time Input

```php
<input type="time" id="field_id" value="<?php echo esc_attr($scheduleTime); ?>">
```

---

## 6.7 Read-Only Display

```php
<tr>
    <th><?php esc_html_e('Version', $pluginSlug); ?></th>
    <td><code><?php echo esc_html(PluginConfigType::Version->value); ?></code></td>
</tr>
```

---

## 6.8 Diagnostic Display (Conditional)

```php
<?php $hasValue = BooleanHelpers::hasValue($settings['resolved_url'] ?? null); ?>
<?php if ($hasValue): ?>
    <code><?php echo esc_html($settings['resolved_url']); ?></code>
    <br><small class="text-muted">
        <?php printf(esc_html__('Cached on: %s', $pluginSlug), esc_html($settings['resolved_at'])); ?>
    </small>
<?php else: ?>
    <em><?php esc_html_e('Not resolved yet', $pluginSlug); ?></em>
<?php endif; ?>
```
