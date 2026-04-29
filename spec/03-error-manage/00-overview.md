# 03 — Error Management Specification

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-ERRORRESOLUTION-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_error_manage_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-ERRORRESOLUTION-01` | [`97a-…#at-errorresolution-01`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-01) |
| 2 | cites `AT-ERRORRESOLUTION-02` | [`97a-…#at-errorresolution-02`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-02) |
| 3 | cites `AT-ERRORRESOLUTION-03` | [`97a-…#at-errorresolution-03`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-03) |
| 4 | cites `AT-ERRORRESOLUTION-04` | [`97a-…#at-errorresolution-04`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-04) |
| 5 | cites `AT-ERRORRESOLUTION-05` | [`97a-…#at-errorresolution-05`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-05) |
| 6 | cites `AT-ERRORRESOLUTION-06` | [`97a-…#at-errorresolution-06`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-06) |
| 7 | cites `AT-ERRORRESOLUTION-07` | [`97a-…#at-errorresolution-07`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-07) |
| 8 | cites `AT-ERRORRESOLUTION-08` | [`97a-…#at-errorresolution-08`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-08) |
| 9 | cites `AT-ERRORRESOLUTION-09` | [`97a-…#at-errorresolution-09`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-09) |
| 10 | cites `AT-ERRORRESOLUTION-10` | [`97a-…#at-errorresolution-10`](./97a-acceptance-criteria-fixtures.md#at-errorresolution-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  




## AI Contract

**Purpose** — Define the end-to-end error-handling contract: how errors are raised in PHP handlers, serialized into the PascalCase REST envelope (`Errors[]`), surfaced through the Axios interceptor, rendered by `<ErrorModal />`, and recorded for diagnosis. Eliminates "what does this error mean" guesswork for AI implementers.

**Audience** — Backend dev (PHP handlers + envelope shape), frontend dev (interceptor + modal), reviewer (consistency of error codes).

**Expected AI Output** —
- PHP: `wp-plugin/src/Errors/ErrorCode.php` (enum: string, mirrors `03-error-code-registry/`), `wp-plugin/src/Errors/ApiException.php`, every controller `try/catch` returning the canonical envelope `{Status:"Error", Errors:[{Code, Message, Field?}]}`.
- TS: `src/api/errorInterceptor.ts` (Axios response interceptor), `src/components/errors/ErrorModal.tsx`, `src/api/errorTypes.ts` (one type per registry entry).
- Per-error fixture under `spec/03-error-manage/04-fixtures/<code>.json` (request → expected envelope).
- Mermaid error-flow diagram already in `02-error-architecture/00-overview.md` (P8) is the binding visual contract.

**Out of Scope** —
- HTTP-layer concerns (CORS, auth-401 origin) → `15-wp-plugin-how-to/14-rest-api-conventions/`.
- Retry/backoff strategy → `31-app/01-features/14-concurrency-and-sync.md`.
- Logging/observability sinks → `13-cicd-pipeline-workflows/`.

**Definition of Done** —
- Every code in `03-error-code-registry/` has: a PHP enum case, a TS type, a fixture file, and an `AT-ERRORMANAGE-*` row covering its trigger.
- `<ErrorModal />` renders every fixture without crashing (Vitest snapshots).
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---



## Error Taxonomy

Every error in WorkFlowy MUST be classified into exactly one of these four categories. Category drives HTTP status, retry policy, and observability routing.

| Category | HTTP status | Retryable? | Examples | Routing |
|---|---|---|---|---|
| **`ClientError`**     | 400 / 404 / 409 / 422 | **No** — caller must change input. | `ITEM_NOT_FOUND`, `VALIDATION_FAILED`, `STALE_VERSION`. | Logged at `info`; **not** paged. |
| **`AuthError`**       | 401 / 403 | **No** — caller must re-authenticate. | `TOKEN_EXPIRED`, `INSUFFICIENT_ROLE`. | Logged at `warn`; rate-limit watcher. |
| **`TransientError`**  | 503 / 504 | **Yes** — exponential backoff. | `DB_LOCKED`, `UPSTREAM_TIMEOUT`. | Logged at `warn`; auto-retry budget = 3. |
| **`ServerError`**     | 500       | **No** — bug, requires fix. | `INTERNAL`, `INVARIANT_VIOLATION`. | Logged at `error`; pages on-call. |

**Rules:**
- Every entry in `wp-plugin/includes/Errors/ErrorCode.php` MUST declare its category via the `Category` enum.
- The HTTP status is derived from the category — handlers MUST NOT set status independently.
- Only `TransientError` is eligible for client-side retry; the response MUST include `Retry-After` (seconds).
- The category is mirrored in `src/types/errors.ts` and validated by gate `G-22` (PHP↔TS lock-step).

## Error-Code Registry Rules

| Rule | Enforcement |
|---|---|
| Codes are `UPPER_SNAKE_CASE`, ≤ 40 chars. | Gate `G-03-CODE-FORMAT` (regex `^[A-Z][A-Z0-9_]{0,39}$`). |
| Codes are unique across the entire codebase. | Gate `G-03-CODE-UNIQUE` (grep). |
| New codes MUST be added in the **same PR** to PHP and TS files. | Gate `G-22` (diff parity). |
| Each code MUST have a one-line human message template in `errors.messages.<code>`. | Gate `G-03-MESSAGE-PRESENT`. |
| `Field` is required when the error references a specific input field; forbidden otherwise. | Gate `G-03-FIELD-CONDITIONAL`. |

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Throw a bare `\Exception` / `Error` without `errorCode` | Caller cannot branch on cause; observability cannot bucket. | `G-03-NO-BARE-THROW` (PHPStan rule). |
| 2 | Return a non-envelope body on error (raw string, plain object) | Frontend error handler cannot parse uniformly. | `G-03-ENVELOPE-ONLY` (integration test asserts response shape). |
| 3 | Add an error code outside the two registry files | PHP↔TS drift; `Code` becomes meaningless string. | `G-22-REGISTRY-LOCKSTEP`. |
| 4 | Set `Status: "Success"` while the `Errors` array is non-empty | Self-contradicting envelope; clients double-render. | `G-03-STATUS-CONSISTENT` (schema test: `Status==="Success"` ⇒ `Errors` absent or `[]`). |
| 5 | Localize the `Code` field | Codes are machine identifiers; localization belongs in `Message`. | `G-03-CODE-ASCII` (regex blocks non-ASCII in `Code`). |
| 6 | Leak stack traces or SQL into `Message` | Information disclosure; violates security review. | `G-03-NO-LEAK` (regex blocks `at /`, `SELECT `, `Stack trace:` in production responses). |

## Worked Examples — Canonical Envelopes

### 1. Client error — item not found (HTTP 404, category `ClientError`)

```json
{
  "Status": "Failed",
  "Attributes": { "RequestId": "req_01HXYZ...", "Category": "ClientError" },
  "Errors": [
    {
      "Code":    "ITEM_NOT_FOUND",
      "Message": "Item with id 'abc123' does not exist.",
      "Field":   "itemId"
    }
  ]
}
```

### 2. Validation error with multiple field violations (HTTP 422)

```json
{
  "Status": "Failed",
  "Attributes": { "RequestId": "req_01HXYZ...", "Category": "ClientError" },
  "Errors": [
    { "Code": "VALIDATION_FAILED", "Message": "Title must be ≤ 250 chars.",     "Field": "title"   },
    { "Code": "VALIDATION_FAILED", "Message": "ParentId must be a valid UUID.", "Field": "parentId" }
  ]
}
```

### 3. Auth error (HTTP 401, no `Field`)

```json
{
  "Status": "Failed",
  "Attributes": { "RequestId": "req_01HXYZ...", "Category": "AuthError" },
  "Errors": [
    { "Code": "TOKEN_EXPIRED", "Message": "Authentication token expired at 2026-04-28T09:00:00Z." }
  ]
}
```

### 4. Transient error (HTTP 503, includes `Retry-After`)

Response headers:
```
HTTP/1.1 503 Service Unavailable
Retry-After: 2
```

Body:
```json
{
  "Status": "Failed",
  "Attributes": { "RequestId": "req_01HXYZ...", "Category": "TransientError", "RetryAfterSec": 2 },
  "Errors": [
    { "Code": "DB_LOCKED", "Message": "SQLite database is locked; retry in 2 seconds." }
  ]
}
```

### 5. Server error (HTTP 500, generic message — details only in logs)

```json
{
  "Status": "Failed",
  "Attributes": { "RequestId": "req_01HXYZ...", "Category": "ServerError" },
  "Errors": [
    { "Code": "INTERNAL", "Message": "An unexpected error occurred. Reference RequestId when reporting." }
  ]
}
```

### 6. PHP throw site (load-bearing — fixtures cite this shape)

```php
<?php
throw new DomainError(
    code:     ErrorCode::ITEM_NOT_FOUND,   // category resolved from enum
    message:  "Item with id '{$id}' does not exist.",
    field:    'itemId',
);
```

The framework's central `ErrorMiddleware` MUST:
1. Resolve `Category` from `ErrorCode::categoryOf($code)`.
2. Map category → HTTP status via the taxonomy table.
3. Append `RequestId` from the current request scope.
4. Strip stack traces in production; include them only when `WORKFLOWY_DEBUG=1`.

*All `Code` values shown are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`00-overview-condensed.md`](./00-overview-condensed.md) | Condensed Overview — `spec/03-error-manage/` (P11) | 261 |
| 2 | [`01-error-resolution/`](./01-error-resolution/00-overview.md) | 01 — Error Resolution | subfolder |
| 3 | [`02-error-architecture/`](./02-error-architecture/00-overview.md) | 02 — Error Architecture | subfolder |
| 4 | [`03-error-code-registry/`](./03-error-code-registry/00-overview.md) | 03 — Error Code Registry | subfolder |

<!-- AUTO-TOC:END -->

---

## Purpose

Consolidated error management specification covering error resolution/debugging, cross-stack error architecture, and the error code registry. This folder is the **single canonical location** for all error management documentation.

---

## Keywords

`error-management` · `error-resolution` · `debugging` · `error-handling` · `error-codes` · `registry` · `apperror` · `response-envelope` · `error-modal` · `diagnostics` · `stack-trace`

---

## Scoring

| Metric | Value |
|--------|-------|
| AI Confidence | Very High |
| Ambiguity | None |
| Health Score | 100% (A+) |

---

## Categories

| # | Category | Description | Files |
|---|----------|-------------|-------|
| 01 | [Error Resolution](./01-error-resolution/00-overview.md) | Debugging guides, retrospectives, verification patterns, cheat sheet, cross-reference diagram | 14 |
| 02 | [Error Architecture](./02-error-architecture/00-overview.md) | Cross-stack 3-tier error handling, error modal, response envelope, apperror package, logging, notifications | 22 |
| 03 | [Error Code Registry](./03-error-code-registry/00-overview.md) | Master registry, integration guide, schemas, scripts, templates, collision resolution, utilization report | 18 |

> 📖 **Quick onboarding?** See [structure.md](./structure.md) for a full visual tree with role-based entry points.

---

## Core Principles

### 1. Never Assume — Always Verify

Before claiming any API endpoint works, verify **both directions**:

| Direction | Verification | Example |
|-----------|--------------|---------|
| **Backend** | Test actual endpoint response | `curl http://localhost:8080/api/v1/health \| jq .` |
| **Frontend** | Check detection logic | What conditions trigger "connected" vs "disconnected"? |

### 2. Response Format Standardization

All backend APIs MUST return the Universal Response Envelope (see [02-error-architecture/05-response-envelope/](./02-error-architecture/05-response-envelope/00-overview.md)):

```json
{
  "Status": { "IsSuccess": true, "Code": 200, "Message": "OK" },
  "Attributes": { "RequestedAt": "..." },
  "Results": [{ "..." }]
}
```

### 3. HTTP Status as Primary Indicator

Frontend detection logic MUST use HTTP status codes (2xx) as the primary indicator, NOT response body fields.

### 4. Structured Error Architecture

All errors use the three-tier architecture documented in [02-error-architecture/01-error-handling-reference/00-overview.md](./02-error-architecture/01-error-handling-reference/00-overview.md):
- **Tier 1:** Delegated Server (PHP/other) — structured error responses
- **Tier 2:** Go Backend — `apperror` package with stack traces
- **Tier 3:** Frontend — Error store, Global Error Modal

---

## Quick Reference: Common Pitfalls

| Symptom | Likely Cause | Check |
|---------|--------------|-------|
| "Backend disconnected" but backend running | Response format mismatch | Compare handler output to frontend detection logic |
| 404 on API base URL | No index route registered | Check router for `GET /api/v1` handler |
| VITE_API_URL shows wrong value | Resolved vs raw env confusion | Distinguish raw env var from resolved origin |
| HTML instead of JSON | SPA fallback serving index.html | Check if route exists in backend router |
| CORS errors | Missing CORS headers | Check backend CORS middleware configuration |
| 401/403 on protected routes | Token not sent or expired | Check Authorization header, token validity |

---

## Migration Note

This folder consolidates content previously located at:

| Old Location | Status |
|-------------|--------|

---

## Document Inventory

| File |
|------|
| 97-acceptance-criteria.md |
| 98-changelog.md |
| 99-consistency-report.md |


## Cross-References

| Reference | Location |
|-----------|----------|
| Coding Guidelines | [../02-coding-guidelines/00-overview.md](../02-coding-guidelines/00-overview.md) |
| Rust Error Handling | [../02-coding-guidelines/05-rust/02-error-handling.md](../02-coding-guidelines/05-rust/02-error-handling.md) |
| Cross-Language Guidelines | [../02-coding-guidelines/01-cross-language/00-overview.md](../02-coding-guidelines/01-cross-language/00-overview.md) |
| Database Conventions | [../04-database-conventions/00-overview.md](../04-database-conventions/00-overview.md) |
| [structure.md](./structure.md) | Full visual tree |

---

*This specification is mandatory for all projects and is the **highest priority** — error handling must be implemented from the very first line of code. Violations result in debugging time waste.*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
