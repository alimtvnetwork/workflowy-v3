# 14.10 Controller Organisation

> **Parent:** [Phase 14 overview](./00-overview.md)

---

### One handler trait per endpoint (preferred)

For clarity and single-responsibility, each endpoint (or tightly related pair) gets its own trait:

```
Traits/
├── Core/
│   ├── StatusHandlerTrait.php         ← GET /status
│   └── PluginInventoryTrait.php       ← GET /plugins
├── Upload/
│   └── UploadHandlerTrait.php         ← POST /upload, POST /upload-active
├── Activate/
│   └── ActivateHandlerTrait.php       ← POST /plugins/enable
├── Log/
│   ├── LogRetrievalTrait.php          ← GET /logs
│   ├── LogStatusTrait.php             ← GET /logs/status
│   ├── LogClearingTrait.php           ← DELETE /logs/clear, POST /logs/clear/confirm
│   └── LogEmailTrait.php              ← POST /logs/email
```

### When to combine endpoints in one trait

Combine only when two endpoints share the same private business logic method:

| ✅ Combine | ❌ Separate |
|-----------|-----------|
| `POST /upload` and `POST /upload-active` (same upload logic, different activation flag) | `GET /logs` and `POST /logs/email` (completely different logic) |
| `GET /agents` and `POST /agents/add` if add logic is trivial | `POST /plugins/enable` and `POST /plugins/delete` (different side effects) |

### Trait anatomy (recap from Phase 3)

```php
trait SomeHandlerTrait
{
    // Public: route handler → wraps in safeExecute
    public function handleSomething(WP_REST_Request $request): WP_REST_Response
    {
        return $this->safeExecute(
            fn() => $this->executeSomething($request),
            'something',
        );
    }

    // Private: business logic
    private function executeSomething(WP_REST_Request $request): WP_REST_Response
    {
        // 1. Extract and validate input (Phase 6)
        // 2. Execute business logic
        // 3. Log result
        // 4. Return envelope response

        return EnvelopeBuilder::success('Operation complete')
            ->setRequestedAt($request->get_route())
            ->setSingleResult($data)
            ->toResponse();
    }
}
```

---
