# AppError Struct & Fields

> **Parent:** [02-apperror-struct overview](./00-overview.md)  
> **Version:** 3.0.0  
> **Updated:** 2026-04-20

---

## 2.1 Struct

```go
type AppError struct {
    Code       string
    Message    string
    Details    string            `json:",omitempty"`
    Values     map[string]string `json:",omitempty"`
    Diagnostic ErrorDiagnostic   `json:",omitempty"`
    Stack      StackTrace
    Cause      error             `json:"-"` // EXEMPTED: AppError internal cause (I-2)
}
```

**Fields:**
- `Code` — error code from constants (e.g., `ErrNotFound`, `ErrDatabaseQuery`)
- `Message` — human-readable error description
- `Details` — additional context (auto-set from cause on `Wrap`)
- `Values` — key-value map for injecting variables relevant to the error context (paths, IDs, names, etc.)
- `Diagnostic` — typed diagnostic fields for structured reporting
- `Stack` — mandatory stack trace captured at creation
- `Cause` — wrapped underlying error (implements `Unwrap()`)

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-basic-constructors.md`](./02-basic-constructors.md) — Constructors

---

*Struct & fields v3.0.0 — 2026-04-20*
