# 14.3 HTTP Method Selection

> **Parent:** [Phase 14 overview](./00-overview.md)

---

### Method rules

| Method | When to use | Side effects | Idempotent |
|--------|-------------|-------------|------------|
| **GET** | Retrieve data, list resources, read status | None | Yes |
| **POST** | Create resource, execute action, trigger operation | Yes | No |
| **PUT** | Replace entire resource | Yes | Yes |
| **PATCH** | Partial update of a resource | Yes | Yes |
| **DELETE** | Remove a resource or initiate removal | Yes | Yes |

### Decision guide

```
Is this a read operation?
  → YES → GET

Does this create or modify something?
  → Creates a new resource → POST
  → Replaces the whole resource → PUT
  → Updates specific fields → PATCH (or POST for simpler plugins)

Does this remove something?
  → YES → DELETE
```

### Plugin-specific patterns

| Pattern | Method | Example | Why |
|---------|--------|---------|-----|
| List all items | GET | `GET /plugins` | Read-only retrieval |
| Get single item | GET or POST | `GET /plugins/(?P<id>\d+)` or `POST /plugins/info` | GET when ID is in URL; POST when body carries the identifier |
| Create item | POST | `POST /agents/add` | Side effect: creates resource |
| Delete item | POST or DELETE | `POST /agents/remove` or `DELETE /logs/clear` | POST is acceptable for actions; DELETE for explicit removal |
| Execute action | POST | `POST /plugins/enable` | Actions are not idempotent |
| Retrieve with complex filters | GET | `GET /logs?action=Upload&from=2026-01-01` | Filters as query params |
| Upload file | POST | `POST /upload` | Multipart or base64 body |
| Export/download | GET or POST | `GET /export-self` or `POST /snapshots/export` | GET for parameterless exports; POST when body specifies parameters |

### When POST is acceptable for reads

WordPress plugins commonly use POST for "read with body" operations where query parameters would be too complex or expose sensitive data. This is acceptable when:

1. The request body carries a slug or identifier that should not be in the URL
2. The request carries multiple complex filter objects
3. The response is generated dynamically based on body parameters

```php
// Acceptable: POST with slug in body for single-item retrieval
// Route: POST /plugins/info
// Body: { "slug": "some-plugin" }
```

---
