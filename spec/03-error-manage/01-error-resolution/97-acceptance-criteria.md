# Error Resolution — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 12 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ERRORRESOLUTION-01` … `AT-ERRORRESOLUTION-12`

> Rollup spec for the diagnostic side of error management — debugging, retros, verification.

---

## Criteria

### Cross-reference & cheat sheet (files 01–02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORRESOLUTION-01 | The cross-reference diagram in §01 is the SSOT for "which spec connects to which" in error resolution; every node in the diagram is a real spec file (cross-ref hygiene resolves). | [`01-cross-reference-diagram.md`](./01-cross-reference-diagram.md) |
| AT-ERRORRESOLUTION-02 | The debugging cheat sheet in §02 covers PHP, Go, AND TypeScript with a uniform 4-row template (Symptom / Diagnostic / Fix / Spec link) per row. | [`02-debugging-cheat-sheet.md`](./02-debugging-cheat-sheet.md) |

### Retrospectives (subfolder 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORRESOLUTION-03 | Every retrospective under `03-retrospectives/` follows the canonical 6-section format and carries a stable `R-NN` ID; the rollup spec at `03-retrospectives/97-acceptance-criteria.md` enforces this. | [`./03-retrospectives/97-acceptance-criteria.md`](./03-retrospectives/97-acceptance-criteria.md) (`AT-RETROSPECTIVES-01..03`) |
| AT-ERRORRESOLUTION-04 | Net-new failures discovered during development MUST produce a new retro file before the fix merges; an error code without a matching retro entry is a process violation. | [`06-error-documentation-guideline.md`](./06-error-documentation-guideline.md) |

### Verification patterns (subfolder 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORRESOLUTION-05 | Verification patterns under `04-verification-patterns/` define the **standard recipes** for cross-stack checks (frontend↔backend sync, envelope conformance, code-registry coverage); each recipe has a runnable command. | [`./04-verification-patterns/00-overview.md`](./04-verification-patterns/00-overview.md) |
| AT-ERRORRESOLUTION-06 | A frontend-backend sync verification MUST cover: endpoint path, HTTP method, envelope shape, status-code mapping, and error-code coverage; missing any of the five fails the check. | [`./04-verification-patterns/00-overview.md`](./04-verification-patterns/00-overview.md) |

### Debugging guides (subfolder 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORRESOLUTION-07 | Each debugging guide under `05-debugging-guides/` (PHP, Go, TypeScript) has a sibling `97-acceptance-criteria.md` and is registered in the parent overview. | [`./05-debugging-guides/00-overview.md`](./05-debugging-guides/00-overview.md), [`./05-debugging-guides/02-debugging-go/97-acceptance-criteria.md`](./05-debugging-guides/02-debugging-go/97-acceptance-criteria.md), [`./05-debugging-guides/03-debugging-typescript/97-acceptance-criteria.md`](./05-debugging-guides/03-debugging-typescript/97-acceptance-criteria.md) |
| AT-ERRORRESOLUTION-08 | The debugging guides cross-reference `02-error-architecture/01-error-handling-reference/` (cross-stack error flow) AND `03-error-code-registry/` (error codes); broken back-links fail hygiene. | [`./05-debugging-guides/02-debugging-go/00-overview.md`](./05-debugging-guides/02-debugging-go/00-overview.md), [`./05-debugging-guides/03-debugging-typescript/00-overview.md`](./05-debugging-guides/03-debugging-typescript/00-overview.md) |

### Documentation discipline (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORRESOLUTION-09 | The error-documentation guideline (§06) is the SSOT for **what to write** when documenting an error — required fields: code, symptom, root cause, detection signal, fix, prevention rule, retro link. | [`06-error-documentation-guideline.md`](./06-error-documentation-guideline.md) |
| AT-ERRORRESOLUTION-10 | Every documented error references a registered code from `03-error-code-registry/` AND an `apperrtype.Variation`; orphan codes fail the registry coverage check. | [`06-error-documentation-guideline.md`](./06-error-documentation-guideline.md), [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../03-error-code-registry/97-acceptance-criteria.md), [`spec/03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/05-apperrtype-enums/97-acceptance-criteria.md`](../02-error-architecture/06-apperror-package/01-apperror-reference/05-apperrtype-enums/97-acceptance-criteria.md) |

### Coverage & rollup

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORRESOLUTION-11 | The 5 documented sections in `00-overview.md` (cross-ref, cheat sheet, retros, verification, debugging guides, doc guideline) each have at least one acceptance criterion above; gaps are tracked in the spec-hygiene suggestions. | [`00-overview.md`](./00-overview.md) |
| AT-ERRORRESOLUTION-12 | The rollup is consistent with the architecture rollup at `02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`: every concept defined here (retro, verification recipe, debugging guide) is referenced from the cross-stack handling spec OR vice-versa. | [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md) |

---

## Verification

```bash
# Hygiene suite (link & xref enforcement)
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`./03-retrospectives/97-acceptance-criteria.md`](./03-retrospectives/97-acceptance-criteria.md) — Retrospectives rollup
- [`./05-debugging-guides/02-debugging-go/97-acceptance-criteria.md`](./05-debugging-guides/02-debugging-go/97-acceptance-criteria.md) — Go debugging
- [`./05-debugging-guides/03-debugging-typescript/97-acceptance-criteria.md`](./05-debugging-guides/03-debugging-typescript/97-acceptance-criteria.md) — TS debugging
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack handling
- [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../03-error-code-registry/97-acceptance-criteria.md) — Code registry

---

*Curated 2026-04-25 — closes A-19 (batch 8).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
