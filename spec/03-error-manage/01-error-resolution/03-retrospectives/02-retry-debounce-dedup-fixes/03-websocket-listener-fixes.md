# WebSocket Listener Fixes (§5)

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 5. WebSocket Event Listener Duplication (PublishProgressDialog)

### Symptom
The PublishProgressDialog showed:
- Duplicate or triple log entries for the same publish step
- Progress bar jumping erratically (e.g., 30% → 60% → 30% → 90%)
- Late-arriving "complete" events from previous publishes resetting the UI

### Root Cause
The `useEffect` that subscribed to WebSocket events had **unstable dependencies** (callbacks, computed labels) that changed on every render, causing:
1. Effect re-runs → re-subscriptions → multiple active listeners for the same event
2. No deduplication of log entries
3. No completion lock — late events from finished publishes were still processed

### Fix — `src/components/plugins/PublishProgressDialog.tsx`

**Pattern 1: Stabilize dependencies with `useRef`**
```typescript
// Move unstable deps into refs — they update every render but don't trigger effect re-runs
const onCompleteRef = useRef(onComplete);
onCompleteRef.current = onComplete;
const pluginNameRef = useRef(pluginName);
pluginNameRef.current = pluginName;
const siteNameRef = useRef(siteName);
siteNameRef.current = siteName;
```

**Pattern 2: Completion lock**
```typescript
const publishCompletedRef = useRef(false);

// In PUBLISH_COMPLETE handler:
if (!publishCompletedRef.current) {
  publishCompletedRef.current = true; // PERMANENTLY lock
  // ... process completion
}

// In all other event handlers, gate on the lock:
if (payload.pluginId === pluginId && !publishCompletedRef.current) { ... }
```

**Pattern 3: Log deduplication**
```typescript
const seenLogKeysRef = useRef(new Set<string>());

const addLog = useCallback((log: PublishLogEntry) => {
  const key = `${log.timestamp}|${log.step}|${log.message}`;

  if (seenLogKeysRef.current.has(key)) return; // Skip duplicates
  seenLogKeysRef.current.add(key);
  setLogs(prev => [...prev, { ...log }]);
}, []);
```

**Pattern 4: Force-unsubscribe on close + cleanup**
```typescript
const unsubsRef = useRef<Array<() => void>>([]);

const forceUnsubAll = useCallback(() => {
  unsubsRef.current.forEach(fn => fn());
  unsubsRef.current = [];
}, []);

// In effect: store unsub handles
const unsub1 = wsClient.on(WS_EVENTS.PUBLISH_STARTED, handler);
unsubsRef.current.push(unsub1);

// On dialog close:
forceUnsubAll();
```

**Pattern 5: Reset all state on dialog open**
```typescript
useEffect(() => {
  if (open) {
    publishCompletedRef.current = false;
    seenLogKeysRef.current.clear();
    setLogs([]);
    // ... reset all other state
  } else {
    forceUnsubAll(); // Clean up when dialog closes
  }

}, [open, pluginId, siteId]);
```

### Key Principles
1. **Never put callbacks or computed strings in `useEffect` dependency arrays** — use `useRef` to read their latest value inside the effect
2. **WebSocket listeners must have a completion lock** — once a lifecycle event (publish, restore, backup) is "done," ignore all subsequent events for that session
3. **Deduplicate event-driven state updates** — WebSocket events can arrive out-of-order or multiple times; always deduplicate by a composite key
4. **Force-unsubscribe on unmount AND on lifecycle completion** — don't rely on cleanup alone

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-publish-dedup-and-cooldown.md`](./02-publish-dedup-and-cooldown.md) — Previous: publish dedup
- [`04-toast-and-circuit-breaker.md`](./04-toast-and-circuit-breaker.md) — Next: toast + circuit breaker
