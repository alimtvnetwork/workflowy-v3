# 16.7 Auto-Refresh for Error Pages

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Error pages support automatic polling for new errors:

```javascript
var autoRefreshTimer = null;

function startAutoRefresh(intervalMs) {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(function() {
        loadErrors();  // Re-fetch and re-render table
    }, intervalMs);
}

function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}
```

## Rules

- Default interval: **30 seconds**
- Auto-refresh MUST stop when modal is open
- Auto-refresh MUST stop when user is interacting (e.g., selecting text)
- Toggle state persists via a UI switch (see Phase 13 — Toggle Switch)
