# Anti-Patterns Summary & Files Involved (§9)

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 9. Anti-Patterns Summary (Never Do This)

### ❌ NEVER: Use React Query defaults for retry/refetch
```typescript
// BAD — causes retry storms and background refetches
const queryClient = new QueryClient(); // uses retry:3, refetchOnWindowFocus:true
```
```typescript
// GOOD
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});
```

### ❌ NEVER: Put callbacks/labels in useEffect deps for WebSocket listeners
```typescript
// BAD — re-subscribes on every render
useEffect(() => {
  const unsub = wsClient.on("event", () => onComplete(pluginName));
  return () => unsub();
}, [onComplete, pluginName]); // ← these change every render!
```
```typescript
// GOOD — stable deps, read latest from ref
const onCompleteRef = useRef(onComplete);
onCompleteRef.current = onComplete;
useEffect(() => {
  const unsub = wsClient.on("event", () => onCompleteRef.current("..."));

  return () => unsub();
}, []); // ← stable, only subscribes once
```

### ❌ NEVER: Rely only on UI-level button disabling for mutation dedup
```typescript
// BAD — can be bypassed by programmatic callers
<Button disabled={isLoading} onClick={publish}>Publish</Button>
```
```typescript
// GOOD — dedup at the API method level
publishPlugin: (() => {
  const inFlight = new Set<string>();

  return (pluginId, siteId, opts) => {
    const key = `${pluginId}:${siteId}`;

    if (inFlight.has(key)) return Promise.resolve({ success: false, error: { code: "E_DEDUP" } });
    inFlight.add(key);

    return request(...).finally(() => inFlight.delete(key));
  };
})(),
```

### ❌ NEVER: Use raw `toast()` from sonner in WebSocket-connected components
```typescript
// BAD — duplicate toasts from WS + local state
import { toast } from "sonner";
toast.success("Done");
```
```typescript
// GOOD — automatic 3-second dedup window
import { dedupToast as toast } from "@/lib/dedupToast";
toast.success("Done");
```

### ❌ NEVER: Process WebSocket events without a completion lock
```typescript
// BAD — late events from previous sessions leak through
wsClient.on("complete", (data) => { setIsComplete(true); });
```
```typescript
// GOOD — ignore events after lifecycle is done
const completedRef = useRef(false);
wsClient.on("complete", (data) => {
  if (completedRef.current) return;
  completedRef.current = true;
  setIsComplete(true);
});
```

### ❌ NEVER: Fire polling queries for background/speculative targets without suppressGlobalError
```typescript
// BAD — error modal pops up for disconnected sites
useQuery({ queryKey: ["snapshots", 0], queryFn: () => api.getSnapshots(0) });
```
```typescript
// GOOD — silent failure for background queries
useQuery({
  queryKey: ["snapshots", 0],
  queryFn: () => api.getSnapshots(0),
  retry: false,
  meta: { suppressGlobalError: true },
});
```

---

## Files Involved

| File | What It Does |
|------|-------------|
| `src/App.tsx` | Global QueryClient config (`retry: false`, `refetchOnWindowFocus: false`) |
| `src/lib/api/methods.ts` | Publish dedup lock (IIFE with `inFlight` Set + cooldown Map) |
| `src/lib/dedupToast.ts` | Toast deduplication wrapper (3s window) |
| `src/lib/circuitBreaker.ts` | Circuit breaker pattern for failing endpoints |
| `src/components/plugins/PublishProgressDialog.tsx` | WS listener stabilization (useRef, completion lock, log dedup) |
| `src/hooks/useWsToastNotifications.ts` | Uses `dedupToast` for WS-driven notifications |
| `src/hooks/useRemoteSnapshots.ts` | Per-query retry suppression + `suppressGlobalError` |
| `src/components/settings/SnapshotSettingsTab.tsx` | Per-query retry suppression + `suppressGlobalError` |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`04-toast-and-circuit-breaker.md`](./04-toast-and-circuit-breaker.md) — Previous: toast + circuit breaker
