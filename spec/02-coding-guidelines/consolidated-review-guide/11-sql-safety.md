# 11. SQL Safety

> **Parent:** [00-overview.md](./00-overview.md)

- **All queries with user input → parameterized** (no string concatenation).
- **Joins → use database views.** Name views with `Vw` prefix: `VwUserOrders`.
- **All SQL must be tested** — unit tests for queries, integration tests for views.
- **SQL injection validation** on every input boundary.

```go
// ❌ SQL injection risk
query := "SELECT * FROM User WHERE Email = '" + email + "'"

// ✅ Parameterized
query := "SELECT * FROM User WHERE Email = ?"
db.Query(query, email)
```
