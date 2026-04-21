# 15.8 Conditional Display

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 8.1 Server-Side Conditional Rendering

Fields that depend on other values use inline `style` with PHP logic:

```php
<tr id="retention_days_row"
    style="<?php echo $retentionType !== RetentionType::Days->value ? 'display:none;' : ''; ?>">
```

---

## 8.2 Enum-Driven Conditional Logic

Complex conditionals use enum helper methods:

```php
<tr id="day_row"
    style="<?php
        $freq = SnapshotFrequencyType::tryFrom($scheduleFrequency);
        echo ($freq !== null && $freq->isAnyOf(
            SnapshotFrequencyType::Hourly,
            SnapshotFrequencyType::Daily,
            SnapshotFrequencyType::Manual
        )) ? 'display:none;' : '';
    ?>">
```

---

## 8.3 Client-Side Toggle (JavaScript)

```javascript
document.getElementById('retention_type').addEventListener('change', function() {
    document.getElementById('retention_days_row').style.display =
        this.value === 'days' ? '' : 'none';
    document.getElementById('retention_count_row').style.display =
        this.value === 'count' ? '' : 'none';
});
```

---

## 8.4 Rules

1. Initial visibility MUST be set server-side in PHP (no FOUC)
2. JavaScript handles dynamic toggling after page load
3. Hidden fields' values are preserved even when hidden
4. Conditional rows use `display: none` (not `visibility: hidden`)
5. Use `style.display = ''` to restore, not `style.display = 'table-row'`
