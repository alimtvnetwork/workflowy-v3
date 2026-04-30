# Table Patterns

> **Updated:** 2026-04-19

---

## Standard Table

All data tables use WordPress `wp-list-table widefat fixed striped`:

```php
<table class="wp-list-table widefat fixed striped">
    <thead>
        <tr>
            <th class="column-name"><?php esc_html_e('Name', $pluginSlug); ?></th>
            <!-- Column widths defined in page-specific CSS -->
        </tr>
    </thead>
    <tbody>
        <?php if (empty($items)): ?>
            <tr><td colspan="5" class="no-items"><?php esc_html_e('No items found.', $pluginSlug); ?></td></tr>
        <?php else: ?>
            <?php foreach ($items as $item): ?>
                <tr><!-- row content --></tr>
            <?php endforeach; ?>
        <?php endif; ?>
    </tbody>
</table>
```

---

## Column Width Definitions

Column widths MUST be defined in page-specific CSS using `.column-{name}` classes: (gate `G-ADR-0003-FRONTEND-STACK-LOCK`)

```css
.riseup-admin.riseup-agents .column-name    { width: 20%; }
.riseup-admin.riseup-agents .column-url     { width: 30%; }
.riseup-admin.riseup-agents .column-status  { width: 10%; }
.riseup-admin.riseup-agents .column-actions { width: 25%; }
```

---

## Date Group Headers

Tables with chronological data MUST insert date group separator rows when the date changes: (gate `G-ADR-0003-FRONTEND-STACK-LOCK`)

```php
<?php
$currentDateGroup = '';
foreach ($logs as $log):
    $logDate = DateHelper::formatDateOnly($logTimestamp);
    
    if ($logDate !== $currentDateGroup):
        $currentDateGroup = $logDate;
        $relativeDayKey = DateHelper::relativeDayKey($logTimestamp);
        // Build label: "Today — March 15, 2026" or just "March 14, 2026"
        if ($relativeDayKey === 'today') {
            $dateLabel = __('Today', $pluginSlug) . ' — ' . $logDateDisplay;
        } elseif ($relativeDayKey === 'yesterday') {
            $dateLabel = __('Yesterday', $pluginSlug) . ' — ' . $logDateDisplay;
        } else {
            $dateLabel = $logDateDisplay;
        }
?>
    <tr class="date-group-header">
        <td colspan="11">
            <span class="date-group-label"><?php echo esc_html($dateLabel); ?></span>
        </td>
    </tr>
<?php endif; ?>
    <tr><!-- normal data row --></tr>
<?php endforeach; ?>
```

**Visual:**
```
┌──────────────────────────────────────────────────────┐
│ 📅 Today — April 9, 2026                            │  ← gradient bg, accent border-top
├──────────────────────────────────────────────────────┤
│ Row data...                                          │
│ Row data...                                          │
├──────────────────────────────────────────────────────┤
│ 📅 Yesterday — April 8, 2026                        │
├──────────────────────────────────────────────────────┤
│ Row data...                                          │
└──────────────────────────────────────────────────────┘
```

---

## Clickable Rows

Rows with expandable details use a `has-details` class and store data in `data-details`:

```php
<tr class="riseup-log-row <?php echo $hasDetails ? 'has-details' : ''; ?>"
    <?php if ($hasDetails): ?>
        data-details="<?php echo esc_attr(json_encode($details)); ?>"
    <?php endif; ?>>
```

Hover effect: `inset 3px 0 0 #667eea` left border accent + background tint.

---

## Endpoint Group Headers

Tables displaying REST API endpoints group by category:

```php
<tr class="endpoint-group-header">
    <td colspan="4"><?php echo esc_html($groupName); ?></td>
</tr>
```

---

## Nested Rows

Child rows (e.g., incremental snapshots under full backups) use:

```php
<tr class="riseup-nested-row">
    <td><!-- 3px purple left border via CSS --></td>
</tr>
```

---

*Table patterns — v3.2.0 — 2026-04-19*
