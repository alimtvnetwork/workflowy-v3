# 5.1.3 HttpConfigType — HTTP Request Factories

> **Parent:** [00-overview.md](./00-overview.md)

`HttpConfigType` is a backed enum that centralises HTTP timeout values and provides static factory methods for `wp_remote_get()` / `wp_remote_request()` option arrays.

```php
enum HttpConfigType: int {
    case TimeoutDefault = 30;
    case TimeoutShort   = 15;

    public static function headRedirectOptions(): array {
        return [
            'timeout'     => self::TimeoutShort->value,
            'redirection' => 0,
            'sslverify'   => true,
        ];
    }

    public static function defaultGetOptions(): array {
        return [
            'timeout'   => self::TimeoutDefault->value,
            'sslverify' => true,
        ];
    }

    public static function authenticatedOptions(string $method, string $authHeader): array {
        return [
            'method'    => strtoupper($method),
            'timeout'   => self::TimeoutDefault->value,
            'headers'   => [
                'Authorization' => $authHeader,
                'Content-Type'  => ContentTypeValueType::Json->value,
            ],
            'sslverify' => true,
        ];
    }
}
```

## Usage

```php
// HEAD request (no redirects, short timeout)
$response = wp_remote_head($url, HttpConfigType::headRedirectOptions());

// Standard GET
$response = wp_remote_get($url, HttpConfigType::defaultGetOptions());

// Authenticated API call
$response = wp_remote_request($url, HttpConfigType::authenticatedOptions('POST', $authHeader));
```

## Supporting enum — ContentTypeValueType

```php
enum ContentTypeValueType: string {
    case Json     = 'application/json';
    case JsonUtf8 = 'application/json; charset=utf-8';
}
```

All MIME types used in HTTP headers come from this enum — never hardcode `'application/json'`.

## Related

- [01-helper-classes.md](./01-helper-classes.md) — Standard helpers inventory
- [05-response-envelope.md](./05-response-envelope.md) — Response format conventions
