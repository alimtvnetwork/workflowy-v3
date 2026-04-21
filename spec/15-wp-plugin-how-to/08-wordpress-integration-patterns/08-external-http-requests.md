# 8.7 HTTP Requests to External APIs

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## Pattern with error handling

```php
/**
 * Make a GET request to an external API with structured error handling.
 *
 * @param string               $url     The full URL to request
 * @param array<string, string> $headers Additional headers
 *
 * @return array{success: bool, data: mixed, error: string|null}
 */
protected function externalGet(string $url, array $headers = []): array
{
    $response = wp_remote_get($url, [
        'timeout' => 15,
        'headers' => $headers,
    ]);

    $isWpError = is_wp_error($response);

    if ($isWpError) {
        $errorMessage = $response->get_error_message();
        $this->fileLogger->error('External API request failed', [
            'url'   => $url,
            'error' => $errorMessage,
        ]);

        return ['success' => false, 'data' => null, 'error' => $errorMessage];
    }

    $statusCode = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    $isSuccess = ($statusCode >= 200 && $statusCode < 300);

    if (!$isSuccess) {
        $this->fileLogger->warn('External API returned non-2xx', [
            'url'    => $url,
            'status' => $statusCode,
            'body'   => mb_substr($body, 0, 500),
        ]);

        return ['success' => false, 'data' => $body, 'error' => "HTTP {$statusCode}"];
    }

    $decoded = json_decode($body, true);
    $isJson = ($decoded !== null);

    return [
        'success' => true,
        'data'    => $isJson ? $decoded : $body,
        'error'   => null,
    ];
}
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| SSL certificate issues | Don't disable SSL verification — fix the server config |
| Timeout | Set explicit `timeout` in `wp_remote_get` args (default 5s is often too low) |
| WordPress HTTP API blocked | Some hosts block `wp_remote_get` — check `WP_HTTP_BLOCK_EXTERNAL` constant |
| Response is not JSON | Check content type or use `json_decode` return value to detect |
| Rate limiting (429) | Respect `Retry-After` header; log and return structured error |
