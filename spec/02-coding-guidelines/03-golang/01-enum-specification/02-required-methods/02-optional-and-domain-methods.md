# Optional & Domain-Specific Methods

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Optional Methods

These methods are recommended for specific use cases.

### Values() []string

Returns all string values for documentation or CLI help:

```go
func Values() []string {
    result := make([]string, 0, len(variantLabels)-1)

    for _, s := range variantLabels[1:] { // Skip Invalid
        result = append(result, s)
    }

    return result
}
```

---

## Domain-Specific Methods

Enums MAY include domain-specific methods.

### Platform Enum Example

```go
// SiteOperator returns the Google site: operator
func (v Variant) SiteOperator() string {
    switch v {
    case YouTube:
        return "site:youtube.com"
    case Reddit:
        return "site:reddit.com"
    case LinkedIn:
        return "site:linkedin.com"
    default:
        return ""
    }
}

// BaseUrl returns the platform's base URL
func (v Variant) BaseUrl() string {
    switch v {
    case YouTube:
        return "https://youtube.com"
    case Reddit:
        return "https://reddit.com"
    default:
        return ""
    }
}
```

### Provider Enum Example

```go
// RequiresApiKey returns true if the provider needs an API key
func (v Variant) RequiresApiKey() bool {
    switch v {
    case SerpApi:
        return true
    case MapsScraper, Colly:
        return false
    default:
        return false
    }
}

// MaxConcurrent returns the max concurrent requests
func (v Variant) MaxConcurrent() int {
    switch v {
    case SerpApi:
        return 5  // Rate limited
    case MapsScraper:
        return 10
    case Colly:
        return 50
    default:
        return 1
    }
}
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-mandatory-methods.md`](./01-mandatory-methods.md) — Mandatory methods
- [`03-complete-example.md`](./03-complete-example.md) — Full implementation
