# Badge System Usage

> **Updated:** 2026-04-19

---

## Enum-Driven Badge Rendering

Badges MUST be driven by enum values mapped to CSS classes and label arrays:

```php
// Build mappings from enums
$triggerClasses = [
    TriggerSourceType::Api->value       => 'trigger-api',
    TriggerSourceType::Dashboard->value => 'trigger-dashboard',
    TriggerSourceType::Agent->value     => 'trigger-agent',
];
$triggerLabels = [
    TriggerSourceType::Api->value       => __('API', $pluginSlug),
    TriggerSourceType::Dashboard->value => __('Dashboard', $pluginSlug),
];

// Render
<span class="trigger-badge <?php echo esc_attr($triggerClass); ?>">
    <?php echo esc_html($triggerLabel); ?>
</span>
```

---

## Badge Categories in Use

| Category | Class Pattern | Shape | Use Case |
|----------|--------------|-------|----------|
| **Status** | `.status-{Value}` | pill (20px radius) | Connection status, operation result |
| **Action** | `.action-{Value}` | tag (4px radius) | Log action type |
| **Trigger** | `.trigger-{source}` | tag (4px radius) | How an operation was initiated |
| **Upload Source** | `.source-{method}` | tag (4px radius) | Upload method badge |
| **HTTP Method** | `.method-{verb}` | tag (6px radius) | REST endpoint method |
| **Version** | `.version-{state}` | tag (4px radius) | Current vs old version |
| **Level** | `.level-badge` | pill (20px radius) | Error severity |
| **Count** | `.error-count-badge` | pill (12px radius) | Header error count |
| **Tab** | `.tab-badge` | pill (10px radius) | Tab notification count |

---

## Missing Value Handling

When a value is empty or null, render a muted placeholder instead of a badge:

```php
<?php if ($hasValue): ?>
    <span class="badge"><?php echo esc_html($label); ?></span>
<?php else: ?>
    <span class="na">—</span>
<?php endif; ?>
```

---

*Badge usage — v3.2.0 — 2026-04-19*
