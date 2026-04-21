# Common AI Mistakes — Parameters & Signatures

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Function parameter and signature errors

---

## Mistake #15: Functions with 4+ Parameters

**Frequency:** Low  
**Rule:** AH-S3

```typescript
// ❌ AI GENERATES THIS
function createUser(name: string, email: string, role: string, department: string): User { ... }

// ✅ CORRECT — use params object
interface CreateUserParams {
    name: string;
    email: string;
    role: string;
    department: string;
}

function createUser(params: CreateUserParams): User { ... }
```

Also applies to Go:

```go
// ❌ AI GENERATES THIS
func CreateUser(name, email, role, department string) (User, error) { ... }

// ✅ CORRECT
type CreateUserParams struct {
    Name       string
    Email      string
    Role       string
    Department string
}

func CreateUser(params CreateUserParams) apperror.Result[User] { ... }
```

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../consolidated-review-guide/03-parameters-and-returns.md`](../../consolidated-review-guide/03-parameters-and-returns.md) — Parameter guidelines

---

*Parameter mistakes v3.2.0 — 2026-04-20*
