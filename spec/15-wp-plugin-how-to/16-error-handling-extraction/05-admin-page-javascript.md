# 16.5 Error Admin Page JavaScript Pattern

> **Parent:** [Phase 16 overview](./00-overview.md)

---

The error management page follows the standard localized-object pattern:

```javascript
jQuery(document).ready(function($) {
    var C = window.RiseupErrors;
    var ajaxNonce = C.nonce;
    var activeTab = C.activeTab;
    var autoRefreshTimer = null;

    // Flash banner dismiss
    $('#riseup-dismiss-flash').on('click', function() {
        $.post(ajaxurl, {
            action: C.actions.dismissFlash,
            nonce: ajaxNonce
        }, function(response) {
            if (response.success) {
                $('#riseup-flash-banner').slideUp(300);
                $('.tab-badge, .error-count-badge').fadeOut(200);
            }
        });
    });
});
```

## Localized Object Shape (`RiseupErrors`)

```javascript
window.RiseupErrors = {
    nonce: '...',
    activeTab: 'errors',           // Current active tab
    actions: {
        dismissFlash: 'riseup_dismiss_error_flash',
        clearSessions: 'riseup_clear_error_sessions',
    },
    i18n: {
        dismissing: 'Dismissing...',
        markAsSeen: 'Mark as Seen',
        confirmClearAll: 'Are you sure you want to clear all error sessions?',
    }
};
```
