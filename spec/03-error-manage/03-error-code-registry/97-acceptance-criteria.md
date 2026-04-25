# Error Code Registry — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the cross-project Error Code Registry — guarantees no error-code collisions between projects, consistent debugging structure, and machine-parseable codes.

ID format: `AT-ERRORCODEREGISTRY-NN`.

---

## Criteria

### Master Registry (AT-ERRORCODEREGISTRY-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORCODEREGISTRY-01 | `error-codes-master.json` is the SSOT for every reserved error-code range across all projects. | [`error-codes-master.json`](./error-codes-master.json) + [`01-registry/`](./01-registry/01-overview.md) |
| AT-ERRORCODEREGISTRY-02 | Every error code matches one of the documented formats: `XX-NNN-NN` (string-prefixed) or `NNNN+` (integer). | [`00-overview.md`](./00-overview.md) |
| AT-ERRORCODEREGISTRY-03 | No two projects share an overlapping numeric range or prefix; the registry assigns each project a unique slice. | [`01-registry/`](./01-registry/01-overview.md) |

### Integration (AT-ERRORCODEREGISTRY-04..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORCODEREGISTRY-04 | New projects follow the integration guide step-by-step: claim a range → record in master → wire linter → emit codes from enum. | [`02-integration-guide.md`](./02-integration-guide.md) |
| AT-ERRORCODEREGISTRY-05 | Every emitted error code in source code can be traced back to a registry entry (round-trip lookup). | [`02-integration-guide.md`](./02-integration-guide.md) + [`04-error-code-utilization-report.md`](./04-error-code-utilization-report.md) |

### Collision Prevention (AT-ERRORCODEREGISTRY-06..08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORCODEREGISTRY-06 | The historic collision-resolution report documents every past collision and its resolution; it is preserved as historical record. | [`03-collision-resolution-summary.md`](./03-collision-resolution-summary.md) |
| AT-ERRORCODEREGISTRY-07 | The overlap validator (`05-overlap-validator.md`) describes the algorithm; an automated linter implements it and runs in CI. | [`05-overlap-validator.md`](./05-overlap-validator.md) + [`08-linter-scripts/`](./08-linter-scripts/00-overview.md) |
| AT-ERRORCODEREGISTRY-08 | The CI overlap check fails the build on any new collision. | [`08-linter-scripts/`](./08-linter-scripts/00-overview.md) |

### Utilization (AT-ERRORCODEREGISTRY-09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORCODEREGISTRY-09 | The utilization report is regenerated on every release; it shows used vs. reserved counts per project range. | [`04-error-code-utilization-report.md`](./04-error-code-utilization-report.md) |

### Schemas, Linters & Templates (AT-ERRORCODEREGISTRY-10..12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORCODEREGISTRY-10 | All registry entries validate against the JSON Schemas in `07-schemas/`. | [`07-schemas/`](./07-schemas/00-overview.md) |
| AT-ERRORCODEREGISTRY-11 | Linter scripts in `08-linter-scripts/` are language-agnostic and runnable from any project's CI. | [`08-linter-scripts/`](./08-linter-scripts/00-overview.md) |
| AT-ERRORCODEREGISTRY-12 | New project onboarding uses the templates in `09-templates/` to claim a range and generate boilerplate enum entries. | [`09-templates/`](./09-templates/00-overview.md) |

---

## Verification

```bash
grep -rn "AT-ERRORCODEREGISTRY-" spec/03-error-manage/03-error-code-registry/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../02-error-architecture/06-apperror-package/00-overview.md`](../02-error-architecture/06-apperror-package/00-overview.md) — `AppError` carries these codes
- [`../02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../02-error-architecture/05-response-envelope/97-acceptance-criteria.md) — Envelope `Error.Code` field
- [`spec/20-enums-index.md`](../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
