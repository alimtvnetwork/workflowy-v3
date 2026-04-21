# Toast Dedup, Circuit Breaker & Snapshot Suppression (§6–8)

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 6. Toast Notification Deduplication

### Symptom
Multiple identical toast notifications appeared simultaneously, e.g.:
- "Publish complete" × 3 (from WebSocket event + local state change + query refetch)
- "Connection test passed" × 2 (from WebSocket + API response)

### Root Cause
Both the WebSocket event handler (`useWsToastNotifications`) AND the local UI handler would fire toasts for the same event. No dedup existed.

### Fix — `src/lib/dedupToast.ts`
```typescript
const DEDUP_WINDOW_MS = 3000; // 3 seconds
const recentToasts = new Map<string, number>();

function isDuplicate(key: string): boolean {
  const lastShown = recentToasts.get(key);

  if (lastShown && Date.now() - lastShown < DEDUP_WINDOW_MS) return true;
  recentToasts.set(key, Date.now());
  // Periodic cleanup
  if (recentToasts.size > 50) {
    const now = Date.now();

    for (const [k, t] of recentToasts) {
      if (now - t > DEDUP_WINDOW_MS) recentToasts.delete(k);
    }
  }

  return false;
}

export const dedupToast = {
  success: createDedupMethod("success"),
  error: createDedupMethod("error"),
  warning: createDedupMethod("warning"),
  info: createDedupMethod("info"),
  message: createDedupMethod("message"),
};
```

### Usage
```typescript
// Replace: import { toast } from "sonner";
// With:    import { dedupToast as toast } from "@/lib/dedupToast";
```

### Key Principle
**Always use `dedupToast` instead of raw `sonner.toast`** in any component that might fire toasts from multiple sources (WebSocket + API response + state change).

---

## 7. Circuit Breaker for Failing Endpoints

### Symptom
When a backend endpoint was consistently failing (e.g., site offline), every poll/check would generate error toasts and error log entries indefinitely.

### Root Cause
No mechanism existed to stop calling a persistently failing endpoint. Polling intervals would keep firing, generating noise.

### Fix — `src/lib/circuitBreaker.ts`
```typescript
const DEFAULT_CONFIG = {
  failureThreshold: 5,    // Open circuit after 5 failures
  cooldownMs: 60000,      // Wait 1 minute before trying again
  failureWindowMs: 60000, // Count failures within 1-minute window
};

// Usage:
const result = await withCircuitBreaker('api.getSites', () => api.getSites());
```

States: `closed` (normal) → `open` (blocked) → `half-open` (test one request after cooldown) → `closed` (if test succeeds).

### Key Principle
**Wrap polling and health-check calls in a circuit breaker** to prevent error storms against failing endpoints.

---

## 8. Snapshot Query Retry Suppression

### Symptom
Snapshot list queries for disconnected sites (siteId=0) would trigger the global error modal on every poll cycle.

### Root Cause
Queries with `siteId: 0` are "background" queries that run speculatively. Their failures should be silent.

### Fix
```typescript
// src/hooks/useRemoteSnapshots.ts
{
  retry: false,
  refetchOnWindowFocus: false,
  meta: { suppressGlobalError: true }, // ← Prevents error modal
}

// src/components/settings/SnapshotSettingsTab.tsx
{
  retry: false,
  meta: { suppressGlobalError: true },
}
```

The `suppressGlobalError` flag is checked in the global `QueryCache.onError` handler and skips the error modal.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-websocket-listener-fixes.md`](./03-websocket-listener-fixes.md) — Previous: WebSocket fixes
- [`05-anti-patterns-and-files.md`](./05-anti-patterns-and-files.md) — Next: anti-patterns
