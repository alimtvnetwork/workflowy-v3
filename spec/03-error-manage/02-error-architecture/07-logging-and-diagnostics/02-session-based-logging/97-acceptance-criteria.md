# Session-Based Logging — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-SESSIONBASEDLOGGING-01` … `AT-SESSIONBASEDLOGGING-14`

---

## Criteria

### Requirements & architecture (files 01–02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-01 | Every HTTP request is assigned a unique **session ID** at the edge (middleware), echoed in `Attributes.SessionId` of the universal envelope, and propagated across the 3-hop chain (React → Go → Delegated). | [`01-requirements.md`](./01-requirements.md), [`02-architecture.md`](./02-architecture.md) |
| AT-SESSIONBASEDLOGGING-02 | The session capture is **complete** — request line, headers (redacted), body summary (truncated), response status, response body summary, and timing — all 6 fields MUST be present per request. | [`01-requirements.md`](./01-requirements.md) |
| AT-SESSIONBASEDLOGGING-03 | When the Go backend proxies a request, a **`DelegatedRequestInfo`** sub-record is captured with the upstream URL, method, status, body summaries, and any upstream stack returned in the envelope. | [`02-architecture.md`](./02-architecture.md), [`03-data-model.md`](./03-data-model.md) |

### Data model (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-04 | `RequestSession` carries `SessionId`, `StartedAt`, `FinishedAt`, `RequestSummary`, `ResponseSummary`, `DelegatedRequests []DelegatedRequestInfo`, `Errors []ErrorRef`; field names are stable for cross-tier consumers. | [`03-data-model.md`](./03-data-model.md) |
| AT-SESSIONBASEDLOGGING-05 | Session-error linkage is bidirectional: the session lists `ErrorRef`s, and every emitted `*AppError` carries the originating `SessionId` in its diagnostic block. | [`03-data-model.md`](./03-data-model.md) |

### API specification (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-06 | The system exposes **8 REST endpoints** documented in §04 (list, get, search, purge, export, etc.); endpoint signatures match the documented method + path + envelope shape exactly. | [`04-api-specification.md`](./04-api-specification.md) |
| AT-SESSIONBASEDLOGGING-07 | Every endpoint returns the universal envelope; endpoints that paginate include `Attributes.Page`, `Attributes.PageSize`, `Attributes.TotalCount`. | [`04-api-specification.md`](./04-api-specification.md), [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../05-response-envelope/97-acceptance-criteria.md) |

### Configuration (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-08 | All knobs (storage path, max body size, retention days, redaction rules, sample rate) are exposed via the documented config schema AND the matching environment variables; CLI flags override env, env overrides config file. | [`05-configuration.md`](./05-configuration.md) |

### Security (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-09 | **Redaction** rules in §06 are applied BEFORE persistence — Authorization, Cookie, Set-Cookie, password-like body keys, and configured custom keys are replaced with `"<redacted>"`; raw values must never reach disk. | [`06-security-considerations.md`](./06-security-considerations.md) |
| AT-SESSIONBASEDLOGGING-10 | **Truncation** caps body summaries at the documented byte budget (per §06); truncated payloads carry an explicit `truncated: true` marker. | [`06-security-considerations.md`](./06-security-considerations.md) |
| AT-SESSIONBASEDLOGGING-11 | **Retention** runs on a documented schedule and deletes sessions older than the configured `RetentionDays`; deletion is logged. | [`06-security-considerations.md`](./06-security-considerations.md) |

### Implementation & error log (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-12 | The canonical `error.log` format documented in §07 is the SOLE textual error format; deviations (different field order, missing field) fail a golden-file test. | [`07-implementation-and-error-log.md`](./07-implementation-and-error-log.md) |
| AT-SESSIONBASEDLOGGING-13 | The implementation file map in §07 lists every concrete artifact required (middleware, store, redactor, retention worker, REST handlers); the hygiene cross-ref check resolves every name. | [`07-implementation-and-error-log.md`](./07-implementation-and-error-log.md) |

### Testing & monitoring (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SESSIONBASEDLOGGING-14 | The test plan in §08 covers at minimum: full 3-hop happy path, redaction correctness, truncation correctness, retention deletion, and pagination edge cases; the metrics list (sessions/sec, redaction count, retention deletes) is exported on the metrics endpoint. | [`08-testing-monitoring-future.md`](./08-testing-monitoring-future.md) |

---

## Verification

```bash
# SessionId propagation in envelope
rg -n 'Attributes.*SessionId|SessionId.*Attributes' --type go --type ts

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack error handling (`DelegatedRequestServer`)
- [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../05-response-envelope/97-acceptance-criteria.md) — Universal envelope (Attributes.SessionId)
- [`spec/03-error-manage/02-error-architecture/04-error-modal/03-error-modal-reference/97-acceptance-criteria.md`](../../04-error-modal/03-error-modal-reference/97-acceptance-criteria.md) — Modal session diagnostics tab

---

*Curated 2026-04-25 — closes A-18 (batch 7).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../../97a-acceptance-criteria-fixtures.md`](../../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
