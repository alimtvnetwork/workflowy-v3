# Reverse-Lookup Maps

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Source files:** `string_to_variant_map.go`, `code_to_variant_map.go`

---

## StringToVariantMap (reverse-lookup)

Auto-generated reverse map from variant name strings to `Variation` values — enables deserialization, CLI input parsing, and config-driven error selection:

```go
// apperrtype/string_to_variant_map.go
package apperrtype

// StringToVariantMap maps PascalCase variant names to their Variation enum values.
// Built once at init from variantRegistry — never modified at runtime.
var StringToVariantMap map[string]Variation

func init() {
    StringToVariantMap = make(map[string]Variation, len(variantRegistry))
    for v, vs := range variantRegistry {
        StringToVariantMap[vs.Name] = v
    }
}

// VariationFromName looks up a Variation by its PascalCase name.
// Returns (variation, true) if found, (NoError, false) otherwise.
func VariationFromName(name string) (Variation, bool) {
    v, ok := StringToVariantMap[name]
    return v, ok
}

// MustVariationFromName looks up a Variation by name, panics if not found.
// Use only during initialization / config parsing.
func MustVariationFromName(name string) Variation {
    v, ok := StringToVariantMap[name]
    if !ok {
        panic(fmt.Sprintf("apperrtype: unknown variant name %q", name))
    }
    return v
}
```

**Usage examples:**

```go
// Reverse-lookup from string name
v, ok := apperrtype.VariationFromName("SiteNotFound")
// v → apperrtype.SiteNotFound, ok → true

// Config-driven error type selection
errTypeName := cfg.Get("default_error_type") // "DBConnectionFailed"
v, ok := apperrtype.VariationFromName(errTypeName)
if !ok {
    log.Fatalf("unknown error type in config: %s", errTypeName)
}

// Deserialization from JSON/API payload
v := apperrtype.MustVariationFromName(payload.ErrorType) // panics if invalid

// Iterate all known variant names
for name, variation := range apperrtype.StringToVariantMap {
    fmt.Printf("%s → %d\n", name, variation)
}
```

---

## CodeToVariantMap (code-based reverse-lookup)

Auto-generated reverse map from string error codes to `Variation` values — enables lookup from API responses, log entries, and error code references:

```go
// apperrtype/code_to_variant_map.go
package apperrtype

// CodeToVariantMap maps string error codes (e.g. "E2010") to their Variation enum values.
// Built once at init from variantRegistry — never modified at runtime.
var CodeToVariantMap map[string]Variation

func init() {
    CodeToVariantMap = make(map[string]Variation, len(variantRegistry))
    for v, vs := range variantRegistry {
        CodeToVariantMap[vs.Code] = v
    }
}

// VariationFromCode looks up a Variation by its string error code.
// Returns (variation, true) if found, (NoError, false) otherwise.
func VariationFromCode(code string) (Variation, bool) {
    v, ok := CodeToVariantMap[code]
    return v, ok
}

// MustVariationFromCode looks up a Variation by code, panics if not found.
// Use only during initialization / config parsing.
func MustVariationFromCode(code string) Variation {
    v, ok := CodeToVariantMap[code]
    if !ok {
        panic(fmt.Sprintf("apperrtype: unknown variant code %q", code))
    }
    return v
}
```

**Usage examples:**

```go
// Reverse-lookup from error code string
v, ok := apperrtype.VariationFromCode("E2010")
// v → apperrtype.SiteNotFound, ok → true

// Parse error code from API response or log line
v, ok := apperrtype.VariationFromCode(apiResp.ErrorCode)
if ok {
    fmt.Println(v.Name(), v.Message())
}

// Strict lookup during initialization
v := apperrtype.MustVariationFromCode("E3001") // panics if unknown
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) — Source registry these maps mirror
- [`05-usage-and-display.md`](./05-usage-and-display.md) — Higher-level usage patterns
