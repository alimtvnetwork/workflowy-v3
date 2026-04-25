# Retry, Debounce & Deduplication Fixes — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RETRYDEBOUNCEDEDUPFIXES-01` … `AT-RETRYDEBOUNCEDEDUPFIXES-14`

---

## Criteria

### React Query retry (file 01, §1–2)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETRYDEBOUNCEDEDUPFIXES-01 | The global `QueryClient` sets `retry: false` (or a typed bounded retry policy with documented max + delay); the default infinite-retry behavior is forbidden across the codebase. | [`01-react-query-retry-fixes.md`](./01-react-query-retry-fixes.md) §1 |
| AT-RETRYDEBOUNCEDEDUPFIXES-02 | Window-focus refetch is **disabled by default** (`refetchOnWindowFocus: false`); per-query opt-in must declare a stale-time and is reviewed individually. | [`01-react-query-retry-fixes.md`](./01-react-query-retry-fixes.md) §2 |

### Publish dedup & cooldown (file 02, §3–4)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETRYDEBOUNCEDEDUPFIXES-03 | The publish endpoint is wrapped in an **API-level dedup lock** keyed by `(userId, payloadHash)` — concurrent calls within the lock window resolve to the same in-flight promise. | [`02-publish-dedup-and-cooldown.md`](./02-publish-dedup-and-cooldown.md) §3 |
| AT-RETRYDEBOUNCEDEDUPFIXES-04 | A **post-publish cooldown** of N seconds (documented in §4) prevents re-trigger; the cooldown is server-side AND surfaced to the UI as a disabled state with countdown. | [`02-publish-dedup-and-cooldown.md`](./02-publish-dedup-and-cooldown.md) §4 |

### WebSocket listener fixes (file 03, §5)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETRYDEBOUNCEDEDUPFIXES-05 | WebSocket listeners are registered in a `useEffect` with a **stable cleanup** that removes the exact handler reference; closures capturing stale state are forbidden. | [`03-websocket-listener-fixes.md`](./03-websocket-listener-fixes.md) §5 |
| AT-RETRYDEBOUNCEDEDUPFIXES-06 | `PublishProgressDialog` mounts at most ONE active subscription per session; remount during an in-flight publish reuses the existing subscription via a singleton ref. | [`03-websocket-listener-fixes.md`](./03-websocket-listener-fixes.md) §5 |

### Toast, circuit breaker, snapshot suppression (file 04, §6–8)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETRYDEBOUNCEDEDUPFIXES-07 | Toast notifications are **deduplicated** by `(level, code, message)` within a sliding window (default 3 s); identical toasts within the window are dropped, not stacked. | [`04-toast-and-circuit-breaker.md`](./04-toast-and-circuit-breaker.md) §6 |
| AT-RETRYDEBOUNCEDEDUPFIXES-08 | A **circuit breaker** opens after N consecutive failures of the same endpoint (documented threshold) and stays open for the documented cooldown; calls during open state short-circuit with a typed `CircuitOpenError`. | [`04-toast-and-circuit-breaker.md`](./04-toast-and-circuit-breaker.md) §7 |
| AT-RETRYDEBOUNCEDEDUPFIXES-09 | Snapshot queries that fail consecutively suppress automatic retry (per §8); manual user retry resets the suppression counter. | [`04-toast-and-circuit-breaker.md`](./04-toast-and-circuit-breaker.md) §8 |

### Anti-patterns & file ownership (file 05, §9)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETRYDEBOUNCEDEDUPFIXES-10 | The anti-patterns list in §9 is enforceable: each row names the forbidden pattern, the symptom, and the spec section that defines the replacement. | [`05-anti-patterns-and-files.md`](./05-anti-patterns-and-files.md) §9 |
| AT-RETRYDEBOUNCEDEDUPFIXES-11 | The "Files Involved" table in §05 lists every concrete artifact the retro touched (publish API, dedup lock module, ws listener hook, toast hook, circuit breaker, snapshot suppression); cross-ref hygiene resolves every name. | [`05-anti-patterns-and-files.md`](./05-anti-patterns-and-files.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETRYDEBOUNCEDEDUPFIXES-12 | Every dedup/cooldown/retry policy is configurable via a single typed `RetryPolicy` value object (max attempts, base delay, jitter, max delay, cooldown ms); raw numeric literals scattered in business logic fail review. | [`02-publish-dedup-and-cooldown.md`](./02-publish-dedup-and-cooldown.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-RETRYDEBOUNCEDEDUPFIXES-13 | The retro structure follows the parent retrospectives format — Symptom → Root Cause → Detection → Fix → Prevention → Lessons — and references at minimum one error code per section. | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) (`AT-RETROSPECTIVES-01..03`) |
| AT-RETRYDEBOUNCEDEDUPFIXES-14 | The TOC in `00-overview.md` is the canonical numbering source (§1–§9); section anchors in topic files MUST match the numbers and slugs listed in the TOC. | [`00-overview.md`](./00-overview.md) "Table of Contents (canonical mapping)" |

---

## Verification

```bash
# QueryClient retry policy
rg -n 'new QueryClient\(|retry:\s*(true|\d+|false)' --type ts --type tsx src/

# refetchOnWindowFocus must be false (or explicit per-query opt-in)
rg -n 'refetchOnWindowFocus' --type ts --type tsx src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Retrospectives rollup (`AT-RETROSPECTIVES-NN`)
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../../02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack handling

---

*Curated 2026-04-25 — closes A-19 (batch 8).*
