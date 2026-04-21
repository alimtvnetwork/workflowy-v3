# HttpMethodType — REST API Methods

> **Parent:** [00-overview.md](00-overview.md)

```php
enum HttpMethodType: string
{
    case Get    = 'GET';
    case Post   = 'POST';
    case Put    = 'PUT';
    case Patch  = 'PATCH';
    case Delete = 'DELETE';

    public function isEqual(self $other): bool { return $this === $other; }

    public static function editable(): string
    {
        return 'PUT, PATCH';
    }
}
```

## Usage

```php
use RiseupAsia\\Enums\\HttpMethodType;

// ❌ FORBIDDEN
register_rest_route($ns, '/upload', ['methods' => 'POST', ...]);

// ✅ REQUIRED
register_rest_route($ns, '/upload', ['methods' => HttpMethodType::Post->value, ...]);
```
