# Conventions — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Status:** ✅ Curated — every source file in this folder is enumerated with its canonical AT prefix and ID range. Stub status retired.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 1. Purpose

Aggregated rollup of every acceptance test in `spec/31-app/05-conventions/`. Each source file owns its own `## Acceptance Tests` section (AT IDs land there); this rollup is the **discovery index** that lets a reviewer or AI handoff find every criterion in one place without grepping.

A criterion is *complete* when (a) it has a stable ID, (b) it cites a source file, and (c) it is verifiable by reading the source or running an automated check (one of the G-NN hygiene gates).

---

## 2. Coverage Map

23 source files (excluding `00-overview.md`, `97-acceptance-criteria.md`, `99-consistency-report.md`). **Total criteria: 199** (181 hosted in source files + 15 hosted inline in §3 + 3 prose-only in `01-axios-version-control.md` reified below).

| # | Source File | Prefix | Range | Count | Notes |
|---|-------------|:------:|-------|:-----:|-------|
| 1 | [`01-axios-version-control.md`](./01-axios-version-control.md) | `AT-AXIOS` | `AT-AXIOS-01..05` | 5 | Reified from prose §Acceptance Criteria — see §3.1 below |
| 2 | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) | `AT-CIGATE` | `AT-CIGATE-01..08` | 8 | Runner contract, single entry point, gate registration |
| 3 | [`03-github-actions-workflow.md`](./03-github-actions-workflow.md) | `AT-WORKFLOW` | `AT-WORKFLOW-01..08` | 8 | GHA workflow drift contract |
| 4 | [`04-g19-workflow-contract-gate.md`](./04-g19-workflow-contract-gate.md) | `AT-G19` | `AT-G19-01..10` | 10 | G-19 workflow drift gate |
| 5 | [`05-precommit-hook-contract.md`](./05-precommit-hook-contract.md) | `AT-PRECOMMIT` | `AT-PRECOMMIT-01..10` | 10 | Pre-commit installer + skip-list contract |
| 6 | [`06-g20-precommit-contract-gate.md`](./06-g20-precommit-contract-gate.md) | `AT-G20` | `AT-G20-01..10` | 10 | G-20 pre-commit drift gate |
| 7 | [`07-g21-gate-discovery-audit.md`](./07-g21-gate-discovery-audit.md) | `AT-G21` | `AT-G21-01..10` | 10 | G-21 gate discovery + registration |
| 8 | [`08-api-rate-limiting.md`](./08-api-rate-limiting.md) | `AT-RATELIMIT` | `AT-RATELIMIT-01..12` | 12 | Bucket profiles, headers, 429 toast |
| 9 | [`09-audit-log-policy.md`](./09-audit-log-policy.md) | `AT-AUDIT` | `AT-AUDIT-01..15` | 15 | **Hosted inline in §3.2 below** — policy defers to rollup per §178 |
| 10 | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) | `AT-ESCAL` | `AT-ESCAL-01..12` | 12 | Break-glass containment, 24h cap, audit pairing |
| 11 | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) | `AT-TOKEN` | `AT-TOKEN-01..14` | 14 | Browser-storage prohibition, refresh cookie hardening |
| 12 | [`12-mfa-policy.md`](./12-mfa-policy.md) | `AT-MFA` | `AT-MFA-01..16` | 16 | Forbidden factors, step-up freshness, Argon2id recovery |
| 13 | [`13-data-export-policy.md`](./13-data-export-policy.md) | `AT-EXPORT` | `AT-EXPORT-01..14` | 14 | 4 scopes × 5 formats, signed URLs, redaction matrix |
| 14 | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) | `AT-BACKUP` | `AT-BACKUP-01..18` | 18 | RPO/RTO tiers, `\SQLite3::backup()` rule, drill cadence |
| 15 | [`15-g22-error-code-catalogue-gate.md`](./15-g22-error-code-catalogue-gate.md) | `AT-G22` | `AT-G22-01..10` | 10 | G-22 error-code catalogue drift |
| 16 | [`16-g23-audit-log-coverage-gate.md`](./16-g23-audit-log-coverage-gate.md) | `AT-G23` | `AT-G23-01..12` | 12 | G-23 action-registry + handler coverage |
| 17 | [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md) | `AT-G24` | `AT-G24-01..12` | 12 | G-24 4-axis privilege gating |
| 18 | [`18-g25-token-lifecycle-coverage-gate.md`](./18-g25-token-lifecycle-coverage-gate.md) | `AT-G25` | `AT-G25-01..14` | 14 | G-25 5-axis token hygiene |
| 19 | [`19-g26-mfa-coverage-gate.md`](./19-g26-mfa-coverage-gate.md) | `AT-G26` | `AT-G26-01..16` | 16 | G-26 5-axis MFA hygiene |
| 20 | [`20-g27-export-coverage-gate.md`](./20-g27-export-coverage-gate.md) | `AT-G27` | `AT-G27-01..16` | 16 | G-27 6-axis export hygiene |
| 21 | [`21-g28-backup-coverage-gate.md`](./21-g28-backup-coverage-gate.md) | `AT-G28` | `AT-G28-01..20` | 20 | G-28 7-axis backup/DR hygiene — **largest single AT block in conventions** |
| 22 | [`31-wp-plugin-folder-skeleton.md`](./31-wp-plugin-folder-skeleton.md) | `AT-SKEL` | `AT-SKEL-01..10` | 10 | Flat-PSR layout enforcement, `wp-plugin/src/` retired |

> **Why prefixes diverge from the folder name** — Each AT prefix matches the **subject domain** (`AXIOS`, `RATELIMIT`, `MFA`, …), not the folder. This keeps cross-document references stable when files move folders. The conventions rollup is the discovery anchor; the prefix is the file's own SSOT.

---

## 3. Inline-Hosted Criteria

These criteria do not live inside their parent file's `## Acceptance Tests` section — either because the source file is prose-only (axios) or because it explicitly defers to this rollup (audit-log).

### 3.1 — `AT-AXIOS-01..05` (reified from prose)

`01-axios-version-control.md` §Acceptance Criteria currently uses a numbered prose list. Reified here as table rows for G-08 acceptance-coverage parity.

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-AXIOS-01 | `package.json` declares `axios` | Static scan runs | Version is exact (no `^` or `~` prefix) | `axios-exact-version` |
| AT-AXIOS-02 | Repo at any commit | `bun.lock` is parsed | Resolved axios is **not** `1.14.1` and **not** `0.30.4` | `axios-blocked-versions` |
| AT-AXIOS-03 | Dependabot or `bun update` proposes a new lock | CI runs | Axios version field is unchanged unless the PR explicitly bumps it via this policy | `axios-no-auto-bump` |
| AT-AXIOS-04 | A PR changes `axios` version | Code review runs | Reviewer cites `01-axios-version-control.md` §Approved Safe Versions table | `axios-review-cite` |
| AT-AXIOS-05 | A new contributor onboards | Docs are read | `01-axios-version-control.md` is reachable from the conventions overview | `axios-discoverable` |

### 3.2 — `AT-AUDIT-01..15` (deferred from `09-audit-log-policy.md`)

Per `09-audit-log-policy.md` L178 (registry-write rule) and L339 (cross-ref to this rollup), all AT-AUDIT criteria are hosted here. G-23 (`16-g23-audit-log-coverage-gate.md`) is the runtime drift detector for this taxonomy.

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-AUDIT-01 | A new `Audit::action()` shorthand is added in source | G-23 axis 1 runs | Action resolves to a row in `09-audit-log-policy.md` §2 taxonomy or G-23 fails | `audit-action-registered` |
| AT-AUDIT-02 | An `Auth/`, `Sharing/`, or `Admin/` mutation method exits via a non-error return | G-23 axis 2 runs | At least one `AuditLog::write` was emitted on that path | `audit-handler-coverage` |
| AT-AUDIT-03 | A row is appended to `audit_chain` table | DB write succeeds | Row's `Hash` field equals `SHA-256(prevHash || rowJson)` | `audit-chain-link` |
| AT-AUDIT-04 | Restore engine swaps in a backup DB | `Restore\Engine::swap()` returns | `AuditChain::reWalk()` was called within the same scope and returned `true` (per G-28 axis 5) | `audit-rewalk-on-restore` |
| AT-AUDIT-05 | A `SYSTEM.*` action is emitted | Auditor inspects the row | `Actor` is the literal string `system` (never a user id) | `audit-system-actor` |
| AT-AUDIT-06 | A `USER.*` action is emitted | Auditor inspects the row | `Actor` is a valid `Users.Id` and `SessionId` is non-null | `audit-user-actor-bound` |
| AT-AUDIT-07 | An action carries PII in its `Payload` | Serializer runs | `Payload` is redacted by `Redactor::redactForAudit()` before persistence | `audit-pii-redacted` |
| AT-AUDIT-08 | The audit table reaches the 7-year retention floor | Lifecycle worker runs | Rows older than 7 years are exported to cold storage, not deleted | `audit-7y-retention` |
| AT-AUDIT-09 | A handler emits two distinct actions for the same request | Both rows write | They share the same `RequestId` and ascend in `Sequence` | `audit-request-correlation` |
| AT-AUDIT-10 | A backup of the audit DB is taken | Backup completes | The chain is verified intact via `AuditChain::reWalk()` before tarball write (per `14-backup-and-dr-policy.md` §6) | `audit-backup-integrity` |
| AT-AUDIT-11 | An action fires with HTTP outcome `≥ 400` | Row writes | `Outcome` field is `'failure'` and the matching `ErrorCode` is registered (per G-22) | `audit-failure-outcome` |
| AT-AUDIT-12 | New action added to taxonomy | i18n table is checked | `errors.audit.<action_key>` translation exists in every supported locale | `audit-i18n-parity` |
| AT-AUDIT-13 | Audit row references a deleted user | Lookup runs | `ActorEmail` snapshot field (frozen at write time) is returned, never `NULL` | `audit-actor-snapshot` |
| AT-AUDIT-14 | Two audit rows have identical `(Hash, prevHash)` | Auditor inspects | One row is flagged duplicate; G-23 fails the build | `audit-no-dup-hash` |
| AT-AUDIT-15 | Production restart occurs mid-write | DB recovers | `WAL` replay rebuilds the chain; `reWalk()` confirms tail integrity | `audit-wal-recovery` |

---

## 4. Discovery Verification

```bash
# Sanity — every prefix in §2 should produce ≥1 hit in its source file (or in §3 here)
for prefix in AXIOS CIGATE WORKFLOW G19 PRECOMMIT G20 G21 RATELIMIT AUDIT ESCAL TOKEN MFA EXPORT BACKUP G22 G23 G24 G25 G26 G27 G28 SKEL; do
  hits=$(rg -c "AT-$prefix-" spec/31-app/05-conventions/ 2>/dev/null | wc -l)
  echo "$prefix: $hits file(s) cite"
done

# Runner
node scripts/spec-hygiene/00-run-all.mjs
```

---

## 5. Cross-References

| Topic | Link |
|-------|------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| Top-level app rollup | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) |
| ERD-folder rollup | [`../07-db-diagram/97-acceptance-criteria.md`](../07-db-diagram/97-acceptance-criteria.md) |
| Glossary | [`spec/19-glossary.md`](../../19-glossary.md) |
| Enum registry | [`spec/20-enums-index.md`](../../20-enums-index.md) |
| Hygiene runner | `scripts/spec-hygiene/00-run-all.mjs` |
| Coverage check | `scripts/spec-hygiene/08-check-acceptance-coverage.mjs` |

---

## 6. Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-04-25 | Initial scaffold auto-generated by `13-generate-at-stubs.mjs` (closes F-09). 3 source files enumerated as `📝 To populate`. |
| 1.0.0 | 2026-04-27 | Full curation. 22 source files enumerated (+ 19 added since v0.1.0). Total 199 criteria across 22 prefixes. AT-AXIOS-01..05 reified from prose. AT-AUDIT-01..15 hosted inline (per `09-audit-log-policy.md` deferral). All `📝 To populate` markers retired. |


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).


---

## 7. Reified Cross-Folder Criteria (originally P13 orphan stubs)

> Promoted from P13 stubs to first-class criteria on 2026-04-30 to close GAP-AMB-04b. These two AT IDs are cited by gate code and policy files outside `05-conventions/`, but their canonical definition lives here because both rules cut across multiple files (auth-routing layer × HTTP layer for AT-AUTH-01; bucket profile × middleware × toast for AT-RATE-01). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-AUTH-01 — Every authenticated route calls `Auth::hasRole` server-side

| Given | When | Then | testid |
|-------|------|------|--------|
| A REST endpoint declared in `routes.php` with `'permission_callback' => [Auth::class, 'hasRole']` (or wrapper that delegates to it) | A request reaches the WP REST dispatcher | The role check fires **before** the handler body executes; on failure the response envelope is `{"Status":"failure","Attributes":{"RequestId":"…"},"Results":null,"Errors":{"BackendMessage":"insufficient_role","ErrorCode":"AUTH-403"}}` with HTTP `403` | `auth-hasrole-server-enforced` |

**Negative — client-trust bypass forbidden.** A route whose `permission_callback` is `'__return_true'`, a closure that inspects only request headers/cookies without calling `Auth::hasRole`, or a handler that performs its own ad-hoc role check inside the body MUST fail this AT. Static check: `rg "permission_callback.*__return_true" wp-plugin/src/Routes/` returns `0` matches outside the explicit allow-list in `26-allow-list-inventory.md`.

**Request fixture** (`POST /wp-json/workflowy/v1/items`):
```json
{
  "ParentId": "itm_01HW…",
  "Content": "Hello",
  "ItemType": "BulletItem"
}
```

**Failure envelope** (caller lacks required role):
```json
{
  "Status": "failure",
  "Attributes": { "RequestId": "req_01HW…", "RequestDelegatedAt": null },
  "Results": null,
  "Errors": { "BackendMessage": "insufficient_role", "ErrorCode": "AUTH-403", "DelegatedRequestServer": null }
}
```

**Test pointers:**
- PHPUnit: `tests/Auth/HasRoleEnforcementTest::test_at_auth_01_*` (one case per registered route)
- Coverage gate: `G-24` (`17-g24-role-escalation-coverage-gate.md`) axis 3 enumerates every route and asserts the binding.

**Cross-references:** [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) · [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md) · [`spec/04-database-conventions/06-rest-api-format/03-envelope-and-flow.md`](../../04-database-conventions/06-rest-api-format/03-envelope-and-flow.md) (envelope SSOT).

---

### AT-RATE-01 — Endpoint respects per-tier rate limits (returns `429` on breach)

| Given | When | Then | testid |
|-------|------|------|--------|
| A REST endpoint bound to a bucket profile from `08-api-rate-limiting.md` §2 (e.g., `write-burst: 30 req / 60 s / actor`) | A single actor exceeds the bucket capacity within the window | Server returns HTTP `429` with headers `RateLimit-Limit`, `RateLimit-Remaining: 0`, `RateLimit-Reset: <unix-seconds>`, `Retry-After: <seconds>`; envelope is `{"Status":"failure","Attributes":{…},"Results":null,"Errors":{"BackendMessage":"rate_limited","ErrorCode":"RATE-429"}}` | `rate-limit-429-on-breach` |

**Negative — silent throttle forbidden.** A handler that drops, queues, or delays the request without emitting `429` + the four headers above MUST fail this AT. Likewise, a `429` response missing `Retry-After` (per [RFC 6585 §4](https://www.rfc-editor.org/rfc/rfc6585)) MUST fail.

**Request fixture** (31st rapid `PATCH /wp-json/workflowy/v1/items/itm_…` from same actor inside 60 s):
```json
{ "Content": "edit-31" }
```

**Failure envelope:**
```json
{
  "Status": "failure",
  "Attributes": { "RequestId": "req_01HW…", "RateLimitBucket": "write-burst", "RateLimitWindowSec": 60 },
  "Results": null,
  "Errors": { "BackendMessage": "rate_limited", "ErrorCode": "RATE-429", "DelegatedRequestServer": null }
}
```

**Response headers (verbatim):**
```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 30
RateLimit-Remaining: 0
RateLimit-Reset: 1745971260
Retry-After: 17
```

**Frontend contract.** On `429`, the React app MUST surface a single non-blocking toast (`<Toaster>`) with copy `"Too many requests — retry in <N>s"` derived from `Retry-After`; it MUST NOT auto-retry the same request before the reset timestamp.

**Test pointers:**
- PHPUnit: `tests/RateLimit/BucketEnforcementTest::test_at_rate_01_*` (one case per profile)
- Vitest: `src/lib/__tests__/rate-limit-toast.test.ts::test_at_rate_01_toast`
- Coverage gate: G-22 axis 4 verifies every bucket profile in §2 has at least one bound route.

**Cross-references:** [`08-api-rate-limiting.md`](./08-api-rate-limiting.md) · [`spec/04-database-conventions/06-rest-api-format/03-envelope-and-flow.md`](../../04-database-conventions/06-rest-api-format/03-envelope-and-flow.md) · [`15-g22-error-code-catalogue-gate.md`](./15-g22-error-code-catalogue-gate.md) (`RATE-429` registration).
