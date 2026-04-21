# Common AI Mistakes — Caching (CODE RED)

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Caching mistakes that cause production failures

---

## Mistake #16: Caching Errors as Success

**Frequency:** High  
**Rule:** AH-CA1 — **CODE RED**

```typescript
// ❌ AI GENERATES THIS — silent failure cached as success!
try {
    const data = await fetchUsers();
    cache.set("users", data);
} catch {
    cache.set("users", []); // CRITICAL BUG
}

// ✅ CORRECT — invalidate and rethrow
try {
    const data = await fetchUsers();
    cache.set("users", data, { ttl: 300_000 });
} catch (error) {
    cache.delete("users");
    logger.error("fetchUsers failed", { error });
    throw error;
}
```

---

## Mistake #17: Cache Without TTL

**Frequency:** High  
**Rule:** AH-CA2

```typescript
// ❌ AI GENERATES THIS — unbounded cache growth
Cache.set("config", configData);

// ✅ CORRECT — always specify TTL
cache.set("config", configData, { ttl: 300_000 });
```

---

## Mistake #18: Missing Cache Invalidation After Mutation

**Frequency:** High  
**Rule:** AH-CA3

```typescript
// ❌ AI GENERATES THIS
const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
        toast.success("User updated");
    },
});

// ✅ CORRECT — invalidate related queries
const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User updated");
    },
});
```

---

## Mistake #19: Non-Deterministic Cache Keys

**Frequency:** Medium  
**Rule:** AH-CA4

```typescript
// ❌ AI GENERATES THIS — new key on every call!
cache.set(`users-${Date.now()}`, data);

// ✅ CORRECT — deterministic keys from parameters
cache.set(`users-${userId}-${role}`, data);
```

---

## Mistake #20: React Query Without Explicit staleTime

**Frequency:** High  
**Rule:** AH-CA6

```typescript
// ❌ AI GENERATES THIS — default staleTime: 0 causes refetch on every mount
const { data } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
});

// ✅ CORRECT — explicit staleTime prevents over-fetching
const { data } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
});
```

---

## CODE RED Severity

Caching mistakes (#16–#20) are marked **CODE RED** because they:
1. Cause silent data corruption in production
2. Are hard to detect in testing (often require load/chaos tests)
3. Compound over time (stale data accumulates)

Always verify cache behavior in code review with extra scrutiny.

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../consolidated-review-guide/14-caching.md`](../../consolidated-review-guide/14-caching.md) — Caching standards

---

*Caching mistakes v3.2.0 — 2026-04-20*
