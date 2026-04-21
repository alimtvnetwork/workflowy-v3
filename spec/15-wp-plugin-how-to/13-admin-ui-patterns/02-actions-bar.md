# Actions Bar

> **Updated:** 2026-04-19

The actions bar provides primary page-level operations.

---

## Anatomy

```
┌─ .riseup-card ──────────────────────────────────────────────┐
│  ┌─ .riseup-actions-row ──────────────────────────────────┐ │
│  │ [🔵 Primary] [⬜ Secondary] [⬜ Secondary] [⬜ Refresh]│ │
│  │ <inline-status>                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Expandable Options (hidden by default) ──────────────┐  │
│  │ .form-table with contextual settings                   │  │
│  │ [✅ Confirm] [Cancel]                                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Structure

```php
<div class="riseup-card">
    <div class="riseup-actions-row">
        <button class="button button-primary">
            <span class="dashicons dashicons-camera"></span>
            <?php esc_html_e('Primary Action', $pluginSlug); ?>
        </button>
        <button class="button button-secondary">
            <span class="dashicons dashicons-update"></span>
            <?php esc_html_e('Refresh', $pluginSlug); ?>
        </button>
        <span id="action-status" class="riseup-inline-status"></span>
    </div>

    <!-- Expandable options panel (toggle via JS) -->
    <div id="options_panel" style="display: none;">
        <!-- Form content -->
        <p>
            <button class="button button-primary">Confirm</button>
            <button class="button button-secondary">Cancel</button>
        </p>
    </div>
</div>
```

---

## Rules

1. Primary action is always `button-primary`, secondary actions are `button-secondary`
2. Every button with an icon uses a dashicon `<span>` inside the button
3. Inline status text (`riseup-inline-status`) appears after the last button
4. Expandable panels are separated by a border-top and use `riseup-snapshot-options` styling
5. Actions row uses `display: flex; gap: 10px; align-items: center; flex-wrap: wrap`

---

*Actions bar — v3.2.0 — 2026-04-19*
