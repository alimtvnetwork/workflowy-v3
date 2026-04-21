# Complete Example

> **Parent:** [`00-overview.md`](./00-overview.md)

A full reference implementation of an enum that satisfies every mandatory method.

```go
package provider

import (
    "encoding/json"
    "fmt"
    "strings"
)

type Variant byte

const (
    Invalid Variant = iota
    SerpApi
    MapsScraper
    Colly
)

var variantLabels = [...]string{
    Invalid:     "Invalid",
    SerpApi:     "SerpApi",
    MapsScraper: "MapsScraper",
    Colly:       "Colly",
}

func (v Variant) String() string {
    if !v.IsValid() {
        return variantLabels[Invalid]
    }

    return variantLabels[v]
}

func (v Variant) Label() string {
    return v.String()
}

func (v Variant) IsValid() bool {
    return v > Invalid && v < Variant(len(variantLabels))
}

func (v Variant) IsSerpApi() bool     { return v == SerpApi }
func (v Variant) IsMapsScraper() bool { return v == MapsScraper }
func (v Variant) IsColly() bool       { return v == Colly }
func (v Variant) IsInvalid() bool     { return v == Invalid }

func (v Variant) IsOther(other Variant) bool { return v != other }

func (v Variant) IsAnyOf(others ...Variant) bool {
    for _, o := range others {
        if v == o {
            return true
        }
    }

    return false
}

func All() []Variant {
    return []Variant{SerpApi, MapsScraper, Colly}
}

func ByIndex(i int) Variant {
    if i < 0 || i >= len(variantLabels) {
        return Invalid
    }

    return Variant(i)
}

func Parse(s string) apperror.Result[Variant] {
    trimmed := strings.TrimSpace(s)

    for i, str := range variantLabels {
        if strings.EqualFold(str, trimmed) {
            return Variant(i), nil
        }
    }

    return Invalid, fmt.Errorf("invalid provider: %q", s)
}

func Values() []string {
    result := make([]string, 0, len(variantLabels)-1)

    for _, s := range variantLabels[1:] {
        result = append(result, s)
    }

    return result
}

func (v Variant) MarshalJSON() ([]byte, error) {
    return json.Marshal(v.String())
}

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
- [`01-mandatory-methods.md`](./01-mandatory-methods.md) — Per-method explanations
- [`04-pascalcase-labels.md`](./04-pascalcase-labels.md) — Label naming rules used in `variantLabels`
