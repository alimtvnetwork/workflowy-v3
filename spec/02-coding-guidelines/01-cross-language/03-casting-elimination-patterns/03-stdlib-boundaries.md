# 3. Stdlib Boundaries — `sql.Scanner` & JSON-LD

> **Parent:** [00-overview.md](./00-overview.md)

---

## 7. `sql.Scanner` Interface

### ✅ Required — Annotated `.(type)` Switch

```go
// EXEMPTED: sql.Scanner stdlib interface — src is `any` by contract (§7.2)
func (id *ProjectId) Scan(src any) error {
    switch v := src.(type) {
    case string:
        *id = ProjectId(v)
    case []byte:
        *id = ProjectId(string(v))
    default:
        return fmt.Errorf("unsupported type for ProjectId: %T", src)
    }

    return nil
}
```

---

## 8. JSON-LD / Third-Party Schema

### ✅ Required — Annotated Dynamic Schema Parsing

```go
// EXEMPTED: external JSON-LD schema — dynamic structure from third-party HTML (§7.2)
if sameAs, ok := schema["sameAs"]; ok {
    switch v := sameAs.(type) {
    case string:
        urls = append(urls, v)
    case []interface{}:

        for _, item := range v {
            if str, ok := item.(string); ok {
                urls = append(urls, str)
            }
        }
    }
}
```
