# 8.6 Transient Caching

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## When to use

Cache expensive operations (remote API calls, complex queries) that don't need real-time accuracy.

## Pattern

```php
/**
 * Get data with transient caching.
 *
 * @param string   $key      Transient key (auto-prefixed)
 * @param int      $ttl      Cache duration in seconds
 * @param callable $callback Function to compute the value if cache misses
 *
 * @return mixed The cached or freshly computed value
 */
protected function getCached(string $key, int $ttl, callable $callback): mixed
{
    $fullKey = 'plugin_name_' . $key;
    $cached = get_transient($fullKey);
    $hasCached = ($cached !== false);

    if ($hasCached) {
        $this->fileLogger->debug('Cache hit', ['key' => $key]);

        return $cached;
    }

    $this->fileLogger->debug('Cache miss — computing', ['key' => $key]);

    $value = $callback();
    set_transient($fullKey, $value, $ttl);

    return $value;
}

/**
 * Invalidate a specific cache key.
 */
protected function invalidateCache(string $key): void
{
    $fullKey = 'plugin_name_' . $key;
    delete_transient($fullKey);

    $this->fileLogger->debug('Cache invalidated', ['key' => $key]);
}
```

## Usage in a handler

```php
private function executeGetStats(WP_REST_Request $request): WP_REST_Response
{
    $stats = $this->getCached('dashboard_stats', 300, function () {
        // Expensive computation — cached for 5 minutes
        return [
            'totalWidgets'  => $this->countWidgets(),
            'activeWidgets' => $this->countActiveWidgets(),
            'computedAt'    => DateHelper::nowUtc(),
        ];
    });

    return EnvelopeBuilder::success()
        ->setRequestedAt($request->get_route())
        ->setSingleResult($stats)
        ->toResponse();
}
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| Object caching plugin installed | `get_transient` automatically uses object cache — no changes needed |
| Transient stores `false` as value | Wrap value in array: `['data' => $value]` to distinguish from cache miss |
| Cache stampede (many requests hit miss simultaneously) | Use transient lock (same pattern as cron lock in [`./03-wp-cron.md`](./03-wp-cron.md)) |
| Multisite | Use `get_site_transient()` / `set_site_transient()` for network-wide caching |
