# Standard Error Code Catalogue (SSOT)

> **Version:** 1.0.0
> **Updated:** 2026-04-26
> **Scope:** Central registry of every `ErrorCode` value that may appear in `Errors.Code` of the universal response envelope (see `04-response-envelope-reference.md`).
> **Status:** SSOT — any code emitted at runtime that is **not** listed here is a drift violation and MUST be caught by gate **G-22** (see `97-acceptance-criteria.md` AT-ERRCODE-08).

---

## 1 · Catalogue Schema

Each error code has the following six attributes. They are non-negotiable.

| Attribute | Type | Description |
|---|---|---|
| `Code` | `SCREAMING_SNAKE` string, prefix `ERR_` | Stable identifier — never reused, never renamed |
| `HttpStatus` | int (4xx / 5xx / 0) | Status the WP-plugin REST handler MUST return when emitting this code; `0` for non-HTTP (CLI/installer) codes |
| `Severity` | `info` \| `warn` \| `error` \| `fatal` | Drives client UI treatment (see §4) |
| `Retryable` | `never` \| `after-backoff` \| `after-user-action` | Client-retry contract (§5) |
| `Tier` | `runtime` \| `installer` \| `validation` \| `policy` \| `infra` | Originating subsystem (§3) |
| `MessageKey` | `errors.<dot.path>` | i18n lookup key — translation tables live in `spec/32-ui-design/04-i18n/` |

### 1.1 Naming rules

- Prefix: **`ERR_`** — mandatory, no exceptions.
- Body: `SCREAMING_SNAKE_CASE`, ASCII letters/underscores/digits only.
- Length: 6–48 characters total.
- No backend-runtime infixes (e.g. `ERR_GO_*`, `ERR_NODE_*` allowed **only** in the `installer` tier — runtime codes MUST be runtime-agnostic per `mem://constraints/backend-runtime-deferred`).
- Once shipped, a code is **append-only**: deprecate via §7, never repurpose.

---

## 2 · Severity Tiers

| Severity | Meaning | UI behavior (frontend SSOT) |
|---|---|---|
| `info` | Informational — request succeeded with a notable side effect | Toast, dismissible, 4 s |
| `warn` | Soft failure — partial result or recoverable degradation | Inline banner, dismissible |
| `error` | Hard failure — operation rejected, state unchanged | Modal or destructive toast, requires acknowledgement |
| `fatal` | Unrecoverable — session, data, or app integrity compromised | Full-screen ErrorBoundary, forces reload / re-auth |

Severity is intrinsic to the code and MUST NOT vary by call site.

---

## 3 · Tier Definitions

| Tier | Where emitted | Notes |
|---|---|---|
| `runtime` | WP-plugin REST endpoints, SSE events, client domain logic | Default tier for HTTP responses |
| `installer` | Local CLI / PowerShell bootstrap (see `spec/10-powershell-integration/`) | Excluded from G-22 HTTP gate; lives behind `HttpStatus = 0` |
| `validation` | Request-shape rejection (Zod / PHP form-validate) | Always `HttpStatus = 400`, `Severity = error` |
| `policy` | Quotas, rate-limits, retention, sharing rules | Always `Retryable = after-backoff` or `after-user-action` |
| `infra` | DB / filesystem / network primitives | Frequently `Severity = fatal` |

---

## 4 · Retryability Contract

| Value | Client behavior |
|---|---|
| `never` | Do not retry. Surface error and require user to alter input or abandon the action. |
| `after-backoff` | Retry per the rate-limiting interceptor schedule (`08-api-rate-limiting.md` §3.4). Cap: 3 attempts, exponential 1 s / 2 s / 4 s, ±20 % jitter. |
| `after-user-action` | Retry only after the user resolves the precondition (e.g. re-authenticate, free quota, fix conflict). Automatic retry is **forbidden**. |

---

## 5 · Canonical Catalogue (74 entries)

> Source: full sweep of `spec/` 2026-04-26. Sorted alphabetically. Codes flagged ⚠️ are deprecated/installer-only — see §7.

### 5.1 · Authentication & Authorization

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_UNAUTHENTICATED` | 401 | error | after-user-action | runtime | `errors.auth.unauthenticated` |
| `ERR_FORBIDDEN` | 403 | error | never | policy | `errors.auth.forbidden` |
| `ERR_FORBIDDEN_TOPIC` | 403 | error | never | policy | `errors.auth.forbidden_topic` |
| `ERR_NOT_ADMIN` | 403 | error | never | policy | `errors.auth.not_admin` |
| `ERR_INVALID_ROLE` | 400 | error | never | validation | `errors.auth.invalid_role` |
| `ERR_LAST_OWNER` | 409 | error | after-user-action | policy | `errors.auth.last_owner` |
| `ERR_DUPLICATE_GRANT` | 409 | warn | never | policy | `errors.auth.duplicate_grant` |
| `ERR_DUPLICATE_ASSIGNMENT` | 409 | warn | never | policy | `errors.auth.duplicate_assignment` |

### 5.2 · Validation (request shape)

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_INVALID_TYPE` | 400 | error | never | validation | `errors.validation.invalid_type` |
| `ERR_INVALID_NAME` | 400 | error | never | validation | `errors.validation.invalid_name` |
| `ERR_INVALID_EMAIL` | 400 | error | never | validation | `errors.validation.invalid_email` |
| `ERR_INVALID_TAG` | 400 | error | never | validation | `errors.validation.invalid_tag` |
| `ERR_INVALID_TIMEZONE` | 400 | error | never | validation | `errors.validation.invalid_timezone` |
| `ERR_INVALID_COLUMN` | 400 | error | never | validation | `errors.validation.invalid_column` |
| `ERR_INVALID_CURSOR` | 400 | error | never | validation | `errors.validation.invalid_cursor` |
| `ERR_INVALID_TRANSITION` | 409 | error | never | validation | `errors.validation.invalid_transition` |
| `ERR_EXTENSION` | 400 | error | never | validation | `errors.validation.extension` |
| `ERR_FORM_SIZE` | 413 | error | never | validation | `errors.validation.form_size` |
| `ERR_INI_SIZE` | 413 | error | never | validation | `errors.validation.ini_size` |

### 5.3 · Domain — Items / Tree

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_NOT_FOUND` | 404 | error | never | runtime | `errors.item.not_found` |
| `ERR_CYCLE` | 409 | error | never | runtime | `errors.tree.cycle` |
| `ERR_PARENT_FULL` | 409 | error | after-user-action | policy | `errors.tree.parent_full` |
| `ERR_ROOT_PROTECTED` | 409 | error | never | policy | `errors.tree.root_protected` |
| `ERR_LIMIT_EXCEEDED` | 409 | error | after-user-action | policy | `errors.tree.limit_exceeded` |
| `ERR_NOT_BOARD` | 409 | error | never | runtime | `errors.item.not_board` |
| `ERR_MIRROR_OF_MIRROR` | 409 | error | never | runtime | `errors.mirror.of_mirror` |
| `ERR_NOT_A_MIRROR` | 409 | error | never | runtime | `errors.mirror.not_a_mirror` |
| `ERR_RETENTION_EXPIRED` | 410 | warn | never | policy | `errors.trash.retention_expired` |
| `ERR_PARTIAL` | 207 | warn | after-backoff | runtime | `errors.batch.partial` |

### 5.4 · Policy — Rate, Quota, Concurrency

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_RATE_LIMITED` | 429 | warn | after-backoff | policy | `errors.policy.rate_limited` |

> Rate-limit envelope shape is fixed in `08-api-rate-limiting.md` §4.

### 5.5 · Configuration & Registry

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_CONFIG_MISSING` | 500 | fatal | never | infra | `errors.config.missing` |
| `ERR_CONFIG_NOT_FOUND` | 500 | fatal | never | infra | `errors.config.not_found` |
| `ERR_CONFIG_INVALID` | 500 | fatal | never | infra | `errors.config.invalid` |
| `ERR_CONFIG_INVALID_PATH` | 500 | fatal | never | infra | `errors.config.invalid_path` |
| `ERR_CONFIG_INVALID_PORT` | 500 | fatal | never | infra | `errors.config.invalid_port` |
| `ERR_CONFIG_MISSING_FIELD` | 500 | fatal | never | infra | `errors.config.missing_field` |
| `ERR_CONFIG_PARSE` | 500 | fatal | never | infra | `errors.config.parse` |
| `ERR_CONFIG_COPY_FAILED` | 0 | fatal | never | installer | `errors.installer.config_copy_failed` |
| `ERR_REGISTRY_NOT_FOUND` | 500 | fatal | never | infra | `errors.registry.not_found` |
| `ERR_REGISTRY_PARSE_FAILED` | 500 | fatal | never | infra | `errors.registry.parse_failed` |
| `ERR_REGISTRY_DUPLICATE_PREFIX` | 500 | fatal | never | infra | `errors.registry.duplicate_prefix` |
| `ERR_REGISTRY_RANGE_INVALID` | 500 | fatal | never | infra | `errors.registry.range_invalid` |

### 5.6 · Filesystem & I/O

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_NO_FILE` | 0 | error | never | installer | `errors.io.no_file` |
| `ERR_NO_TMP_DIR` | 0 | fatal | never | installer | `errors.io.no_tmp_dir` |
| `ERR_PATH_NOT_FOUND` | 0 | error | never | installer | `errors.io.path_not_found` |
| `ERR_CANT_WRITE` | 0 | error | never | installer | `errors.io.cant_write` |
| `ERR_COPY_FAILED` | 0 | error | never | installer | `errors.io.copy_failed` |
| `ERR_COPY_DIST_FAILED` | 0 | error | never | installer | `errors.io.copy_dist_failed` |
| `ERR_CLEAN_FAILED` | 0 | error | never | installer | `errors.io.clean_failed` |
| `ERR_DIST_NOT_CREATED` | 0 | fatal | never | installer | `errors.io.dist_not_created` |

### 5.7 · Installer & Toolchain (HttpStatus = 0)

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_PREREQUISITES` | 0 | fatal | after-user-action | installer | `errors.installer.prerequisites` |
| `ERR_MODULE_NOT_FOUND` | 0 | fatal | after-user-action | installer | `errors.installer.module_not_found` |
| `ERR_BACKEND_DIR_NOT_FOUND` | 0 | fatal | after-user-action | installer | `errors.installer.backend_dir_not_found` |
| `ERR_MAIN_GO_NOT_FOUND` ⚠️ | 0 | fatal | never | installer | `errors.installer.main_go_not_found` |
| `ERR_GO_NOT_IN_PATH` ⚠️ | 0 | fatal | after-user-action | installer | `errors.installer.go_not_in_path` |
| `ERR_GO_INSTALL_FAILED` ⚠️ | 0 | error | after-user-action | installer | `errors.installer.go_install_failed` |
| `ERR_GO_BUILD_FAILED` ⚠️ | 0 | error | after-user-action | installer | `errors.installer.go_build_failed` |
| `ERR_GO_RUN` ⚠️ | 0 | error | after-user-action | installer | `errors.installer.go_run` |
| `ERR_GO_RUN_FAILED` ⚠️ | 0 | error | after-user-action | installer | `errors.installer.go_run_failed` |
| `ERR_NPM_NOT_IN_PATH` | 0 | fatal | after-user-action | installer | `errors.installer.npm_not_in_path` |
| `ERR_NPM_INSTALL` | 0 | error | after-user-action | installer | `errors.installer.npm_install` |
| `ERR_NPM_INSTALL_FAILED` | 0 | error | after-user-action | installer | `errors.installer.npm_install_failed` |
| `ERR_NPM_BUILD` | 0 | error | after-user-action | installer | `errors.installer.npm_build` |
| `ERR_NPM_BUILD_FAILED` | 0 | error | after-user-action | installer | `errors.installer.npm_build_failed` |
| `ERR_NODE_INSTALL_FAILED` | 0 | error | after-user-action | installer | `errors.installer.node_install_failed` |
| `ERR_WINGET_NOT_FOUND` | 0 | error | after-user-action | installer | `errors.installer.winget_not_found` |
| `ERR_FIREWALL` | 0 | error | after-user-action | installer | `errors.installer.firewall` |
| `ERR_FIREWALL_CMDLET` | 0 | error | after-user-action | installer | `errors.installer.firewall_cmdlet` |
| `ERR_FIREWALL_RULE_FAILED` | 0 | error | after-user-action | installer | `errors.installer.firewall_rule_failed` |

### 5.8 · Git / VCS

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_NOT_GIT_REPO` | 0 | fatal | after-user-action | installer | `errors.git.not_a_repo` |
| `ERR_GIT_FAILED` | 0 | error | after-backoff | installer | `errors.git.failed` |
| `ERR_GIT_PULL_FAILED` | 0 | error | after-backoff | installer | `errors.git.pull_failed` |
| `ERR_GIT_CONFLICT` | 0 | error | after-user-action | installer | `errors.git.conflict` |

### 5.9 · Reserved / Sentinel

| Code | HttpStatus | Severity | Retryable | Tier | MessageKey |
|---|---|---|---|---|---|
| `ERR_OK` | 200 | info | never | runtime | `errors.sentinel.ok` |

> `ERR_OK` is reserved as the explicit no-error sentinel for batch endpoints whose `Results[]` items each carry an `ErrorCode`. It MUST NOT appear in top-level `Errors`.

---

## 6 · Emission Rules (backend SSOT)

1. **Single source.** Every WP-plugin REST handler MUST emit error codes via the central `Auth::error($code, $context)` helper (see `spec/31-app/05-conventions/` PHP boundary). Direct string literals are forbidden — gate **G-22** rejects them.
2. **One code per response.** `Errors.Code` is a single string, never an array. Multiple sub-errors live in `Errors.Details[]` (see envelope §3.5).
3. **HttpStatus parity.** The HTTP status set by the handler MUST equal `HttpStatus` in this catalogue. Mismatch → G-22 violation.
4. **No silent additions.** Adding a new code requires (a) a row in §5, (b) a translation key, and (c) a backfilled acceptance test under `97-acceptance-criteria.md`.

---

## 7 · Deprecation Procedure

A code MAY be deprecated but never deleted.

1. Mark the row with ⚠️ and add a `Deprecated: <ISO date>` note in the message-key payload.
2. Add a `Replacement:` pointer if a successor code exists; leave blank for terminal removal.
3. Backend SHOULD stop emitting it; frontend MUST still recognise it for one full minor version.
4. Removal from §5 is forbidden until the code has been absent from emission for two consecutive minor releases.

**Currently deprecated (Go-toolchain, post WP-plugin decision 2026-04-25):**
`ERR_MAIN_GO_NOT_FOUND`, `ERR_GO_NOT_IN_PATH`, `ERR_GO_INSTALL_FAILED`, `ERR_GO_BUILD_FAILED`, `ERR_GO_RUN`, `ERR_GO_RUN_FAILED` — retained only for legacy installer logs; will be removed in v0.40.0.

---

## 8 · Frontend Contract

- The Axios response interceptor MUST switch on `Errors.Code` (never on `Status.Message`).
- Unknown codes (not in §5) MUST be funnelled through `ERR_UNKNOWN` in the UI layer **without** silently mapping them to a known code. They are simultaneously logged to the analytics channel for catalogue back-fill.
- i18n lookups MUST use `MessageKey` — raw English strings from the backend are debug-only and never user-facing.

---

## 9 · Gate G-22 (Catalogue Drift)

| Gate ID | Trigger | Action |
|---|---|---|
| **G-22** | Any `ERR_*` literal in source code or spec that is not in §5 | CI fails with diff of unregistered codes |

Algorithm SSOT lives at [`spec/31-app/05-conventions/15-g22-error-code-catalogue-gate.md`](../../../31-app/05-conventions/15-g22-error-code-catalogue-gate.md). Implementation will live at `scripts/spec-hygiene/22-check-error-code-catalogue.mjs` (numeric prefix matches gate ID, per the convention used by G-19→`19-`, G-20→`20-`, G-21→`21-`); registration in [`spec/31-app/05-conventions/02-ci-quality-gates.md`](../../../31-app/05-conventions/02-ci-quality-gates.md).

---

## 10 · Acceptance Tests

See `spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md` §ERRCODE for `AT-ERRCODE-01..10`.

---

## 11 · Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-26 | Initial SSOT — 74 codes catalogued, 6 Go-toolchain codes deprecated, G-22 gate proposed. |
| 1.0.1 | 2026-04-27 | §9 path correction — implementation slot moved from `12-` (collision with `check-required-files`) to `22-` (matches gate ID). Algorithm SSOT linked: `spec/31-app/05-conventions/15-g22-error-code-catalogue-gate.md`. |
