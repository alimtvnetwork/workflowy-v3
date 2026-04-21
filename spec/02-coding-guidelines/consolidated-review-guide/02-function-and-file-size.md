# 2. Function & File Size

> **Parent:** [00-overview.md](./00-overview.md)

| Metric | Limit | Hard Max |
|--------|-------|----------|
| Function body | 8–15 lines | 15 lines |
| File length | 200–300 lines | 400 lines (with `// NOTE: Needs refactor`) |
| Type/struct definition | — | 120 lines |

- If a function exceeds 15 lines → extract helpers.
- If a file exceeds 300 lines → split by concern (`*_crud`, `*_helpers`, `*_validation`).

```go
// ❌ 30-line function
func ProcessOrder(order Order) Result {
    // ... 30 lines of mixed logic
}

// ✅ Top-level orchestrator + small helpers
func ProcessOrder(order Order) Result {
    validated := validateOrder(order)
    enriched := enrichOrder(validated)

    return saveOrder(enriched)
}
```
