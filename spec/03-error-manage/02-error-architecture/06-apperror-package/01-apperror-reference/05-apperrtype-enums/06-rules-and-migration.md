# Rules, Migration, Registry Relationship & Adding Variants

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Rules

| Rule | Description |
|------|-------------|
| Single enum type | `type Variation uint16` — all variants in one file |
| `ErrorType` interface | Variation implements `Code()` + `Message()` + `Name()` |
| Global registry map | `variantRegistry` maps Variation → `VariantStructure{Name, Code, Message, Variant}` |
| No raw string codes | Use `apperrtype.Xxx` variants; `CODE-RED-008` lint enforces this |
| Package location | All types live in `types/apperrtype/` |
| `iota` start at 0 | `NoError = 0` (zero value), domain variants start at 1+ |
| `MaxError` sentinel | Must remain last constant for bounds checking |
| Domain comments | Each domain block is delimited with `// ── Exxxx — Domain ──` comments |

---

## Migration from v1.x (per-domain byte enums)

| v1.x (old) | v2.0 (new) |
|-------------|------------|
| `type ConfigError byte` | `Variation uint16` (all domains combined) |
| `configErrorDetails map[ConfigError]ErrorDetail` | `variantRegistry map[Variation]VariantStructure` |
| `ErrorDetail{Code, Message}` | `VariantStructure{Name, Code, Message, Variant}` |
| Per-file `Code()` + `Message()` | Centralized on `Variation` type via registry lookup |
| No display methods | `String()`, `TypeNameCodeMessage()`, `CodeTypeName()`, `Error()`, `Panic()` |

**Breaking changes:**
- Import path unchanged (`types/apperrtype`)
- Variant names unchanged (`apperrtype.SiteNotFound`, `apperrtype.DBQueryFailed`)
- `ErrorType` interface gains `Name() string` method
- `ErrorDetail` struct replaced by `VariantStructure`

---

## Relationship to the Project Error Code Registry

The ecosystem uses **two complementary error code systems**:

| System | Format | Scope | Example | Used By |
|--------|--------|-------|---------|---------|
| **apperrtype Variation** | `E{x}xxx` (string) | `apperror` package internals — domain-level Go errors | `E2010`, `E5003` | Go backend handlers via `apperror.NewType()` |
| **Project Registry** | `PREFIX-NNNN` or `PREFIX-NNN-NN` (prefixed integer) | Project-level allocation — cross-stack error tracking | `AB-9301`, `GEN-100-02` | All projects, all stacks (Go, React, PHP) |

### Key Distinctions

1. **No overlap risk** — `E{x}xxx` codes are string-typed and never collide with the numeric project registry codes
2. **Different granularity** — Variation covers low-level Go domain errors; the registry covers project-scoped allocations
3. **Complementary usage** — a Go handler returns `E2010` via `apperror.NewType(apperrtype.SiteNotFound)`; the project registry tracks broader allocation
4. **Both must be registered** — new variants go in this file AND in the [Error Code Registry](../../../../03-error-code-registry/01-registry/)

---

## Adding a New Variant

1. Add the constant to its domain block in `variation.go` (Auth / Items / Mirrors / Trash / Network / Internal — pick by the error's primary noun; before the `MaxError` sentinel)
2. Add the `VariantStructure` entry to `variantRegistry` in `variant_registry.go`
3. Register the code in the [Error Code Registry](../../../../03-error-code-registry/01-registry/)
4. Update this spec's domain block if adding a new domain range

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-variation-enum.md`](./01-variation-enum.md) — Where new variants are added
- [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) — Where new VariantStructure entries are added
