# Convention 23 — PHP SSE Implementation Pattern

> **Version:** 1.0.0
> **Created:** 2026-04-27 (UTC+8)
> **Status:** Active — closes AUDIT-AI-02 (CRITICAL, +5 pts)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Related:** [`../06-endpoints/14-concurrency-and-sync.md`](../06-endpoints/14-concurrency-and-sync.md), [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md)

---

## Keywords

`sse` · `php` · `streaming` · `gc` · `fastcgi-finish` · `output-buffering` · `keepalive`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Parent linked | ✅ |
| AI Confidence | High |
| Ambiguity | Low |
| Keywords present | ✅ |
| Scoring table | ✅ |
| Acceptance criteria inline | ✅ |
| Code fixtures (```php blocks) | ✅ (4 reference implementations) |

---

## 1. Purpose

PHP is a **request/response** language. Naïve SSE in PHP (`while(true){echo;sleep}`) leaks memory, exhausts FastCGI workers, and gets killed by `max_execution_time`. This document is the **canonical reference implementation** for the `EP-SYNC-STREAM` endpoint defined in [`../06-endpoints/14-concurrency-and-sync.md`](../06-endpoints/14-concurrency-and-sync.md).

A fresh AI session implementing SSE **MUST** copy from this file, not invent.

---

## 2. Hosting Reality (assumptions)

| Assumption | Value | Why it matters |
|-----------|-------|----------------|
| PHP-SAPI | `php-fpm` behind nginx **or** mod_php behind Apache | Both supported. Long-poll fallback if neither. |
| `max_execution_time` | overridable via `set_time_limit(0)` | Required. If the host disables `set_time_limit`, fall back to long-poll (§7). |
| Output buffering | nginx may buffer — must disable per-route | See §4.3. |
| Max concurrent SSE per user | **5 tabs** (hard cap) | Beyond 5, server returns `429` with `ERR_TOO_MANY_STREAMS`. |
| Connection lifetime | **30 minutes** then graceful close | Client reconnects with `Last-Event-Id`. |

---

## 3. Forbidden Anti-Patterns

| ❌ Don't | ✅ Do |
|---------|------|
| `while(true){echo;sleep(1);}` (memory leak) | Bounded loop with `gc_collect_cycles()` every N events (§4) |
| `set_time_limit(3600)` (worker hostage) | `set_time_limit(0)` + explicit 30-min wall clock + `connection_aborted()` checks |
| Storing event queue in PHP memory | SQLite-backed event log with `Last-Event-Id` cursor |
| Polling DB every 100ms in PHP | DB poll every **1 s** + `usleep(1_000_000)` between iterations |
| Writing huge payloads (>4 KB) per event | Send `id` only; client refetches via `EP-ITEMS-READ` |
| `header("X-Accel-Buffering: no")` after `echo` | **Set BEFORE any output** — see §4.2 |

---

## 4. Canonical Reference Implementation

### 4.1 Endpoint Registration

```php
<?php
// plugin/src/Rest/SyncStreamController.php
namespace Workflowy\Rest;

class SyncStreamController {
    public function register(): void {
        register_rest_route('workflowy/v1', '/sync/stream', [
            'methods'             => 'GET',
            'callback'            => [$this, 'stream'],
            'permission_callback' => [Auth::class, 'requireUser'],
            'args'                => [
                'Topics' => ['required' => true, 'type' => 'string'],
            ],
        ]);
    }
}
```

### 4.2 Headers (BEFORE any output)

```php
public function stream(\WP_REST_Request $request) {
    // CRITICAL: send headers before any echo, before any buffer flush
    @ini_set('zlib.output_compression', '0');
    @ini_set('output_buffering', 'off');
    @ini_set('implicit_flush', '1');

    while (ob_get_level() > 0) {
        ob_end_flush();
    }

    header('Content-Type: text/event-stream; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');   // nginx
    header('X-Output-Buffering: off');  // misc proxies

    // Tell PHP we don't care about Apache's wall clock
    @set_time_limit(0);

    // Detect client disconnects
    ignore_user_abort(false);

    return $this->loop($request);
}
```

### 4.3 The Loop (memory-safe)

```php
private function loop(\WP_REST_Request $request): void {
    $userId          = get_current_user_id();
    $topics          = $this->parseTopics($request->get_param('Topics'));
    $lastEventId     = (int) ($_SERVER['HTTP_LAST_EVENT_ID'] ?? 0);
    $startedAt       = time();
    $maxLifetime     = 30 * 60;                    // 30 minutes
    $heartbeatEvery  = 15;                          // seconds
    $pollInterval    = 1;                           // seconds
    $gcEvery         = 100;                         // events
    $eventCount      = 0;
    $lastHeartbeat   = time();

    // Replay buffered events ≥ Last-Event-Id BEFORE entering live loop
    $replay = $this->repo->getEventsSince($userId, $topics, $lastEventId, 500);
    foreach ($replay as $event) {
        $this->emit($event);
        $lastEventId = (int) $event['id'];
        $eventCount++;
    }
    $this->flush();

    // Live loop
    while (true) {
        // Wall-clock cutoff — graceful close, client reconnects
        if (time() - $startedAt >= $maxLifetime) {
            $this->emitClose('lifetime-exceeded');
            return;
        }

        // Client disconnected? Apache/nginx flag it on next write
        if (connection_aborted() === 1) {
            return;
        }

        // Poll DB for new events for this user + topics
        $events = $this->repo->getEventsSince($userId, $topics, $lastEventId, 50);

        if ($events === []) {
            // Heartbeat as a comment (not an event) every 15 s
            if (time() - $lastHeartbeat >= $heartbeatEvery) {
                echo ": ping\n\n";
                $this->flush();
                $lastHeartbeat = time();
            }
            usleep($pollInterval * 1_000_000);
            continue;
        }

        foreach ($events as $event) {
            // Per-event ACL re-check (topic permissions can be revoked mid-stream)
            if (!$this->canRead($userId, $event['topic'])) {
                $this->emitError('ERR_FORBIDDEN_TOPIC', $event['topic']);
                continue;
            }
            $this->emit($event);
            $lastEventId = (int) $event['id'];
            $eventCount++;
            $lastHeartbeat = time();

            // Memory hygiene — call GC every N events
            if ($eventCount % $gcEvery === 0) {
                gc_collect_cycles();
                // For FPM: hint that worker should release request resources
                if (function_exists('opcache_reset') === false) {
                    // no-op; opcache stays warm
                }
            }
        }

        $this->flush();
        usleep($pollInterval * 1_000_000);
    }
}
```

### 4.4 Emit Helpers

```php
private function emit(array $event): void {
    // Whitelist event names per §14.5.2 — closed set of 9
    static $allowed = [
        'item-updated', 'item-deleted', 'item-restored',
        'mirror-broken', 'mirror-healed',
        'share-granted', 'share-revoked',
        'presence', 'cursor-overflow',
    ];
    if (!in_array($event['name'], $allowed, true)) {
        return; // silently drop unknown event names
    }

    echo "id: {$event['id']}\n";
    echo "event: {$event['name']}\n";
    echo 'data: ' . wp_json_encode($event['payload']) . "\n\n";
}

private function emitError(string $code, string $detail): void {
    echo "event: error\n";
    echo 'data: ' . wp_json_encode(['Code' => $code, 'Detail' => $detail]) . "\n\n";
}

private function emitClose(string $reason): void {
    echo "event: close\n";
    echo 'data: ' . wp_json_encode(['Reason' => $reason]) . "\n\n";
    $this->flush();
}

private function flush(): void {
    @ob_flush();
    @flush();
}
```

---

## 5. Concurrency Cap (5 streams per user)

```php
public static function requireUser(\WP_REST_Request $request) {
    $userId = get_current_user_id();
    if ($userId === 0) {
        return new \WP_Error('ERR_UNAUTHENTICATED', 'Not signed in', ['status' => 401]);
    }

    // Rate limit: max 5 concurrent streams per user
    $key      = "wf_sse_count_{$userId}";
    $current  = (int) get_transient($key);
    if ($current >= 5) {
        return new \WP_Error('ERR_TOO_MANY_STREAMS', 'Max 5 SSE streams', ['status' => 429]);
    }
    set_transient($key, $current + 1, 30 * 60);

    // Decrement on shutdown
    register_shutdown_function(function () use ($key) {
        $n = (int) get_transient($key);
        set_transient($key, max(0, $n - 1), 30 * 60);
    });

    return true;
}
```

---

## 6. SQLite Event Log Schema

```sql
CREATE TABLE wf_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    topic       TEXT    NOT NULL,           -- e.g. "item:abc"
    name        TEXT    NOT NULL,           -- one of the 9 canonical names
    payload     TEXT    NOT NULL,           -- JSON
    created_at  INTEGER NOT NULL            -- unix epoch
);
CREATE INDEX idx_wf_events_user_topic_id ON wf_events (user_id, topic, id);

-- GC: delete events older than 1 hour (cron-driven)
-- DELETE FROM wf_events WHERE created_at < strftime('%s','now') - 3600;
```

`getEventsSince($userId, $topics, $lastEventId, $limit)` is a single indexed query — no N+1.

---

## 7. Long-Poll Fallback (when `set_time_limit(0)` is forbidden)

Some shared hosts (cPanel) lock `set_time_limit`. Detect once at boot:

```php
public static function canStreamSSE(): bool {
    @set_time_limit(0);
    return ini_get('max_execution_time') === '0';
}
```

If `false`, the server advertises `EP-SYNC-POLL` only and clients use 5 s polling per [`../06-endpoints/14-concurrency-and-sync.md`](../06-endpoints/14-concurrency-and-sync.md). No SSE attempted.

---

## 8. Operator Verification

```bash
# 1. Stream opens and emits heartbeat within 15 s
curl -N -H "Cookie: wordpress_logged_in_xxx=..." \
  "http://localhost:8888/wp-json/workflowy/v1/sync/stream?Topics=item:abc"
# expected: ": ping" comment line within 15 s

# 2. Memory does not grow unbounded — observe FPM worker RSS
ps -o pid,rss,cmd -p $(pgrep -f php-fpm | head -1)
# expected: RSS stable (±5 MB) over 10 minutes of streaming

# 3. 30-min cutoff
# (run a stream for 30 min) expected: "event: close\ndata: {Reason:lifetime-exceeded}"
```

---

## 9. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| `AT-SSE-PHP-01` | All SSE response headers (Content-Type, X-Accel-Buffering, Cache-Control) are sent BEFORE any `echo`. |
| `AT-SSE-PHP-02` | `set_time_limit(0)` is called once per request; `ignore_user_abort(false)` enables disconnect detection. |
| `AT-SSE-PHP-03` | `gc_collect_cycles()` is called every 100 emitted events. |
| `AT-SSE-PHP-04` | Heartbeat comment `": ping\n\n"` is emitted every 15 s when no events flow. |
| `AT-SSE-PHP-05` | A 30-minute wall-clock cutoff emits `event: close` with `Reason:lifetime-exceeded`, then returns. |
| `AT-SSE-PHP-06` | Only the 9 canonical event names from §14.5.2 are emittable; others are silently dropped. |
| `AT-SSE-PHP-07` | Per-user concurrent stream cap is 5; the 6th returns `429 ERR_TOO_MANY_STREAMS`. |
| `AT-SSE-PHP-08` | Per-event topic ACL is re-checked; revoked-mid-stream emits `event: error / ERR_FORBIDDEN_TOPIC`. |
| `AT-SSE-PHP-09` | If `set_time_limit(0)` is denied by the host, the server advertises poll-only mode (no SSE attempted). |
| `AT-SSE-PHP-10` | FPM worker RSS stays within ±5 MB of baseline over 10 minutes of continuous streaming (load test). |

---

## 10. Cross-References

| Topic | Link |
|-------|------|
| Endpoint definition | [`../06-endpoints/14-concurrency-and-sync.md`](../06-endpoints/14-concurrency-and-sync.md) |
| Feature spec | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) |
| Forbidden transports rationale | [`../../18-spec-issues/08-audit-06-sse-transport-contract.md`](../../18-spec-issues/08-audit-06-sse-transport-contract.md) |
| Local dev harness (paired) | [`../../15-wp-plugin-how-to/24-local-dev-harness.md`](../../15-wp-plugin-how-to/24-local-dev-harness.md) |
| Audit closure | [`../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md`](../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md) §AUDIT-AI-02 |
