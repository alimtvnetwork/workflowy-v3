# 15.10 Action Buttons

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 10.1 Settings Action Row

Settings sections may include action buttons that perform AJAX operations without saving:

```php
<tr>
    <th scope="row"><?php esc_html_e('Actions', $pluginSlug); ?></th>
    <td>
        <button type="button" id="btn_test_connection" class="button button-secondary">
            <span class="dashicons dashicons-yes-alt"></span>
            <?php esc_html_e('Test Connection', $pluginSlug); ?>
        </button>
        <button type="button" id="btn_clear_cache" class="button button-secondary">
            <span class="dashicons dashicons-trash"></span>
            <?php esc_html_e('Clear Cache', $pluginSlug); ?>
        </button>
        <button type="button" id="btn_check_updates" class="button button-secondary">
            <span class="dashicons dashicons-update"></span>
            <?php esc_html_e('Check Now', $pluginSlug); ?>
        </button>
        <span id="action_status" class="riseup-inline-status"></span>
    </td>
</tr>
```

---

## 10.2 Rules

1. Action buttons MUST use `type="button"` (not `submit`) to prevent form submission
2. Each button has a dashicon for visual identification
3. Inline status text shows operation result
4. Buttons in action rows use `button-secondary` variant
5. The primary save button uses `submit_button()` or `button-primary`

---

## 10.3 AJAX Action Flow

```javascript
document.getElementById('btn_test_connection').addEventListener('click', async function() {
    const btn = this;
    const status = document.getElementById('action_status');
    const icon = btn.querySelector('.dashicons');

    // Loading state
    icon.classList.add('spin');
    btn.disabled = true;
    status.textContent = '';

    try {
        const response = await fetch(ajaxUrl, { method: 'POST', body: formData });
        const data = await response.json();

        status.className = 'riseup-inline-status ' + (data.success ? 'success' : 'error');
        status.textContent = data.success ? '✓ Connected' : '✕ ' + data.message;
    } catch (e) {
        status.className = 'riseup-inline-status error';
        status.textContent = '✕ Request failed';
    } finally {
        icon.classList.remove('spin');
        btn.disabled = false;
    }
});
```
