# Common AI Mistakes — Control Flow

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Control flow and conditional logic errors

---

## Mistake #5: Nested `if` Statements

**Frequency:** High  
**Rule:** AH-S1

```go
// ❌ AI GENERATES THIS
if request != nil {
    if request.IsValid() {
        process(request)
    }
}

// ✅ CORRECT — flat guards with early returns
if request == nil {
    return
}

if request.IsInvalid() {
    return
}

process(request)
```

---

## Mistake #9: Raw Negation on Function Calls

**Frequency:** Medium  
**Rule:** AH-B1

```php
// ❌ AI GENERATES THIS
if (!$order->isValid()) {
    return;
}

// ✅ CORRECT — use positive semantic inverse
if ($order->isInvalid()) {
    return;
}
```

Also applies to Go:

```go
// ❌ AI GENERATES THIS
if !user.IsActive() { ... }

// ✅ CORRECT
if user.IsInactive() { ... }
```

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../consolidated-review-guide/05-boolean-and-conditionals.md`](../../consolidated-review-guide/05-boolean-and-conditionals.md) — Guard clause patterns

---

*Control flow mistakes v3.2.0 — 2026-04-20*
