# Debugging TypeScript / React — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 12 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-DEBUGGINGTYPESCRIPT-01` … `AT-DEBUGGINGTYPESCRIPT-12`

---

## Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGTYPESCRIPT-01 | Before reporting a "broken API", the developer MUST run the documented endpoint check (curl + status + envelope shape) and paste the result in the bug report. | [`01-api-integration-verification.md`](./01-api-integration-verification.md) |
| AT-DEBUGGINGTYPESCRIPT-02 | Every API response is validated against the universal envelope (`Success`, `Code`, `Message`, `Data`) before being passed to UI; type mismatches surface as `apperror`-style frontend errors, not silent failures. | [`01-api-integration-verification.md`](./01-api-integration-verification.md), [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../../02-error-architecture/05-response-envelope/97-acceptance-criteria.md) |
| AT-DEBUGGINGTYPESCRIPT-03 | A health-check ping is performed on app boot and surfaced via the `DiagnosticsPanel`; a failed ping shows the **disconnected** banner instead of letting React Query retry silently forever. | [`01-api-integration-verification.md`](./01-api-integration-verification.md), [`02-environment-diagnostics.md`](./02-environment-diagnostics.md) |
| AT-DEBUGGINGTYPESCRIPT-04 | `DiagnosticsPanel` shows BOTH the raw `import.meta.env.*` value and the resolved runtime value side-by-side, so build-time vs runtime drift is visible at a glance. | [`02-environment-diagnostics.md`](./02-environment-diagnostics.md) |
| AT-DEBUGGINGTYPESCRIPT-05 | The "Common Issues" runbook covers (at minimum): disconnected backend, prod build failures, stale state, and TS compile errors; each has a numbered Symptom → Diagnose → Fix flow. | [`03-common-issues.md`](./03-common-issues.md) |
| AT-DEBUGGINGTYPESCRIPT-06 | React Query DevTools is enabled in dev builds and stripped in prod; query keys follow the `[domain, id, …filters]` array convention so cache inspection is unambiguous. | [`04-react-query.md`](./04-react-query.md) |
| AT-DEBUGGINGTYPESCRIPT-07 | A `useWebSocketState()` hook (or equivalent) exposes `connecting`/`open`/`closing`/`closed` so UI never renders against an unconfirmed socket. | [`05-websocket.md`](./05-websocket.md) |
| AT-DEBUGGINGTYPESCRIPT-08 | All console output goes through the structured logger (`logger.info|warn|error|debug`), never bare `console.log`; logger calls include a `requestId`/`correlationId` field when one exists. | [`06-console-logging.md`](./06-console-logging.md) |
| AT-DEBUGGINGTYPESCRIPT-09 | Network panel filters are documented (`fetch/XHR`, `Status: 4xx,5xx`, response-type filters); the runbook lists the exact filter strings to copy-paste. | [`07-browser-devtools.md`](./07-browser-devtools.md) |
| AT-DEBUGGINGTYPESCRIPT-10 | A top-level `<ErrorBoundary>` wraps the application; it (a) renders a typed fallback UI, (b) reports to the structured logger, (c) shows `errorCode` when present. | [`08-error-boundary.md`](./08-error-boundary.md), [`spec/03-error-manage/02-error-architecture/04-error-modal/97-acceptance-criteria.md`](../../../02-error-architecture/04-error-modal/97-acceptance-criteria.md) |
| AT-DEBUGGINGTYPESCRIPT-11 | Performance debugging uses React Profiler + `why-did-you-render` (or equivalent) — never ad-hoc `console.time` scattered in components. | [`09-performance.md`](./09-performance.md) |
| AT-DEBUGGINGTYPESCRIPT-12 | Each subtopic file (01–09) is referenced exactly once from `00-overview.md` table-of-contents; the AUTO-TOC block stays in sync via `scripts/spec-hygiene/11-generate-auto-toc.mjs`. | [`00-overview.md`](./00-overview.md) |

---

## Verification

```bash
# Bare console.log in src/
rg -n 'console\.(log|error|warn|info)' src/ | grep -v 'src/lib/logger'

# Run hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/03-error-manage/02-error-architecture/05-response-envelope/00-overview.md`](../../../02-error-architecture/05-response-envelope/00-overview.md) — Universal envelope SSOT
- [`spec/03-error-manage/02-error-architecture/04-error-modal/00-overview.md`](../../../02-error-architecture/04-error-modal/00-overview.md) — Error modal contract
- [`spec/19-glossary.md`](../../../../19-glossary.md) — Terminology SSOT

---

*Curated 2026-04-25 — closes A-16 (batch 5).*
