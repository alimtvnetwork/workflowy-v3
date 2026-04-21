# React Query Debugging

> **Parent:** [00-overview.md](./00-overview.md)

## Enable DevTools

```typescript
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Debug Query State

```typescript
// Check query state
const { data, error, status, fetchStatus, isLoading, isFetching } = useQuery({
  queryKey: ['health'],
  queryFn: fetchHealth,
});

console.log('Query state:', {
  status,        // 'pending' | 'error' | 'success'
  fetchStatus,   // 'fetching' | 'paused' | 'idle'
  isLoading,     // First load (no cached data)
  isFetching,    // Any fetch (including background refetch)
});
```

## Related

- [03-common-issues.md](./03-common-issues.md) — Cache invalidation example
- [09-performance.md](./09-performance.md) — Profiling re-renders
