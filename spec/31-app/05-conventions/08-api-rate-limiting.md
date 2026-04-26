# API Rate-Limiting Policy — SSOT

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Closes:** A-36 (first of the policy cluster A-36..A-42)
> **Origin:** No rate-limiting reference existed anywhere under `spec/31-app/` before this file. The WordPress-plugin backend (per `mem://constraints/backend-runtime-deferred`) has no built-in throttling, so this policy is the contract that the plugin and the React client must both implement.

---

## Overview

This document is the **Single Source of Truth** for how the API rejects, slows, and recovers from excessive request volume. It defines the budget per identity, the response shape when the limit is hit, the headers every successful response must carry, and the client-side behaviour that respects the budget.

There is exactly **one** rate-limiting policy. Every endpoint defined in [`../06-endpoints/`](../06-endpoints/) inherits it; per-endpoint overrides are documented in [Endpoint-Specific Buckets](#endpoint-specific-buckets) below.

---

## User Story

As an authenticated user, I want the system to clearly tell me when I am sending too many requests and how long to wait, so that the client can pause and recover instead of failing silently or spamming the server during transient bursts.

---

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| Authenticated user ID | Session cookie / WP nonce per `mem://architecture/tech-stack` | Primary bucket key |
| Client IP address | `REMOTE_ADDR` (after WP reverse-proxy headers) | Fallback bucket key for unauthenticated requests |
| Endpoint identifier | Routed path from REST router | Used to select the bucket profile |
| Server clock | Monotonic, second-precision | Drives the sliding-window counter |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| `X-RateLimit-Limit` header | ❌ | HTTP response | Total requests allowed in the window |
| `X-RateLimit-Remaining` header | ❌ | HTTP response | Requests left in the current window |
| `X-RateLimit-Reset` header | ❌ | HTTP response | UNIX-seconds timestamp when the window rolls |
| `Retry-After` header | ❌ | HTTP 429 response | Seconds the client should wait |
| `ERR_RATE_LIMITED` error code | ❌ | Standard error envelope | `Status=error`, `Errors[0].Code=ERR_RATE_LIMITED` |
| Bucket counter | ✅ SQLite | `RateLimitBuckets(BucketKey, Endpoint, WindowStart, Count)` table | Persisted so a process restart does not reset budgets |

---

## Bucket Model

Three independent buckets per identity, summed and evaluated separately:

| Bucket | Window | Default budget | Rationale |
|--------|--------|----------------|-----------|
| **Burst** | 10 seconds | 30 requests | Catches accidental loops in client code |
| **Sustained** | 60 seconds | 120 requests | Normal interactive use never approaches this |
| **Hourly** | 3600 seconds | 3 000 requests | Backstop against runaway scripts and Trash mass-delete loops |

A request is allowed iff **all three** buckets have remaining capacity. The 429 response cites the **most-restrictive** bucket in `Retry-After`.

### Identity Selection

| Caller type | Bucket key | Notes |
|-------------|-----------|-------|
| Authenticated user | `user:<UserId>` | Survives across devices for the same account |
| Anonymous (public share read) | `ip:<RemoteAddr>` | Coarse but sufficient for guest reads |
| Server-to-server (future) | `service:<ServiceName>` | Not used in Phase 1; documented for forward-compatibility |

Buckets are **never combined** across keys (a logged-in user does not consume the IP bucket for the same address).

---

## Endpoint-Specific Buckets

Some endpoints have heavier or lighter cost. Where the bucket profile differs, the row below overrides the default.

| Endpoint | Profile | Notes |
|----------|---------|-------|
| `EP-ITEMS-LIST` | Default | The 250-item cap (per `01-information-model.md`) is the natural throttle |
| `EP-ITEMS-CREATE` | Default | Single-row insert |
| `EP-ITEMS-UPDATE` | Default | LWW conflict resolution per §14.4 |
| `EP-ITEMS-MOVE` | Default | Includes cycle-check; cost bounded per `09a-mirror-cycle-detection.md` complexity table |
| `EP-ITEMS-DELETE` | **Heavy** — 10 burst / 30 sustained / 600 hourly | Mass-delete from Trash can recurse over a subtree; a tighter cap blunts accidental wipes |
| `EP-ITEMS-ROOT` | **Light** — 5 burst / 10 sustained / 60 hourly | Called once per page load; should not need more |
| Search endpoints (when added) | **Heavy** — 10 burst / 30 sustained / 300 hourly | Full-text scans are expensive |

---

## Response Contract

### Successful response (any 2xx)

```
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 117
X-RateLimit-Reset: 1745692380
```

The header values reflect the **most-restrictive** bucket of the three. A future header `X-RateLimit-Bucket` may name which bucket produced the values; out of scope for Phase 1.

### Rejected response (HTTP 429)

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 7
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1745692307

{
  "Status": "error",
  "Attributes": {},
  "Errors": [{
    "Code": "ERR_RATE_LIMITED",
    "Message": "Rate limit exceeded. Retry in 7 seconds.",
    "Details": {
      "Bucket": "burst",
      "Limit": 30,
      "RetryAfterSeconds": 7
    }
  }],
  "Results": null
}
```

The envelope follows the PascalCase contract per `mem://architecture/tech-stack`.

---

## Client Behaviour Contract

The React client (per `mem://architecture/tech-stack` Axios layer) must:

1. **Read the headers on every response** — surface remaining budget to a debug panel (Phase 5) but **never** to end users in normal flow.
2. **On 429** — pause all outgoing requests for `Retry-After` seconds, then resume. Do **not** retry the rejected request automatically; let the user decide (they may have moved on).
3. **Optimistic-update rollback** — if a write returned 429, roll back the optimistic state and toast `Server is busy. Try again in {N} seconds.`
4. **No client-side counter** — the server is the only source of truth. Client must not pre-emptively suppress requests based on its own count.
5. **Offline queue interaction** — per `mem://features/offline-resilience`, queued operations replay on reconnect; the queue must respect any 429 it receives (pause queue draining, then resume).

---

## Edge Cases

1. Server clock jumps backward (NTP correction) → `WindowStart` rows in the past are still valid; counter naturally rolls when wall clock catches up. No corrective action needed.
2. Two requests arrive in the same millisecond → SQLite `BEGIN IMMEDIATE` serialises the read-modify-write of the counter row; second request sees the first's increment.
3. Bucket row missing (first call by a new user) → `INSERT OR REPLACE` creates the row with `Count=1`. Atomic.
4. User logs out mid-burst → subsequent requests use IP bucket; the user bucket remains for re-login.
5. Reverse proxy (nginx) injects `X-Forwarded-For` → plugin reads it via WP's `wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR'])`; trusted-proxy list is configured in the plugin admin per `mem://constraints/backend-runtime-deferred`.
6. Massive `Bulk Delete` from Trash exceeding the heavy bucket → server processes the first N up to the budget then returns 429 with a `Details.PartialCompleted: <N>` field; client toasts a partial-completion message.
7. SSE connection counts → SSE long-poll connections (`item-updated` channel per `01-information-model.md`) are **excluded** from the bucket; they consume a separate connection-cap of 4 per user.
8. Real-time peer floods (many tabs, many devices) → user bucket aggregates across all of them; the user sees the limit even with fewer requests per device.
9. Trash auto-cleanup cron (per `mem://features/trash-logic`) → runs server-side without consuming any user bucket.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-RATELIMIT-01 | User has made 29 of 30 burst requests | One more request arrives within 10 s | Server allows it; `X-RateLimit-Remaining: 0` | `ratelimit-burst-edge-allowed` |
| AT-RATELIMIT-02 | User is at burst limit | Next request arrives within window | Server returns 429 with `Retry-After: <n>` and `ERR_RATE_LIMITED` envelope | `ratelimit-burst-rejected` |
| AT-RATELIMIT-03 | User receives 429 | Client observes response | Client toasts "Server is busy. Try again in N seconds."; rolls back optimistic state | `ratelimit-client-toast` |
| AT-RATELIMIT-04 | Burst window has elapsed | New request arrives | Counter resets; request allowed | `ratelimit-window-rolls` |
| AT-RATELIMIT-05 | Anonymous request from IP X | Made via public share read | IP bucket consumed, not user bucket | `ratelimit-ip-bucket` |
| AT-RATELIMIT-06 | User triggers `EP-ITEMS-DELETE` 10 times in 10 s | Eleventh delete arrives | Server returns 429 (heavy profile, 10/burst) | `ratelimit-heavy-endpoint` |
| AT-RATELIMIT-07 | User reaches hourly limit | Sustained and burst still have budget | Server still returns 429; `Details.Bucket: "hourly"` | `ratelimit-hourly-cap` |
| AT-RATELIMIT-08 | Server clock jumps back 5 min | Subsequent requests evaluated | No spurious 429s; window naturally rolls | `ratelimit-clock-skew-safe` |
| AT-RATELIMIT-09 | SSE connection is open | User makes API request that consumes burst budget | SSE traffic does **not** count against any bucket | `ratelimit-sse-excluded` |
| AT-RATELIMIT-10 | Client receives 200 with `X-RateLimit-Remaining: 5` | Client reads header | Internal debug panel shows remaining; no user-visible warning | `ratelimit-headers-on-success` |
| AT-RATELIMIT-11 | Offline queue replays 50 ops on reconnect | Server returns 429 mid-replay | Client pauses queue for `Retry-After`, then resumes from the failed op | `ratelimit-queue-respects-429` |
| AT-RATELIMIT-12 | Mass-delete partial-completion | Server processed 10 of 25 before 429 | Response includes `Details.PartialCompleted: 10`; client toasts partial result | `ratelimit-partial-completion` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Server middleware | `wp-plugin/src/Middleware/RateLimit.php` | `public function check(string $BucketKey, string $EndpointId): RateLimitResult` |
| Bucket table | `wp-plugin/src/Migrations/0007_rate_limit_buckets.sql` | `CREATE TABLE RateLimitBuckets (BucketKey TEXT, Endpoint TEXT, WindowStart INT, Count INT, PRIMARY KEY(BucketKey, Endpoint, WindowStart))` |
| Bucket profile constants | `wp-plugin/src/Middleware/BucketProfiles.php` | Mirror of [Endpoint-Specific Buckets](#endpoint-specific-buckets) |
| Client interceptor | `src/lib/api/rate-limit-interceptor.ts` | Axios response interceptor reading rate-limit headers |
| 429 toast | `src/components/feedback/RateLimitToast.tsx` | Reads `ratelimit-client-toast` testid |

---

## Cross-References

| Topic | Link |
|-------|------|
| Endpoint catalogue | [`../06-endpoints/`](../06-endpoints/) |
| Standard error envelope | `mem://architecture/tech-stack` (PascalCase API contract) |
| Backend runtime | `mem://constraints/backend-runtime-deferred` (WP plugin) |
| Offline queue interaction | `mem://features/offline-resilience` |
| Trash mass-delete edge | `mem://features/trash-logic` |
| Cycle-check cost | [`../01-features/09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) |
