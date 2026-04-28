# REST API Format — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the REST API response format. Enforces the **Golden Rule**: every JSON key in a REST API response is PascalCase, end-to-end (database → ORM → API → frontend types).

ID format: `AT-RESTAPIFORMAT-NN`.

---

## Criteria

### Key Format — The Golden Rule (AT-RESTAPIFORMAT-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPIFORMAT-01 | Every JSON key in a REST API response is PascalCase. No camelCase, no snake_case, no kebab-case. | [`01-key-format.md`](./01-key-format.md) |
| AT-RESTAPIFORMAT-02 | The PascalCase rule applies to nested objects and arrays of objects — recursively. | [`01-key-format.md`](./01-key-format.md) |
| AT-RESTAPIFORMAT-03 | Database column names match REST response keys exactly (PascalCase, identical spelling), enabling direct `column → key` mapping. | [`01-key-format.md`](./01-key-format.md) + [`03-envelope-and-flow.md`](./03-envelope-and-flow.md) |

### Sample Coverage (AT-RESTAPIFORMAT-04..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPIFORMAT-04 | Documented samples cover all six core REST verbs and outcomes: list, get-one, create, update, delete, error. | [`02-rest-samples.md`](./02-rest-samples.md) |
| AT-RESTAPIFORMAT-05 | Every sample is a complete, copy-pasteable JSON document — not a fragment. | [`02-rest-samples.md`](./02-rest-samples.md) |

### Universal Envelope (AT-RESTAPIFORMAT-06..08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPIFORMAT-06 | Every response wraps its payload in the Universal Response Envelope defined in [`spec/03-error-manage/02-error-architecture/05-response-envelope/`](../../03-error-manage/02-error-architecture/05-response-envelope/00-overview.md). | [`03-envelope-and-flow.md`](./03-envelope-and-flow.md) |
| AT-RESTAPIFORMAT-07 | Success responses populate `Data`; error responses populate `Error` (never both); `Status` is always present. | [`03-envelope-and-flow.md`](./03-envelope-and-flow.md) |
| AT-RESTAPIFORMAT-08 | The PascalCase data flow is unbroken end-to-end: SQLite column → ORM struct field → REST handler → JSON response → TypeScript interface. | [`03-envelope-and-flow.md`](./03-envelope-and-flow.md) |

### Language Implementations (AT-RESTAPIFORMAT-09..10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPIFORMAT-09 | Each documented language (Go, PHP, TypeScript) has an implementation snippet that produces a Golden-Rule-conformant response. | [`04-language-implementation.md`](./04-language-implementation.md) |
| AT-RESTAPIFORMAT-10 | Go uses `json:"PascalCase"` struct tags; PHP uses `ResponseKeyType` enum; TypeScript types match the same PascalCase keys exactly. | [`04-language-implementation.md`](./04-language-implementation.md) |

### URL Paths vs JSON Keys (AT-RESTAPIFORMAT-11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPIFORMAT-11 | URL path segments are kebab-case (`/api/user-sessions/123`); only JSON keys are PascalCase. The two casings never mix. | [`05-paths-and-references.md`](./05-paths-and-references.md) |

---

## Fixtures

I/O fixtures for `AT-RESTAPIFORMAT-01..11` live in [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (Section B) per the format SSOT in [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../../01-spec-authoring-guide/19-acceptance-criteria-io-table.md).

---

## Verification

```bash
grep -rn "AT-RESTAPIFORMAT-" spec/04-database-conventions/06-rest-api-format/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../../03-error-manage/02-error-architecture/05-response-envelope/`](../../03-error-manage/02-error-architecture/05-response-envelope/00-overview.md) — Universal envelope
- [`../../02-coding-guidelines/04-php/02-forbidden-patterns/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/02-forbidden-patterns/97-acceptance-criteria.md) — PHP forbidden patterns (§11 PascalCase response keys)
- [`spec/19-glossary.md`](../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*


---

## P13 stub rows

> Auto-appended by [`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs`](../../../scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [`40-generate-contract-json.mjs`](../../../scripts/spec-hygiene/40-generate-contract-json.mjs). Each row is a **placeholder definition** — replace the body with concrete Given/When/Then + JSON fixture during P2 (I/O table conversion). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-ENV-01 — Response uses universal envelope with PascalCase keys

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-ENV-02 — `Status` is one of `success` / `error` only

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.
