# 15.7 Toggle Switch

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 7.1 HTML Structure

```php
<label class="toggle-switch">
    <input type="checkbox"
           id="field_id"
           name="<?php echo esc_attr(OptionNameType::Settings->value); ?>[key]"
           value="1"
           <?php checked($isEnabled); ?>>
    <span class="toggle-slider"></span>
</label>
```

---

## 7.2 CSS

```css
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    vertical-align: middle;
}
.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}
.toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: #cbd5e1;
    border-radius: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle-slider::before {
    content: '';
    position: absolute;
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.toggle-switch input:checked + .toggle-slider {
    background: var(--riseup-primary, #1d4ed8);
}
.toggle-switch input:checked + .toggle-slider::before {
    transform: translateX(20px);
}
.toggle-switch input:focus + .toggle-slider {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

---

## 7.3 Boolean Extraction

Use `BooleanHelpers::hasValue()` for consistent truthy detection:

```php
$isEnabled = BooleanHelpers::hasValue($settings['enabled'] ?? null);
checked($isEnabled);
```

---

## 7.4 Toggle in Tables

Toggles in endpoint configuration tables use nested `name` attributes:

```php
<label class="toggle-switch">
    <input type="checkbox"
           name="<?php echo esc_attr(OptionNameType::PluginSettings->value); ?>[endpoints][<?php echo esc_attr($endpoint); ?>][enabled]"
           value="1"
           <?php checked($isEnabled); ?>>
    <span class="toggle-slider"></span>
</label>
```
