# VariantStructure, ErrorType Interface, Variation Methods

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Source files:** `variant_structure.go`, `error_type_interface.go`

---

## VariantStructure (display + error creation)

Rich metadata struct for each variant, matching the `evatix-go/errorwrapper` pattern:

```go
// apperrtype/variant_structure.go
package apperrtype

import (
    "errors"
    "fmt"
    "strings"
)

// VariantStructure holds the name, code, message, and variant for each error type.
type VariantStructure struct {
    Name    string     // PascalCase variant name (e.g. "SiteNotFound")
    Code    string     // String code (e.g. "E2010")
    Message string     // Human-readable default message
    Variant Variation  // The enum value itself
}

// String returns "Name (Code - N) : Message"
func (it VariantStructure) String() string {
    return it.TypeNameCodeMessage()
}

// TypeNameCodeMessage returns formatted: "Name (Code - N) : Message"
func (it VariantStructure) TypeNameCodeMessage() string {
    return fmt.Sprintf("%s (Code - %d) : %s", it.Name, it.Variant, it.Message)
}

// CodeTypeName returns "(#N - Name)"
func (it VariantStructure) CodeTypeName() string {
    return fmt.Sprintf("(#%d - %s)", it.Variant, it.Name)
}

// CodeTypeNameWithMessage returns "(#N - Name) message"
func (it VariantStructure) CodeTypeNameWithMessage(msg string) string {
    return fmt.Sprintf("(#%d - %s) %s", it.Variant, it.Name, msg)
}

// Error creates a stdlib error with additional context message.
func (it VariantStructure) Error(additionalMessage string) error {
    msg := fmt.Sprintf("[%s] %s: %s", it.Code, it.Message, additionalMessage)
    return errors.New(strings.ToLower(msg))
}

// ErrorNoRefs creates a stdlib error with no additional context.
func (it VariantStructure) ErrorNoRefs() error {
    msg := fmt.Sprintf("[%s] %s", it.Code, it.Message)
    return errors.New(strings.ToLower(msg))
}

// Panic panics with formatted message + additional context.
func (it VariantStructure) Panic(additionalMessage string) {
    panic(it.Error(additionalMessage))
}
```

---

## ErrorType Interface

```go
// apperrtype/error_type_interface.go
package apperrtype

// ErrorType is the interface all error type enums must implement.
type ErrorType interface {
    Code() string
    Message() string
    Name() string
}
```

---

## Variation Methods (implements ErrorType)

```go
// Methods on Variation — delegates to the global registry

func (v Variation) Code() string {
    if vs, ok := variantRegistry[v]; ok {
        return vs.Code
    }
    return "E0000"
}

func (v Variation) Message() string {
    if vs, ok := variantRegistry[v]; ok {
        return vs.Message
    }
    return "unknown error"
}

func (v Variation) Name() string {
    if vs, ok := variantRegistry[v]; ok {
        return vs.Name
    }
    return "Unknown"
}

func (v Variation) String() string {
    if vs, ok := variantRegistry[v]; ok {
        return vs.TypeNameCodeMessage()
    }
    return fmt.Sprintf("Unknown (Code - %d)", v)
}

func (v Variation) CodeTypeName() string {
    return fmt.Sprintf("(#%d - %s)", v, v.Name())
}

func (v Variation) CodeTypeNameWithReferences(refs ...string) string {
    return fmt.Sprintf("(#%d - %s) %s", v, v.Name(), strings.Join(refs, ", "))
}

func (v Variation) IsValid() bool {
    return v > NoError && v < MaxError
}

// Structure returns the full VariantStructure from the registry.
func (v Variation) Structure() VariantStructure {
    return variantRegistry[v]
}
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-variation-enum.md`](./01-variation-enum.md) — Variation constants these methods operate on
- [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) — `variantRegistry` map referenced by every method
