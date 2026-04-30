# Publish Dedup & Cooldown (§3–4)

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 3. Publish Double-Invocation (API-Level Dedup Lock)

### Symptom
Users could trigger the publish function multiple times by:
- Double-clicking the publish button
- Auto-publish triggering while a manual publish was in-flight
- WebSocket reconnection re-triggering the publish

This caused duplicate ZIP uploads, duplicate activity logs, and race conditions on the remote WordPress site.

### Root Cause
No guard existed at the API method level. The publish function was a single-line `request()` call (≤3 LOC, zero guard logic) that could be invoked any number of times concurrently.

### Fix — `src/lib/api/methods.ts`
```typescript
publishPlugin: (() => {
  const inFlight = new Set<string>();
  const cooldowns = new Map<string, number>();
  const COOLDOWN_MS = 30_000; // 30s cooldown after success

  return (pluginId, siteId, options) => {
    const key = `${pluginId}:${siteId}`;

    // Guard 1: Block if already in-flight
    if (inFlight.has(key)) {
      console.warn(`[api.publishPlugin] BLOCKED duplicate in-flight request`);

      return Promise.resolve({
        success: false,
        error: { code: "E_DEDUP", message: "A publish is already in progress" },
      });
    }

    // Guard 2: Block if within cooldown period
    const lastSuccess = cooldowns.get(key);

    if (lastSuccess && Date.now() - lastSuccess < COOLDOWN_MS) {
      const secsLeft = Math.ceil((COOLDOWN_MS - (Date.now() - lastSuccess)) / 1000);

      return Promise.resolve({
        success: false,
        error: { code: "E_COOLDOWN", message: `Cooldown active (${secsLeft}s remaining)` },
      });
    }

    inFlight.add(key);

    return request(endpoint, { method: HttpMethod.Post, body }).then(response => {
      if (response.success) cooldowns.set(key, Date.now());

      return response;
    }).finally(() => {
      inFlight.delete(key);
    });
  };
})(),
```

### Architecture Details
- **IIFE closure** wraps the function so `inFlight` and `cooldowns` are module-scoped singletons
- **`E_DEDUP` error code** — returned locally, never reaches the network
- **`E_COOLDOWN` error code** — prevents rapid re-publish after success
- **30-second cooldown** — prevents the auto-publish re-triggering immediately after a manual publish completes
- **`.finally()`** — ensures `inFlight` is always cleaned up, even on network errors

### Key Principle
**Critical mutating operations must have an API-layer dedup lock**, not just UI-level button disabling. UI guards can be bypassed by programmatic callers (auto-publish, WebSocket event handlers).

---

## 4. Post-Publish Cooldown Guard

### Symptom
After a successful publish, the auto-publish watcher would detect the new files (uploaded by the publish itself) and immediately trigger another publish cycle, creating an infinite re-publish loop.

### Root Cause
The file watcher detected the ZIP files and version.json changes created by the publish as "new changes" and queued another auto-publish.

### Fix
The 30-second cooldown in the `publishPlugin` IIFE (Section 3) blocks any re-invocation within the cooldown window. Combined with the `E_COOLDOWN` error code, the auto-publish handler can silently discard the blocked attempt.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-react-query-retry-fixes.md`](./01-react-query-retry-fixes.md) — Previous: query fixes
- [`03-websocket-listener-fixes.md`](./03-websocket-listener-fixes.md) — Next: WebSocket fixes
