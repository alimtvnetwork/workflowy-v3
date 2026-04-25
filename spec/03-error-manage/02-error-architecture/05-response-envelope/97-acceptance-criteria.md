# Response Envelope — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the Universal Response Envelope — the single envelope shape every REST API response uses across Go, PHP, and TypeScript.

ID format: `AT-RESPONSEENVELOPE-NN`.

---

## Criteria

### Architecture Decision (AT-RESPONSEENVELOPE-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEENVELOPE-01 | The Universal Envelope shape is the only response shape used by REST endpoints; per-endpoint custom shapes are forbidden. | [`01-adr.md`](./01-adr.md) |
| AT-RESPONSEENVELOPE-02 | Every envelope contains the documented top-level keys (e.g. `Status`, `Data`, `Error`, `Meta`); presence of each follows the documented success/error rules. | [`01-adr.md`](./01-adr.md) + [`04-response-envelope-reference.md`](./04-response-envelope-reference.md) |
| AT-RESPONSEENVELOPE-03 | Top-level keys are PascalCase, matching the REST API Format Golden Rule. | [`04-response-envelope-reference.md`](./04-response-envelope-reference.md) + [`../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) |

### Versioning (AT-RESPONSEENVELOPE-04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEENVELOPE-04 | Every breaking envelope change is recorded in the changelog with version, date, and migration notes; non-breaking additions are also logged. | [`02-changelog.md`](./02-changelog.md) |

### Configurability (AT-RESPONSEENVELOPE-05..06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEENVELOPE-05 | Optional envelope fields (e.g. `Debug`, `Meta`) are toggleable via the documented configuration flags; production defaults hide debug data. | [`03-configurability.md`](./03-configurability.md) |
| AT-RESPONSEENVELOPE-06 | Configuration changes never alter the envelope's required keys — only the optional ones. | [`03-configurability.md`](./03-configurability.md) |

### Reference Specification (AT-RESPONSEENVELOPE-07..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEENVELOPE-07 | Every envelope variant (single, multiple, error, minimal, debug) has a JSON sample file in this folder that validates against the schema. | [`envelope-single.json`](./envelope-single.json), [`envelope-multiple.json`](./envelope-multiple.json), [`envelope-error.json`](./envelope-error.json), [`envelope-minimal.json`](./envelope-minimal.json), [`envelope-debug.json`](./envelope-debug.json) |
| AT-RESPONSEENVELOPE-08 | The JSON Schema (`envelope.schema.json`) is the SSOT for envelope structure validation in CI. | [`envelope.schema.json`](./envelope.schema.json) |
| AT-RESPONSEENVELOPE-09 | Success responses populate `Data` (never `Error`); error responses populate `Error` (never `Data`); the two are mutually exclusive. | [`04-response-envelope-reference.md`](./04-response-envelope-reference.md) |

---

## Verification

```bash
grep -rn "AT-RESPONSEENVELOPE-" spec/03-error-manage/02-error-architecture/05-response-envelope/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../04-error-modal/97-acceptance-criteria.md`](../04-error-modal/97-acceptance-criteria.md) — Error Modal (consumes envelope errors)
- [`../06-apperror-package/00-overview.md`](../06-apperror-package/00-overview.md) — `AppError` data model
- [`../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) — REST API format (PascalCase Golden Rule)
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
