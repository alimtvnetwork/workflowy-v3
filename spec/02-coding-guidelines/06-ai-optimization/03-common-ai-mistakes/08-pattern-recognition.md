# Common AI Mistakes — Pattern Recognition

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Recognize AI hallucination patterns before they become bugs

---

## Hallucination Signal Table

| Signal | Likely Mistake | Prevention |
|--------|---------------|------------|
| Generating Go struct with `json:` tags | Will use camelCase tags | Remove tags entirely ([`01-naming-and-style.md`](./01-naming-and-style.md#mistake-7-explicit-go-json-tags)) |
| Generating Go function signature | Will use `(T, error)` return | Use `Result[T]` ([`02-go-type-system.md`](./02-go-type-system.md#mistake-3-multi-return-go-functions)) |
| Generating error handling in Go | Will use `fmt.Errorf` | Use `apperror.Wrap` ([`02-go-type-system.md`](./02-go-type-system.md#mistake-4-fmterrorf-instead-of-apperror)) |
| Generating JSON response body | Will use camelCase keys | Use PascalCase ([`01-naming-and-style.md`](./01-naming-and-style.md#mistake-1-camelcase-json-keys)) |
| Generating boolean variable | Will omit `is`/`has` prefix | Add prefix ([`01-naming-and-style.md`](./01-naming-and-style.md#mistake-6-boolean-without-prefix)) |
| Generating nested conditions | Will create nested `if` | Flatten with early returns ([`03-control-flow.md`](./03-control-flow.md#mistake-5-nested-if-statements)) |
| Generating Go enum | Will use `string` type | Use `byte` + `iota` ([`02-go-type-system.md`](./02-go-type-system.md#mistake-13-string-based-go-enums)) |
| Generating cache `catch` block | Will cache empty array as success | Delete cache + rethrow ([`07-caching-red.md`](./07-caching-red.md#mistake-16-caching-errors-as-success)) |
| Generating `cache.set()` | Will omit TTL | Always include `{ ttl }` ([`07-caching-red.md`](./07-caching-red.md#mistake-17-cache-without-ttl)) |
| Generating `useMutation` | Will skip `invalidateQueries` | Add invalidation in `onSuccess` ([`07-caching-red.md`](./07-caching-red.md#mistake-18-missing-cache-invalidation-after-mutation)) |
| Generating `useQuery` | Will omit `staleTime` | Set explicit `staleTime` ([`07-caching-red.md`](./07-caching-red.md#mistake-20-react-query-without-explicit-staletime)) |

---

## Pre-Output Checklist

Before accepting any AI-generated code, scan for:

- [ ] No camelCase in JSON keys
- [ ] No uppercase abbreviations (API → Api, URL → Url)
- [ ] Go functions return `apperror.Result[T]` not `(T, error)`
- [ ] Errors use `apperror.Wrap` not `fmt.Errorf`
- [ ] Booleans start with `is`/`has`
- [ ] No nested `if` statements (flat guards only)
- [ ] Cache operations have TTL
- [ ] Cache catch blocks delete, don't set empty
- [ ] `useMutation` invalidates related queries
- [ ] `useQuery` has explicit `staleTime`

See [`../02-ai-quick-reference-checklist.md`](../02-ai-quick-reference-checklist.md) for the complete validation checklist.

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-ai-quick-reference-checklist.md`](../02-ai-quick-reference-checklist.md) — Pre-output validation

---

*Pattern recognition guide v3.2.0 — 2026-04-20*
