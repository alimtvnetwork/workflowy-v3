# Error Modal Reference — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ERRORMODALREFERENCE-01` … `AT-ERRORMODALREFERENCE-15`

---

## Criteria

### Data model & capture (files 01–03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-01 | The `CapturedError` interface is the single in-memory representation; every captured error carries `id`, `timestamp`, `envelope`, `request`, `response`, `frontendStack`, and an optional `sessionDiagnostics` block. | [`01-data-model.md`](./01-data-model.md) |
| AT-ERRORMODALREFERENCE-02 | Capture pipeline order is fixed: **API client interceptor → `errorStore.push()` → modal subscribes**; no component fetches errors directly from the network layer. | [`02-capture-pipeline.md`](./02-capture-pipeline.md) |
| AT-ERRORMODALREFERENCE-03 | `parseEnvelope()` validates `Success`, `Code`, `Message`, `Data` and maps `Data.Errors`, `Data.MethodsStack`, `Data.Attributes` into typed fields; unknown fields are preserved on a `raw` blob for diagnostics. | [`03-envelope-parsing.md`](./03-envelope-parsing.md) |

### Modal structure & tabs (files 04–06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-04 | The modal renders **two top-level sections** — Backend and Frontend — each with its own tab list; tab visibility is data-driven (a tab is hidden when its envelope field is empty). | [`04-modal-structure.md`](./04-modal-structure.md) |
| AT-ERRORMODALREFERENCE-05 | Backend tabs are exactly: **Overview, Log, Execution, Stack, Session, Request, Traversal** — order is fixed and tab IDs are stable for E2E selectors. | [`05-backend-tabs.md`](./05-backend-tabs.md) |
| AT-ERRORMODALREFERENCE-06 | Frontend tabs are exactly: **Overview, Stack, Context, Fixes** — order is fixed and tab IDs are stable for E2E selectors. | [`06-frontend-tabs.md`](./06-frontend-tabs.md) |

### Request chain & traversal (files 07–08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-07 | The Request Chain visualization renders **3 hops** (React → Go → Delegated) with status, duration, and error badge per hop; missing hops are grayed out, not omitted. | [`07-request-chain.md`](./07-request-chain.md) |
| AT-ERRORMODALREFERENCE-08 | The Traversal tab shows the endpoint flow, the methods stack, and the delegated-server detail block; rows are collapsible and the active error frame is highlighted. | [`08-traversal-details.md`](./08-traversal-details.md) |

### Session diagnostics (file 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-09 | When the envelope carries `Attributes.SessionId`, the modal auto-fetches `/sessions/{id}` and renders the returned `SessionDiagnostics` block in the Session tab; failure is non-fatal. | [`09-session-diagnostics.md`](./09-session-diagnostics.md), [`spec/03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../../07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) |

### Report generation (file 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-10 | The modal exposes **two** report generators — **Compact** (one-screen summary) and **Full** (every captured field + session diagnostics) — and copy + download actions for each. | [`10-report-generation.md`](./10-report-generation.md) |
| AT-ERRORMODALREFERENCE-11 | The Full report is deterministic given the same inputs — field order, timestamps formatted in UTC, and trailing newline — so byte-for-byte diff is meaningful across runs. | [`10-report-generation.md`](./10-report-generation.md) |

### Queue navigation (file 11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-12 | Multiple captured errors form a queue; the modal renders Prev/Next controls with a position indicator (`3 / 7`); navigation never loses unread state. | [`11-queue-navigation.md`](./11-queue-navigation.md) |

### Code & file references (files 12–13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-13 | The React code examples in §12 compile under the project's strict TypeScript config (no `any`, ≤15 logical lines per function, zero nested `if`). | [`12-code-examples.md`](./12-code-examples.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-ERRORMODALREFERENCE-14 | The file-reference table in §13 lists every concrete component the spec requires (modal shell, each tab body, queue controller, report generator); the hygiene cross-ref check enforces that every name resolves. | [`13-file-reference.md`](./13-file-reference.md) |

### Cross-stack invariant

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODALREFERENCE-15 | The modal is the SOLE consumer of un-acknowledged errors from `errorStore`; no other component is allowed to render toast/inline UI for the same `(Code, requestId)` pair. | [`02-capture-pipeline.md`](./02-capture-pipeline.md), [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../01-error-handling-reference/97-acceptance-criteria.md) |

---

## Verification

```bash
# Tab IDs stable across the codebase
rg -n 'data-tab="(overview|log|execution|stack|session|request|traversal|context|fixes)"' --type ts --type tsx src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../01-error-handling-reference/97-acceptance-criteria.md) — 3-tier error handling
- [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../05-response-envelope/97-acceptance-criteria.md) — Universal envelope
- [`spec/03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../../07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) — Session diagnostics

---

*Curated 2026-04-25 — closes A-18 (batch 7).*
