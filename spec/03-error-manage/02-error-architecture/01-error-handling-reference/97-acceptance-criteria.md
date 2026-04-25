# Error Handling — Cross-Stack Reference — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ERRORHANDLINGREFERENCE-01` … `AT-ERRORHANDLINGREFERENCE-13`

---

## Criteria

### Architecture (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGREFERENCE-01 | The system implements a strict 3-tier error-handling architecture: **Tier 1 = Delegated server (PHP / 3rd-party)**, **Tier 2 = Go backend**, **Tier 3 = React frontend** — every error crosses tiers via the universal envelope only. | [`01-error-flow-architecture.md`](./01-error-flow-architecture.md) |
| AT-ERRORHANDLINGREFERENCE-02 | The 3-hop request chain (React → Go → Delegated) is documented with a flow diagram and every hop captures structured diagnostics (request, response, stack, code). | [`01-error-flow-architecture.md`](./01-error-flow-architecture.md) |

### Tier 1 — Delegated server (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGREFERENCE-03 | Delegated servers wrap every endpoint in a `safe_execute()` boundary that converts uncaught exceptions into the universal envelope with a registered error code. | [`02-tier1-delegated-server.md`](./02-tier1-delegated-server.md) |
| AT-ERRORHANDLINGREFERENCE-04 | Delegated servers write a per-request `stacktrace.txt` via `FileLogger` to a session-scoped directory; the path is returned in the envelope's `Data.LogPath` for cross-tier diagnostics. | [`02-tier1-delegated-server.md`](./02-tier1-delegated-server.md), [`spec/03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) |

### Tier 2 — Go backend (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGREFERENCE-05 | The Go backend uses `apperror.New` / `apperror.Wrap` / `apperror.NewType` for every error — bare `error` returns are forbidden across exported service methods. | [`03-tier2-go-backend.md`](./03-tier2-go-backend.md), [`spec/03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/97-acceptance-criteria.md`](../06-apperror-package/01-apperror-reference/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGREFERENCE-06 | When proxying to a delegated server, Go injects a `DelegatedRequestServer` block into the `*AppError` containing the upstream URL, method, status, request body summary, response body summary, and upstream stack (if returned). | [`03-tier2-go-backend.md`](./03-tier2-go-backend.md) §"DelegatedRequestServer" |
| AT-ERRORHANDLINGREFERENCE-07 | The Go backend's HTTP layer always serializes `*AppError` to the universal envelope; HTTP status mirrors the `apperror` policy mapping (4xx for client errors, 5xx for server errors). | [`03-tier2-go-backend.md`](./03-tier2-go-backend.md), [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../05-response-envelope/97-acceptance-criteria.md) |

### Tier 3 — Frontend (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGREFERENCE-08 | The frontend `errorStore` ingests every non-OK envelope, deduplicates by `(Code, requestId)`, and surfaces the active error via the **Global Error Modal**. | [`04-tier3-frontend.md`](./04-tier3-frontend.md) |
| AT-ERRORHANDLINGREFERENCE-09 | The Global Error Modal exposes tabs for **Summary**, **Stack** (Go + Delegated), **Request/Response**, and **Session Diagnostics** — each tab is populated only when the matching envelope field is present. | [`04-tier3-frontend.md`](./04-tier3-frontend.md), [`spec/03-error-manage/02-error-architecture/04-error-modal/97-acceptance-criteria.md`](../04-error-modal/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGREFERENCE-10 | `parseEnvelope()` validates `Success`, `Code`, `Message`, `Data` shape on every fetch boundary and produces a typed `Result<T, AppError>` for downstream consumers. | [`04-tier3-frontend.md`](./04-tier3-frontend.md) |

### Codes & fallbacks (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGREFERENCE-11 | Error codes follow the documented domain ranges (E1xxx config … E14xxx crypto, etc.) and every code is registered in the master registry before use. | [`05-error-codes-and-fallbacks.md`](./05-error-codes-and-fallbacks.md), [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../../03-error-code-registry/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGREFERENCE-12 | When a tier receives an envelope with an unknown `Code`, it falls back to a generic `E9999` "unknown error" mapping but preserves the original `Code`, `Message`, and `Data` verbatim for the next tier. | [`05-error-codes-and-fallbacks.md`](./05-error-codes-and-fallbacks.md) |
| AT-ERRORHANDLINGREFERENCE-13 | The reference is the SSOT — every other spec touching error flow (apperror, envelope, modal, retros) cross-links here, and `scripts/spec-hygiene/09-check-xrefs.mjs` enforces the back-link. | [`00-overview.md`](./00-overview.md), [`scripts/spec-hygiene/09-check-xrefs.mjs`](../../../../scripts/spec-hygiene/09-check-xrefs.mjs) |

---

## Verification

```bash
# Bare error returns in Go
rg -n 'func \(\w+ \*\w+\) \w+\(.*\) .*\berror\b' --type go internal/

# Envelope shape in TS
rg -n 'parseEnvelope|Success.*Code.*Message.*Data' --type ts src/

# Unknown-code fallback
rg -n 'E9999|UnknownError' --type go --type ts

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../05-response-envelope/97-acceptance-criteria.md) — Universal envelope
- [`spec/03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/97-acceptance-criteria.md`](../06-apperror-package/01-apperror-reference/97-acceptance-criteria.md) — `apperror` package
- [`spec/03-error-manage/02-error-architecture/04-error-modal/97-acceptance-criteria.md`](../04-error-modal/97-acceptance-criteria.md) — Global Error Modal
- [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../../03-error-code-registry/97-acceptance-criteria.md) — Error code registry

---

*Curated 2026-04-25 — closes A-17 (batch 6).*
