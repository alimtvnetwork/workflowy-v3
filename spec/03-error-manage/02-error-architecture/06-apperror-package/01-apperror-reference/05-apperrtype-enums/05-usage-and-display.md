# Usage Examples & Display Methods

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Constructor Integration

The `apperror` constructors accept `Variation` values directly through the `ErrorType` interface:

```go
// apperror/constructors.go — NewType uses the enum's built-in code + message
func NewType(errType apperrtype.ErrorType) *AppError {
    return New(errType.Code(), errType.Message())
}
```

---

## Usage Examples

```go
// ❌ Level 1 — raw strings (flagged by CODE-RED-008 lint rule)
apperror.New("E2010", "site not found")

// ✅ Level 2 — enum code, manual message
apperror.New(apperrtype.SiteNotFound.Code(), "site not found")

// ✅✅ Level 3 — enum with built-in message (best)
apperror.NewType(apperrtype.SiteNotFound)

// ✅ WrapType — wrap a raw error with enum code + message
apperror.WrapType(err, apperrtype.WPConnectionFailed).
    WithValue("url", siteURL).
    WithStatusCode(resp.StatusCode)
```

---

## Display Method Examples

```go
// String() output:
// "SiteNotFound (Code - 15) : site not found"
fmt.Println(apperrtype.SiteNotFound.String())

// CodeTypeName() output:
// "(#15 - SiteNotFound)"
fmt.Println(apperrtype.SiteNotFound.CodeTypeName())

// Structure() access:
vs := apperrtype.SiteNotFound.Structure()
fmt.Println(vs.Code)    // "E2010"
fmt.Println(vs.Name)    // "SiteNotFound"
fmt.Println(vs.Message) // "site not found"

// Direct error creation from VariantStructure:
err := apperrtype.SiteNotFound.Structure().Error("domain example.com")
// → "[e2010] site not found: domain example.com"
```

---

## With Convenience Constructors (Type Aliases)

```go
return apperror.FailBool(apperror.NewType(apperrtype.SiteNotFound))
return apperror.FailSettings(apperror.NewType(apperrtype.ConfigKeyMissing))
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-variant-structure.md`](./02-variant-structure.md) — Methods used in display examples
- [`06-rules-and-migration.md`](./06-rules-and-migration.md) — Rules these examples enforce
