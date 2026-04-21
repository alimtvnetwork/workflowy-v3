# 15.9 Selection Cards & Sliders

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 9.1 Selection Cards (Radio Alternative)

For mutually exclusive settings with visual emphasis:

```php
<div class="riseup-storage-mode-cards" style="display: flex; gap: 12px;">
    <label class="riseup-mode-card" id="mode_card_single"
           style="flex: 1; cursor: pointer; padding: 12px;
                  border: 2px solid <?php echo $storageMode === 'single' ? '#2271b1' : '#dcdcde'; ?>;
                  border-radius: 8px;
                  background: <?php echo $storageMode === 'single' ? '#f0f6fc' : '#fff'; ?>;">
        <input type="radio" name="storage_mode" value="single"
               <?php checked($storageMode, 'single'); ?> style="display: none;">
        <span class="dashicons dashicons-database"></span>
        <strong>Single File</strong>
        <span class="description">All tables in one database.</span>
    </label>
    <!-- More cards... -->
</div>
```

**JavaScript toggles active state:**
```javascript
document.querySelectorAll('.riseup-mode-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.riseup-mode-card').forEach(card => {
            const isActive = card.querySelector('input').checked;
            card.style.borderColor = isActive ? '#2271b1' : '#dcdcde';
            card.style.background = isActive ? '#f0f6fc' : '#fff';
        });
    });
});
```

---

## 9.2 Slider Input

For numeric range settings with visual feedback:

```php
<div style="display: flex; align-items: center; gap: 12px; max-width: 340px;">
    <input type="range" id="worker_pool_size"
           min="<?php echo esc_attr(SnapshotConfigType::WorkerPoolMin->value); ?>"
           max="<?php echo esc_attr(SnapshotConfigType::workerPoolMax()); ?>"
           value="<?php echo esc_attr($workerPoolSize); ?>"
           style="flex: 1; accent-color: #2271b1;">
    <span id="worker_pool_value"
          style="font-family: monospace; font-size: 14px; min-width: 24px;
                 text-align: center; font-weight: 600; color: #2271b1;">
        <?php echo esc_html($workerPoolSize); ?>
    </span>
</div>
```

JavaScript updates the display:
```javascript
document.getElementById('worker_pool_size').addEventListener('input', function() {
    document.getElementById('worker_pool_value').textContent = this.value;
});
```
