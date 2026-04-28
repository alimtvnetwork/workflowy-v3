# AppError Struct & Methods — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 12 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-APPERRORSTRUCT-01` … `AT-APPERRORSTRUCT-12`

---

## Criteria

### Struct & fields (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORSTRUCT-01 | `AppError` is declared as a single concrete struct (not an interface); fields match the §01 spec exactly — `Variation`, `Code`, `Message`, `Cause`, `StackTrace`, `Diagnostics`, `Values`, plus the diagnostic option blocks listed in the parent reference. | [`01-struct-and-fields.md`](./01-struct-and-fields.md) |
| AT-APPERRORSTRUCT-02 | All `AppError` fields are unexported OR exported per the spec's stated access table; field-level mutation outside the package is forbidden — callers use the fluent setters. | [`01-struct-and-fields.md`](./01-struct-and-fields.md) |

### Basic constructors (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORSTRUCT-03 | The basic constructor set is exactly **`New`, `Wrap`, `NewType`, `WrapType`, `WrapTypeMsg`** — no other top-level constructor is exported. | [`02-basic-constructors.md`](./02-basic-constructors.md) |
| AT-APPERRORSTRUCT-04 | `Wrap*` constructors preserve the original error in `Cause` and append (do not replace) the existing stack trace; the resulting depth respects the apperror reference budget (18 frames). | [`02-basic-constructors.md`](./02-basic-constructors.md), [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) |

### Convenience constructors (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORSTRUCT-05 | The convenience set is exactly **`PathError`, `UrlError`, `SlugError`, `SiteError`, `EndpointError`** — each pre-fills the matching diagnostic block before applying user options. | [`03-convenience-constructors.md`](./03-convenience-constructors.md) |
| AT-APPERRORSTRUCT-06 | **Key Rule (parent §00)** — when a diagnostic field is relevant, the convenience constructor MUST be used; manual `.WithXxx()` chaining for the same diagnostic is a lint failure. | [`00-overview.md`](./00-overview.md), [`03-convenience-constructors.md`](./03-convenience-constructors.md) |

### Merge (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORSTRUCT-07 | `Merge` aggregates a slice of `*AppError` into a single batch error and de-duplicates identical `(Code, Variation)` pairs; `MergeWithCode` overrides the resulting top-level code. | [`04-merge.md`](./04-merge.md) |
| AT-APPERRORSTRUCT-08 | `Merge` returns `nil` when the input slice is empty or contains only nils; this short-circuit is part of the contract and is covered by a unit test. | [`04-merge.md`](./04-merge.md) |

### Display methods (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORSTRUCT-09 | `Error()` returns a single-line summary, `String()` returns a multi-line developer view, `FullString()` includes the full stack + diagnostics, and `ToClipboard()` produces the canonical copy-to-paste format documented in §05. | [`05-display-methods.md`](./05-display-methods.md) |
| AT-APPERRORSTRUCT-10 | All display methods are deterministic for the same input (timestamps formatted in UTC, fields in fixed order); golden-file tests guard regression. | [`05-display-methods.md`](./05-display-methods.md) |

### Query & diagnostic setters (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORSTRUCT-11 | Query methods (`Values`, `IsType`, `IsCode`, `Has*`) are read-only; fluent setters (`WithPath`, `WithUrl`, `WithSlug`, `WithSite`, `WithEndpoint`, …) return the receiver for chaining and never mutate a shared receiver in place. | [`06-query-and-diagnostic-setters.md`](./06-query-and-diagnostic-setters.md) |
| AT-APPERRORSTRUCT-12 | Flow-control helpers (`MustReturn`, `OrPanic`, `OrLogAndContinue` — names per §06) are documented with their failure mode and an explicit test verifying the panic / log path. | [`06-query-and-diagnostic-setters.md`](./06-query-and-diagnostic-setters.md) |

---

## Verification

```bash
# Field access from outside package
rg -n '(\*?AppError)\.[A-Z]\w+\s*=' --type go internal/

# Manual WithXxx chains where a convenience constructor exists
rg -n 'apperror\.New\([^)]*\)\.WithPath\(' --type go internal/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — apperror reference rollup (`AT-APPERRORREFERENCE-NN`)
- [`../05-apperrtype-enums/97-acceptance-criteria.md`](../05-apperrtype-enums/97-acceptance-criteria.md) — Variation enum & registry
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../../01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack error handling

---

*Curated 2026-04-25 — closes A-18 (batch 7).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../../../97a-acceptance-criteria-fixtures.md`](../../../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
