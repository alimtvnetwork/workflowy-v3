# React Query Retry Fixes (§1–2)

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 1. QueryClient Automatic Retry Loop

### Symptom
Failed API requests were automatically retried 3 times (React Query default), causing:
- Triple error toasts for a single failure
- Unnecessary load on backend during outages
- Confusing UX where errors appeared multiple times

### Root Cause
React Query's `QueryClient` defaults to `retry: 3` and `refetchOnWindowFocus: true`. When the backend was down or returned errors, every query would silently retry 3 times, and every time the user tabbed back to the app, all stale queries would refetch.

### Fix — `src/App.tsx`
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,              // ← CRITICAL: No automatic retries
      refetchOnWindowFocus: false, // ← CRITICAL: No background refetches
    },
  },
});
```

### Key Principle
**Data should only refresh through explicit user actions** (button clicks, manual refresh, navigation). Never rely on React Query's automatic retry/refetch — it creates invisible network storms and duplicate errors.

---

## 2. Window Focus Refetch Storm

### Symptom
Every time the user switched tabs and returned, ALL queries would refetch simultaneously, causing:
- Sudden burst of 10-20+ API requests
- Stale error modals reappearing
- Backend rate limiting

### Root Cause
`refetchOnWindowFocus: true` (React Query default) triggers a refetch for every mounted query when `document.visibilitychange` fires.

### Fix
Set `refetchOnWindowFocus: false` globally (see Section 1) and also per-query for sensitive hooks:

```typescript
// src/hooks/useRemoteSnapshots.ts
{
  retry: false,
  refetchOnWindowFocus: false,
  meta: { suppressGlobalError: true },
}
```

### Key Principle
Pair `refetchOnWindowFocus: false` with `suppressGlobalError: true` in query meta for background/polling queries that should never trigger the global error modal.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-publish-dedup-and-cooldown.md`](./02-publish-dedup-and-cooldown.md) — Next: publish dedup
