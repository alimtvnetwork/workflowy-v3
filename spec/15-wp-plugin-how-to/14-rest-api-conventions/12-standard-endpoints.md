# 14.12 Standard Endpoint Patterns

> **Parent:** [Phase 14 overview](./00-overview.md)

---

### Status endpoint (every plugin must have one)

```php
// GET /status — Health check and version info
public function handleStatus(WP_REST_Request $request): WP_REST_Response
{
    return $this->safeExecute(
        fn() => $this->executeStatus($request),
        'status',
    );
}

private function executeStatus(WP_REST_Request $request): WP_REST_Response
{
    return EnvelopeBuilder::success('OK')
        ->setRequestedAt($request->get_route())
        ->setSingleResult([
            ResponseKeyType::Version->value => PluginConfigType::Version->value,
            ResponseKeyType::Slug->value    => PluginConfigType::Slug->value,
            ResponseKeyType::Status->value  => 'active',
        ])
        ->toResponse();
}
```

### List endpoint with pagination and filters

```php
// GET /logs — Paginated, filterable list
private function executeLogs(WP_REST_Request $request): WP_REST_Response
{
    $pagination = $this->extractPagination($request);
    $filters = $this->extractFilters($request);

    $results = $this->queryLogs($filters, $pagination['limit'], $pagination['offset']);
    $total = $this->countLogs($filters);

    $totalPages = ($pagination['limit'] > 0)
        ? (int) ceil($total / $pagination['limit'])
        : 1;

    return EnvelopeBuilder::success('OK')
        ->setRequestedAt($request->get_route())
        ->setListResult($results)
        ->setTotalRecords($total)
        ->toResponse();
}
```

### Action endpoint with body validation

```php
// POST /plugins/enable — Activate a plugin
private function executePluginEnable(WP_REST_Request $request): WP_REST_Response
{
    $body = $request->get_json_params();
    $hasBody = ($body !== null && $this->isArray($body));

    if (!$hasBody) {
        return $this->validationError('Request body must be a JSON object', $request);
    }

    $slug = $body[RequestFieldType::Slug->value] ?? null;
    $hasSlug = ($slug !== null && $this->isString($slug));

    if (!$hasSlug) {
        return $this->validationError('Missing required field: slug', $request);
    }

    // ... business logic ...

    $this->fileLogger->info('Plugin enabled', ['slug' => $slug]);

    return EnvelopeBuilder::success('Plugin activated')
        ->setRequestedAt($request->get_route())
        ->setSingleResult([
            ResponseKeyType::PluginSlug->value => $slug,
            ResponseKeyType::Activated->value  => true,
        ])
        ->toResponse();
}
```

### Two-phase confirmation pattern

For destructive operations, use a two-phase confirm flow:

```
Phase 1: DELETE /logs/clear → returns confirmation token
Phase 2: POST /logs/clear/confirm → consumes token, executes deletion
```

```php
// Phase 1: Request deletion — returns a token
private function executeLogsClear(WP_REST_Request $request): WP_REST_Response
{
    $token = bin2hex(random_bytes(16));
    set_transient('plugin_clear_logs_token', $token, 300); // 5-minute TTL

    return EnvelopeBuilder::success('Confirmation required')
        ->setRequestedAt($request->get_route())
        ->setSingleResult([
            ResponseKeyType::Confirm->value => $token,
            ResponseKeyType::Message->value => 'Send this token to /logs/clear/confirm to execute',
        ])
        ->toResponse();
}

// Phase 2: Confirm deletion — validates token
private function executeLogsClearConfirm(WP_REST_Request $request): WP_REST_Response
{
    $body = $request->get_json_params();
    $token = $body[ResponseKeyType::Confirm->value] ?? '';
    $storedToken = get_transient('plugin_clear_logs_token');

    $isValid = ($token !== '' && $token === $storedToken);

    if (!$isValid) {
        return $this->validationError('Invalid or expired confirmation token', $request);
    }

    delete_transient('plugin_clear_logs_token');

    // ... execute deletion ...

    return EnvelopeBuilder::success('Logs cleared')
        ->setRequestedAt($request->get_route())
        ->setSingleResult([ResponseKeyType::Deleted->value => true])
        ->toResponse();
}
```

---
