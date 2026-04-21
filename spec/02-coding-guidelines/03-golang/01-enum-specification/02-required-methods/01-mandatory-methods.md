# Mandatory Methods

> **Parent:** [`00-overview.md`](./00-overview.md)

Every enum MUST implement these methods.

---

### 1. String() string

Returns the string representation for serialization and logging.

```go
func (v Variant) String() string {
    if !v.IsValid() {
        return variantLabels[Invalid]
    }

    return variantLabels[v]
}
```

---

### 2. Label() string

Delegates to `String()`. Single lookup table — no separate labels array.

```go
func (v Variant) Label() string {
    return v.String()
}
```

---

### 3. Is{Value}() bool

One method per variant for type checking. Enables clean conditional logic.

```go
func (v Variant) IsSerpApi() bool {
    return v == SerpApi
}

func (v Variant) IsMapsScraper() bool {
    return v == MapsScraper
}

func (v Variant) IsColly() bool {
    return v == Colly
}

func (v Variant) IsInvalid() bool {
    return v == Invalid
}
```

**Usage:**
```go
// ✅ Clean
if provider.IsSerpApi() {
    // ...
}

// ❌ Verbose
if provider == provider.SerpApi {
    // ...
}
```

---

### 4. All() []Variant

Returns all valid variants (excludes Invalid).

```go
func All() []Variant {
    return []Variant{
        SerpApi,
        MapsScraper,
        Colly,
    }
}
```

**Usage:**
```go

for _, p := range provider.All() {
    fmt.Println(p.Label())
}
```

---

### 5. ByIndex(i int) Variant

Returns variant by index. Returns Invalid for invalid indices.

```go
func ByIndex(i int) Variant {
    if i < 0 || i >= len(variantLabels) {
        return Invalid
    }

    return Variant(i)
}
```

**Usage:**
```go
p := provider.ByIndex(1) // Returns SerpApi
```

---

### 6. Parse(s string) apperror.Result[Variant]

Parses a string to variant. Case-insensitive.

```go
func Parse(s string) apperror.Result[Variant] {
    trimmed := strings.TrimSpace(s)

    for i, str := range variantLabels {
        if strings.EqualFold(str, trimmed) {
            return Variant(i), nil
        }
    }

    return Invalid, fmt.Errorf("invalid provider: %q", s)
}
```

**Usage:**
```go
p, err := provider.Parse("SerpApi")

if err != nil {
    return err
}
```

---

### 7. IsValid() bool

Checks if the variant is a valid, non-Invalid value.

```go
func (v Variant) IsValid() bool {
    return v > Invalid && v < Variant(len(variantLabels))
}
```

**Usage:**
```go

if !p.IsValid() {
    return errors.New("invalid provider")
}
```

---

### 8. IsOther(other Variant) bool

Returns true if the receiver is NOT the given variant. The inverse of `Is{Value}()` but generic — works against any variant without needing a dedicated method.

```go
func (v Variant) IsOther(other Variant) bool {
    return v != other
}
```

**Usage:**
```go
// ✅ Positive boolean logic — no negation
if level.IsOther(loglevel.Debug) {
    // skip debug-only logic
}
```

---

### 9. IsAnyOf(others ...Variant) bool

Returns true if the receiver matches ANY of the given variants. Eliminates multi-condition OR chains.

```go
func (v Variant) IsAnyOf(others ...Variant) bool {
    for _, o := range others {
        if v == o {
            return true
        }
    }

    return false
}
```

**Usage:**
```go
// ✅ Clean multi-match
if action.IsAnyOf(action.Upload, action.UploadActive, action.FileReplace) {
    // handle upload-related actions
}

// ❌ Verbose
if action == action.Upload || action == action.UploadActive || action == action.FileReplace {
    // ...
}
```

---

### 10. MarshalJSON() ([]byte, error)

**Mandatory.** Serializes the enum as its string representation for JSON output.

```go
func (v Variant) MarshalJSON() ([]byte, error) {
    return json.Marshal(v.String())
}
```

---

### 11. UnmarshalJSON(data []byte) error

**Mandatory.** Deserializes from a JSON string back to the byte-based enum.

```go
func (v *Variant) UnmarshalJSON(data []byte) error {
    var s string

    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }

    parsed, err := Parse(s)

    if err != nil {
        return err
    }

    *v = parsed

    return nil
}
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-optional-and-domain-methods.md`](./02-optional-and-domain-methods.md) — Optional + domain methods
- [`03-complete-example.md`](./03-complete-example.md) — Full implementation
