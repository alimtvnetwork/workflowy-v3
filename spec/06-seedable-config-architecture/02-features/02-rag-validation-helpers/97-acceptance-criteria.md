# RAG Validation Helpers — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RAGVALIDATIONHELPERS-01` … `AT-RAGVALIDATIONHELPERS-16`

---

## Criteria

### Error codes & core types (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONHELPERS-01 | Validation error codes are an enum (`ValidationErrorCode`) covering MissingField, InvalidFormat, OutOfRange, ChunkTooLarge, EmbeddingDimensionMismatch, etc.; ad-hoc string codes are forbidden. | [`01-error-codes.md`](./01-error-codes.md), [`../../../15-wp-plugin-how-to/02-enums-and-coding-style/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/02-enums-and-coding-style/97-acceptance-criteria.md) |
| AT-RAGVALIDATIONHELPERS-02 | Each `ValidationErrorCode` case has a stable numeric value (NOT auto-increment) — reordering enum cases MUST NOT change the wire value. | [`01-error-codes.md`](./01-error-codes.md) |
| AT-RAGVALIDATIONHELPERS-03 | Core types (`ValidationResult`, `ValidationError`, `ValidationContext`) are `readonly`/immutable value objects; mutating a result after construction is forbidden. | [`02-core-types.md`](./02-core-types.md), [`../../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) |

### Validator interface (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONHELPERS-04 | All validators implement `Validator { validate(input, context): ValidationResult }`; bespoke per-validator method signatures are forbidden. | [`03-validator-interface.md`](./03-validator-interface.md) |
| AT-RAGVALIDATIONHELPERS-05 | Validators are **pure functions** (no I/O, no DB access, no time-dependent logic); a validator that reads from DB is forbidden — fetch first, validate second. | [`03-validator-interface.md`](./03-validator-interface.md) |

### Individual validators (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONHELPERS-06 | The §04 validator catalogue is the SSOT — adding a new validator requires updating §04 first; ad-hoc validators created in business code without §04 entry fail review. | [`04-individual-validators.md`](./04-individual-validators.md) |
| AT-RAGVALIDATIONHELPERS-07 | Each individual validator has at least one unit test per branch (happy + every documented error code); missing branches fail review. | [`04-individual-validators.md`](./04-individual-validators.md), [`08-unit-tests.md`](./08-unit-tests.md) |
| AT-RAGVALIDATIONHELPERS-08 | Numeric-range validators read bounds from the seedable-config layer (NOT hardcoded); hardcoded ranges are forbidden. | [`04-individual-validators.md`](./04-individual-validators.md), [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) |

### Validation service (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONHELPERS-09 | The validation service runs validators in a documented order and accumulates ALL errors (NOT short-circuit on first error); short-circuiting is a UX bug for forms. | [`05-validation-service.md`](./05-validation-service.md) |
| AT-RAGVALIDATIONHELPERS-10 | The service exposes a single `validate(payload, schema): ValidationResult` entry point — bespoke per-endpoint validation pipelines are forbidden. | [`05-validation-service.md`](./05-validation-service.md) |

### API integration & response formats (files 06, 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONHELPERS-11 | API endpoints invoke validation BEFORE any side effect; running validation after a partial mutation is a Code-Red data-integrity bug. | [`06-api-integration.md`](./06-api-integration.md) |
| AT-RAGVALIDATIONHELPERS-12 | Validation failures map to HTTP `422 Unprocessable Entity` + canonical envelope with field-keyed error map; using `400 Bad Request` for validation is forbidden (semantic mismatch). | [`07-response-formats.md`](./07-response-formats.md), [`../../../15-wp-plugin-how-to/05-helpers-responses-and-integration/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/05-helpers-responses-and-integration/97-acceptance-criteria.md) |
| AT-RAGVALIDATIONHELPERS-13 | The error map structure is `{ <fieldPath>: { code: ValidationErrorCode, message: string } }` — flat string-array errors lose field association and are forbidden. | [`07-response-formats.md`](./07-response-formats.md) |

### Unit tests (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONHELPERS-14 | Unit tests use the `@dataProvider` pattern (named-key arrays) covering happy path + every error code per validator; numeric-indexed providers are forbidden. | [`08-unit-tests.md`](./08-unit-tests.md), [`../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md) |
| AT-RAGVALIDATIONHELPERS-15 | Tests assert against `ValidationErrorCode` enum cases (NOT message strings); message-string assertions are brittle and fail review. | [`08-unit-tests.md`](./08-unit-tests.md) |
| AT-RAGVALIDATIONHELPERS-16 | Test coverage for the validation subsystem MUST be ≥ **95% line, 100% method**; regression below threshold fails CI. | [`08-unit-tests.md`](./08-unit-tests.md) |

---

## Verification

```bash
# Hardcoded numeric ranges in validators
rg -nP '\b(if|return)\s.*[<>]=?\s*\d{2,}\b' includes/Validators/

# Message-string assertions in tests
rg -nP "assertEquals\\(\\s*['\"][A-Z][^'\"]+['\"]" tests/Validators/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) — Seedable-config fundamentals
- [`../../../15-wp-plugin-how-to/05-helpers-responses-and-integration/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/05-helpers-responses-and-integration/97-acceptance-criteria.md) — Envelope contract
- [`../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md) — Testing standards

---

*Curated 2026-04-25 — closes A-25 (batch 14). Replaces v0.1.0 stub.*
