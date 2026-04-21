# Common AI Mistakes — Go Type System

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Type system violations in Go code

---

## Mistake #3: Multi-Return Go Functions

**Frequency:** High  
**Rule:** AH-T3

```go
// ❌ AI GENERATES THIS
func GetUser(id string) (*User, error) {
    // ...
    return user, nil
}

// ✅ CORRECT
func GetUser(id string) apperror.Result[User] {
    // ...
    return apperror.Ok(user)
}
```

---

## Mistake #4: `fmt.Errorf` Instead of `apperror`

**Frequency:** High  
**Rule:** AH-T2

```go
// ❌ AI GENERATES THIS
return fmt.Errorf("failed to process: %w", err)

// ✅ CORRECT
return apperror.Wrap(err, apperror.ErrProcessFailed, "failed to process")
```

---

## Mistake #8: Using `any` / `interface{}`

**Frequency:** Medium  
**Rule:** AH-T1

```go
// ❌ AI GENERATES THIS
func ProcessData(data map[string]any) any {
    return data["result"]
}

// ✅ CORRECT
func ProcessData(data ProcessInput) apperror.Result[ProcessOutput] {
    return apperror.Ok(ProcessOutput{Result: data.Result})
}
```

---

## Mistake #13: String-Based Go Enums

**Frequency:** Low-Medium  
**Rule:** AH-EN1

```go
// ❌ AI GENERATES THIS
type Provider string

const (
    SerpApi Provider = "serpapi"
    Colly   Provider = "colly"
)

// ✅ CORRECT
type Variant byte

const (
    Invalid Variant = iota
    SerpApi
    Colly
)
```

---

## Mistake #14: Value Access Without Error Guard

**Frequency:** Low-Medium  
**Rule:** AH-E1

```go
// ❌ AI GENERATES THIS
result := svc.GetUser(ctx, id)
user := result.Value()  // may be zero if error!

// ✅ CORRECT
result := svc.GetUser(ctx, id)
if result.HasError() {
    return result
}

user := result.Value()
```

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../../03-error-manage/02-error-architecture/06-apperror-package/00-overview.md`](../../../03-error-manage/02-error-architecture/06-apperror-package/00-overview.md) — Error handling
- [`../../03-golang/01-enum-specification/00-overview.md`](../../03-golang/01-enum-specification/00-overview.md) — Enum patterns

---

*Go type system mistakes v3.2.0 — 2026-04-20*
