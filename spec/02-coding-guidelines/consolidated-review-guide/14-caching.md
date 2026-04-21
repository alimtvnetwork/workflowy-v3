# 14. Caching

> **Parent:** [00-overview.md](./00-overview.md)

## When to Cache

- **Repeated reads** of the same data within a request or short time window.
- **Expensive computations** (aggregations, transformations) that produce the same result for the same input.
- **External API responses** where the source is rate-limited or slow.

## Code-Red Rules

1. **Never cache errors as success.** If a fetch fails, do not store a stale/empty value — either skip caching or cache a typed error state.
2. **Always set a TTL.** Unbounded caches grow indefinitely and serve stale data. Define explicit expiration.
3. **Invalidate on mutation.** After any write (create/update/delete), invalidate or update the relevant cache entries immediately.
4. **Cache key must be deterministic.** Build keys from stable inputs only — never from timestamps, random values, or user-session state (unless session-scoped cache is intended).
5. **Use typed cache entries.** Never `cache.set(key, any)` — use a typed wrapper so consumers know the shape.

## Patterns

```typescript
// ❌ CODE RED — Caching an error as empty data (silent failure)
try {
    const data = await fetchUsers();
    cache.set("users", data);
} catch {
    cache.set("users", []); // Consumers think there are zero users
}

// ✅ REQUIRED — Skip cache on error, let consumers see the failure
try {
    const data = await fetchUsers();
    cache.set("users", data, { ttl: 300_000 }); // 5 min TTL
} catch (error) {
    cache.delete("users"); // Invalidate stale entry
    logger.error("fetchUsers failed — cache invalidated", { error });

    throw error;
}
```

```go
// ❌ CODE RED — Ignoring error, returning stale cache
result := s.repo.GetById(ctx, id)
if result.HasError() {
    return cachedValue // Silently serving stale data without logging
}

// ✅ REQUIRED — Log staleness, return error to caller
result := s.repo.GetById(ctx, id)
if result.HasError() {
    s.cache.Invalidate(id)
    logger.Warn("cache invalidated due to fetch error", "id", id)

    return apperror.Fail[Plugin](result.AppError())
}

s.cache.Set(id, result.Value(), 5*time.Minute)
```

## React Query as Cache

When using React Query (TanStack Query), the query cache **is** the cache layer:

- Set `staleTime` explicitly — never rely on the default (`0`).
- Set `gcTime` (garbage collection) to control memory.
- Use `queryClient.invalidateQueries()` after mutations.
- Use `placeholderData` for optimistic UI — never cache `undefined` as a real value.

```typescript
// ✅ Explicit cache configuration
useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
});
```
