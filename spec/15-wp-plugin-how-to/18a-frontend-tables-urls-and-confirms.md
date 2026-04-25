# Frontend JS Patterns — Tables, URL Builders & Confirm Actions

> **Split from** [`18-frontend-javascript-patterns.md`](./18-frontend-javascript-patterns.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 18.7 Table Rendering from API Data

### Dynamic Table Population

```javascript
function loadAgents() {
    $('#agents-loading').show();
    $('#agents-table').hide();

    apiRequest('GET', ENDPOINTS.agents).done(function(response) {
        var $tbody = $('#agents-tbody').empty();
        var agents = response[RESPONSE_KEYS.agents];

        if (!agents || agents.length === 0) {
            $tbody.append(
                '<tr class="no-agents"><td colspan="5">' +
                LABELS.noAgentsYet +
                '</td></tr>'
            );
        } else {
            agents.forEach(function(agent) {
                $tbody.append(buildAgentRow(agent));
            });
        }
    }).always(function() {
        $('#agents-loading').hide();
        $('#agents-table').show();
    });
}
```

### Rules

| Rule | Detail |
|------|--------|
| Loading state | Show loading indicator, hide table during fetch |
| Empty state | Display localized "no data" message in a full-colspan row |
| `.empty()` before append | Always clear tbody before re-rendering |
| `.always()` for cleanup | Hide loader in `.always()`, not `.done()` |
| HTML escaping | Use `escapeHtml()` helper for all user-supplied content |

### HTML Escape Helper

```javascript
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
```

---

## 18.8 URL Builder Helpers

### Per-Entity Endpoint URLs

```javascript
function buildAgentUrl(id, suffix) {
    return ENDPOINTS.agents + '/' + id + (suffix ? '/' + suffix : '');
}

function endpointSuffix(endpointValue) {
    var parts = endpointValue.split('/');
    return parts[parts.length - 1];
}
```

### Rules

- Build URLs from localized endpoint values — never hardcode paths
- Use helper functions for URL construction — never inline string concatenation
- Entity-specific endpoints follow `{resource}/{id}/{action}` pattern

---

## 18.9 Confirm-Before-Destructive-Action

```javascript
$('#riseup-clear-errors').on('click', function() {
    if (!confirm(C.i18n.confirmClearAll)) {
        return;
    }
    // ... proceed with AJAX
});
```

### Rules

| Rule | Detail |
|------|--------|
| Always confirm | Delete, clear, remove, reset — any destructive action |
| Localized message | Confirmation text from `i18n` — never hardcode |
| Return early | If cancelled, `return` immediately — don't nest the AJAX call |

---

## 18.10 Checklist

- [ ] One JS file per admin page, named `admin-{page}.js`
- [ ] All PHP values passed via `wp_localize_script()` — no inline `<script>` blocks
- [ ] Localized object uses enum `->value` for endpoints, response keys, status values
- [ ] All user-facing strings in `i18n` sub-object, translated with `__()`
- [ ] REST requests use `X-WP-Nonce` header via `beforeSend`
- [ ] WordPress AJAX uses `ajaxurl` + `action` + `nonce` pattern
- [ ] Buttons disabled during AJAX with spinner swap
- [ ] Modals have three close methods (button, overlay, Escape)
- [ ] Dynamic tables handle loading, empty, and populated states
- [ ] Destructive actions require `confirm()` with localized message
- [ ] `escapeHtml()` used for all user-supplied content in HTML

---

*Last Updated: 2026-04-09*
