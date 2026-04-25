# Error Modal React Components — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-REACTCOMPONENTS-01` … `AT-REACTCOMPONENTS-14`

---

## Criteria

### TypeScript interfaces (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-01 | The `CapturedError` interface is the SSOT for what the modal displays; every field has a documented source (frontend-captured vs backend-returned vs synthesized). | [`01-typescript-interfaces.md`](./01-typescript-interfaces.md) |
| AT-REACTCOMPONENTS-02 | `SessionDiagnostics` and shared component props are defined in this file ONLY; duplicate definitions in component files are forbidden. | [`01-typescript-interfaces.md`](./01-typescript-interfaces.md) |

### Error store (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-03 | The error store is a single Zustand store; multi-store designs are forbidden (queue ordering would break across stores). | [`02-error-store.md`](./02-error-store.md) |
| AT-REACTCOMPONENTS-04 | The store exposes a stack-trace parser as a pure function (no React imports, no DOM access) so it is unit-testable in isolation. | [`02-error-store.md`](./02-error-store.md) |
| AT-REACTCOMPONENTS-05 | Queue navigation MUST preserve insertion order (FIFO) and mark navigated entries as "seen" without removing them. | [`02-error-store.md`](./02-error-store.md), [`../03-error-modal-reference/97-acceptance-criteria.md`](../03-error-modal-reference/97-acceptance-criteria.md) |

### API types (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-06 | API types match the backend envelope contract — divergence between this file and `01-error-handling-reference/` is a doc bug. | [`03-api-types.md`](./03-api-types.md), [`../../01-error-handling-reference/97-acceptance-criteria.md`](../../01-error-handling-reference/97-acceptance-criteria.md) |
| AT-REACTCOMPONENTS-07 | The API method set is exactly: `fetchErrorLog`, `fetchFullLog`, `fetchSessionDiagnostics`; adding a new method requires a doc bump and a matching backend endpoint AT. | [`03-api-types.md`](./03-api-types.md) |

### Hooks (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-08 | `useSessionDiagnostics` lazy-fetches on Session-tab open (not on modal mount); the fetch is deduplicated per session id. | [`04-hooks.md`](./04-hooks.md) |
| AT-REACTCOMPONENTS-09 | All hooks return a typed result envelope (`{ data, isLoading, error }`); raw promise return is forbidden. | [`04-hooks.md`](./04-hooks.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |

### Component hierarchy & source (files 05–06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-10 | The component tree matches §05 exactly: `GlobalErrorModal` → Header / Section Toggle / BackendSection / FrontendSection / Footer; reordering siblings or introducing intermediate wrappers is a breaking change. | [`05-component-hierarchy.md`](./05-component-hierarchy.md) |
| AT-REACTCOMPONENTS-11 | All 7 major components in §06 (Modal, Header, BackendSection, FrontendSection, SessionLogsTab, RequestDetails, TraversalDetails) follow the project's coding rules: ≤15 logical lines per function, ≤3 params, no `any`. | [`06-component-source.md`](./06-component-source.md), [`../../../../02-coding-guidelines/01-cross-language/04-code-style/97-acceptance-criteria.md`](../../../../02-coding-guidelines/01-cross-language/04-code-style/97-acceptance-criteria.md) |

### Report generator (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-12 | `generateErrorReport(captured, format)` is pure (no I/O, no clipboard, no DOM); clipboard/download are separate side-effect helpers. | [`07-report-generator.md`](./07-report-generator.md) |
| AT-REACTCOMPONENTS-13 | The "Suggested fixes" block is generated from a deterministic mapping (error code → fix template); novel codes fall back to a generic template, NOT empty output. | [`07-report-generator.md`](./07-report-generator.md) |

### Integration (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REACTCOMPONENTS-14 | The integration guide is self-contained: a fresh project can install the modal by following only this file (TS interfaces, Zustand store, hooks, components, generator, React Query setup); broken cross-refs fail hygiene. | [`08-integration-guide.md`](./08-integration-guide.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-copy-formats/97-acceptance-criteria.md`](../01-copy-formats/97-acceptance-criteria.md) — Copy formats
- [`../03-error-modal-reference/97-acceptance-criteria.md`](../03-error-modal-reference/97-acceptance-criteria.md) — Modal reference
- [`../04-color-themes/97-acceptance-criteria.md`](../04-color-themes/97-acceptance-criteria.md) — Color themes

---

*Curated 2026-04-25 — closes A-20 (batch 9). Replaces v0.1.0 stub.*
