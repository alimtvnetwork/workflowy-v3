# Common AI Mistakes — Naming & Style

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Naming convention violations and formatting errors

---

## Mistake #1: camelCase JSON Keys

**Frequency:** Very High  
**Rule:** AH-N3

```json
// ❌ AI GENERATES THIS
{ "userId": "abc", "createdAt": "2026-01-01" }

// ✅ CORRECT
{ "UserId": "abc", "CreatedAt": "2026-01-01" }
```

---

## Mistake #2: Uppercase Abbreviations

**Frequency:** Very High  
**Rule:** AH-N1

```go
// ❌ AI GENERATES THIS
type APIResponse struct {
    UserID   string `json:"userId"`
    BaseURL  string `json:"baseUrl"`
}

// ✅ CORRECT
type ApiResponse struct {
    UserId  string
    BaseUrl string
}
```

---

## Mistake #6: Boolean Without Prefix

**Frequency:** High  
**Rule:** AH-N6

```typescript
// ❌ AI GENERATES THIS
const active = true;
const loading = false;
const valid = checkForm();

// ✅ CORRECT
const isActive = true;
const isLoading = false;
const isValid = checkForm();
```

---

## Mistake #7: Explicit Go JSON Tags

**Frequency:** Medium-High  
**Rule:** AH-T5

```go
// ❌ AI GENERATES THIS
type Config struct {
    MaxRetries int    `json:"MaxRetries"`
    BaseUrl    string `json:"BaseUrl"`
    Timeout    int    `json:"Timeout"`
}

// ✅ CORRECT — no tags needed, PascalCase is default
type Config struct {
    MaxRetries int
    BaseUrl    string
    Timeout    int
}
```

---

## Mistake #10: Missing Blank Line Before Return

**Frequency:** Medium  
**Rule:** AH-S4

```go
// ❌ AI GENERATES THIS
func Process(data Input) Result {
    result := compute(data)
    return result
}

// ✅ CORRECT
func Process(data Input) Result {
    result := compute(data)

    return result
}
```

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-anti-hallucination-rules.md`](../01-anti-hallucination-rules.md) — Full rule catalog

---

*Naming & style mistakes v3.2.0 — 2026-04-20*
