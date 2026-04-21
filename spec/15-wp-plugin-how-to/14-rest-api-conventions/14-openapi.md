# 14.14 OpenAPI Documentation (Optional)

> **Parent:** [Phase 14 overview](./00-overview.md)

---

For complex plugins, maintain an `openapi.json` file in `data/`:

```
plugin-slug/
├── data/
│   ├── endpoints.json     ← Lightweight endpoint registry (required)
│   └── openapi.json       ← Full OpenAPI 3.0 spec (optional)
```

Optionally expose it via a REST endpoint:

```php
case Openapi = 'openapi';

// GET /openapi — serve the OpenAPI spec
private function executeOpenapi(WP_REST_Request $request): WP_REST_Response
{
    $specPath = plugin_dir_path(dirname(__DIR__, 2)) . 'data/openapi.json';
    $hasSpec = file_exists($specPath);

    if (!$hasSpec) {
        return $this->validationError('OpenAPI specification not found', $request);
    }

    $spec = json_decode(file_get_contents($specPath), true);

    return EnvelopeBuilder::success('OK')
        ->setRequestedAt($request->get_route())
        ->setSingleResult($spec)
        ->toResponse();
}
```

---
