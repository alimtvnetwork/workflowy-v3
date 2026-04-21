# 9. Parallel Execution

> **Parent:** [00-overview.md](./00-overview.md)

- If tasks have **no dependency**, run them in **parallel**.
- Wait for all to complete before proceeding.

```typescript
// ❌ Sequential — wastes time
const users = await fetchUsers();
const orders = await fetchOrders();
const settings = await fetchSettings();

// ✅ Parallel — no dependency between calls
const [users, orders, settings] = await Promise.all([
    fetchUsers(),
    fetchOrders(),
    fetchSettings(),
]);
```

```go
// ✅ Go parallel with goroutines + errgroup
g, ctx := errgroup.WithContext(ctx)

var users []User
var orders []Order

g.Go(func() error { users, err = fetchUsers(ctx); return err })
g.Go(func() error { orders, err = fetchOrders(ctx); return err })

if err := g.Wait(); err != nil {
    return apperror.Wrap(err, "parallel fetch failed")
}
```
