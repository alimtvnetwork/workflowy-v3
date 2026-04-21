# 14.13 Dynamic Route Segments

> **Parent:** [Phase 14 overview](./00-overview.md)

---

For endpoints that accept IDs or identifiers in the URL path:

```php
// Route with regex capture group
case UserId = 'users/(?P<id>\d+)';

// Registration
$safeRegister(EndpointType::UserId->route(), [
    'methods'             => HttpMethodType::Get->value,
    'callback'            => [$this, 'handleUserById'],
    'permission_callback' => [$this, 'checkPluginPermission'],
    'args'                => [
        'id' => [
            'required'          => true,
            'validate_callback' => fn($param) => is_numeric($param),
            'sanitize_callback' => 'absint',
        ],
    ],
], 'users');

// Handler — extract from URL params
private function executeUserById(WP_REST_Request $request): WP_REST_Response
{
    $userId = absint($request->get_param('id'));
    // ...
}
```

### Regex patterns for dynamic segments

| Pattern | Matches | Example |
|---------|---------|---------|
| `(?P<id>\d+)` | Numeric ID | `users/42` |
| `(?P<slug>[a-zA-Z0-9-]+)` | Slug string | `plugins/my-plugin` |
| `(?P<provider>[a-zA-Z]+)` | Alpha provider name | `cloud-storage/settings/google` |

---
