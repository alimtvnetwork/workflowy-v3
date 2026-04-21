# Modal Anatomy

> **Updated:** 2026-04-19

---

## Modal Wrapper Partial

All modals MUST use the `modal-wrapper.php` partial for consistency:

```php
<?php
$modalId    = 'confirm-delete-modal';
$modalTitle = __('Confirm Deletion', $pluginSlug);
$modalIcon  = 'dashicons-warning';
$modalIconColor = '#d63638';
$modalBody  = '<p>' . __('Are you sure?', $pluginSlug) . '</p>';
$modalFooter = '<button class="button button-primary">Confirm</button>';
include __DIR__ . '/partials/shared/modal-wrapper.php';
?>
```

**Available variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `$modalId` | `'riseup-modal'` | HTML id attribute |
| `$modalTitle` | `''` | Modal heading text |
| `$modalIcon` | `''` | Dashicons class for header icon |
| `$modalIconColor` | `''` | Icon color override |
| `$modalMaxWidth` | `'600px'` | Content max-width |
| `$modalCloseButton` | `true` | Show × close button |
| `$modalHeaderExtra` | `''` | Raw HTML after title |
| `$modalBody` | `''` | Modal body content |
| `$modalFooter` | `''` | Footer/actions content |

---

## Variable Cleanup

The partial MUST `unset()` all modal variables after rendering to prevent bleed into subsequent includes:

```php
unset($modalId, $modalTitle, $modalIcon, $modalIconColor, 
      $modalMaxWidth, $modalCloseButton, $modalHeaderExtra, 
      $modalBody, $modalFooter);
```

---

## Modal Sizes

| Size | Max Width | Use Case |
|------|-----------|----------|
| Standard | `600px` | Confirmations, simple forms |
| Wide | `800px` | Agent plugins, complex forms |
| Fullscreen | `1000px` | Error detail with tabs |

---

## Modal Rendering (Inline vs Partial)

Simple modals that don't need the partial (e.g., legacy templates) may use inline HTML but MUST follow the same class structure:

```php
<div id="my-modal" class="riseup-modal" style="display: none;">
    <div class="riseup-modal-overlay"></div>
    <div class="riseup-modal-content">
        <div class="riseup-modal-header">
            <div class="modal-header-left">
                <span class="dashicons dashicons-admin-plugins"></span>
                <h3>Title</h3>
            </div>
            <button type="button" class="riseup-modal-close">&times;</button>
        </div>
        <div class="riseup-modal-body"><!-- content --></div>
    </div>
</div>
```

---

*Modal anatomy — v3.2.0 — 2026-04-19*
