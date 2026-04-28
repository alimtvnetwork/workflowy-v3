# Go Enum Required Methods — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-REQUIREDMETHODS-01` … `AT-REQUIREDMETHODS-14`

> Defines the method contract every Go enum (`Variant`-style typed `uint8`/`uint16`) MUST implement.

---

## Criteria

### Mandatory methods (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REQUIREDMETHODS-01 | Every Go enum implements **exactly 11 mandatory methods**: `String() string`, `Label() string`, `Is{Value}() bool` (one per variant), `All() []Variant`, `ByIndex(int) (Variant, error)`, `Parse(string) (Variant, error)`, `IsValid() bool`, `IsOther() bool`, `IsAnyOf(...Variant) bool`, `MarshalJSON() ([]byte, error)`, `UnmarshalJSON([]byte) error`. | [`01-mandatory-methods.md`](./01-mandatory-methods.md) |
| AT-REQUIREDMETHODS-02 | `String()` returns the canonical PascalCase serialization label and is the SSOT — `Label()` delegates to `String()` (no divergence allowed). | [`01-mandatory-methods.md`](./01-mandatory-methods.md) |
| AT-REQUIREDMETHODS-03 | `Is{Value}()` is generated for every variant (e.g., `IsAdmin()`, `IsUser()`); a missing `Is*` per-variant check fails review. | [`01-mandatory-methods.md`](./01-mandatory-methods.md) |
| AT-REQUIREDMETHODS-04 | `Parse(s)` returns a typed `apperror` (NOT raw `errors.New`/`fmt.Errorf`) on unknown input; the error MUST identify the offending input AND the enum type. | [`01-mandatory-methods.md`](./01-mandatory-methods.md), [`../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md`](../../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md) |
| AT-REQUIREDMETHODS-05 | `IsValid()` returns `true` only for variants in `All()`; `IsValid()` on the zero value (uninitialized) returns `false` unless the zero value is an explicit valid variant documented in the enum file. | [`01-mandatory-methods.md`](./01-mandatory-methods.md) |
| AT-REQUIREDMETHODS-06 | `MarshalJSON` serializes by `String()` value (NOT by numeric variant); `UnmarshalJSON` accepts the same string and round-trips losslessly. | [`01-mandatory-methods.md`](./01-mandatory-methods.md) |
| AT-REQUIREDMETHODS-07 | `IsAnyOf(variants ...Variant) bool` short-circuits on first match; passing zero arguments returns `false` (NOT `true` — empty-set semantics are inverted from `all`). | [`01-mandatory-methods.md`](./01-mandatory-methods.md) |

### Optional & domain-specific methods (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REQUIREDMETHODS-08 | `Values() []string` is the recommended optional method that returns `String()` for every variant in `All()`; if implemented, it MUST stay in sync with `All()`. | [`02-optional-and-domain-methods.md`](./02-optional-and-domain-methods.md) |
| AT-REQUIREDMETHODS-09 | Domain-specific methods (e.g., `SiteOperator()`, `BaseUrl()`, `RequiresApiKey()`, `MaxConcurrent()`) are added in a sibling file (NOT inlined into `variant.go`); business logic that needs the data calls the method, NOT a switch-on-variant in the caller. | [`02-optional-and-domain-methods.md`](./02-optional-and-domain-methods.md) |

### Complete reference (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REQUIREDMETHODS-10 | The `provider.Variant` example in §03 is a runnable reference and exercises ALL 11 mandatory methods plus at least one optional/domain method; a doc-test verifies the snippets compile. | [`03-complete-example.md`](./03-complete-example.md) |

### PascalCase labels (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REQUIREDMETHODS-11 | `variantLabels` map keys use **PascalCase** (e.g., `Admin`, `User`, `SuperAdmin`); kebab-case, snake_case, or lowercase labels are forbidden. | [`04-pascalcase-labels.md`](./04-pascalcase-labels.md) |
| AT-REQUIREDMETHODS-12 | The only documented exception is **protocol-driven labels** (e.g., HTTP method `"GET"`, content type `"application/json"`); each exception MUST be commented inline with a link to the protocol spec. | [`04-pascalcase-labels.md`](./04-pascalcase-labels.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REQUIREDMETHODS-13 | Enums live in `internal/enums/<domain>/` (one folder per enum) with files: `variant.go` (type + variants), `methods.go` (mandatory methods), `domain.go` (optional/domain methods), `variant_test.go`. | [`../00-overview.md`](../00-overview.md), [`../../../01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../../01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) |
| AT-REQUIREDMETHODS-14 | Every enum is registered in `spec/20-enums-index.md`; an enum present in code but missing from the index fails the spec-hygiene cross-ref check. | [`spec/20-enums-index.md`](../../../../20-enums-index.md) |

---

## Verification

```bash
# Enums MUST live under internal/enums/
rg -l 'type \w+ uint(8|16)$' --type go server/ | grep -v 'internal/enums/'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../00-overview.md`](../00-overview.md) — Enum spec parent
- [`../../04-golang-standards-reference/97-acceptance-criteria.md`](../../04-golang-standards-reference/97-acceptance-criteria.md) — Go standards
- [`../../../01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../../01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) — Types folder
- [`spec/20-enums-index.md`](../../../../20-enums-index.md) — Enum registry

---

*Curated 2026-04-25 — closes A-21 (batch 10). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../../97a-acceptance-criteria-fixtures.md`](../../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
