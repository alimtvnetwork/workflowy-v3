# 14.6 Pagination

> **Parent:** [Phase 14 overview](./00-overview.md)

---

### Request parameters

Pagination uses query parameters for GET endpoints and JSON body fields for POST endpoints:

| Parameter | Type | Default | Max | Source |
|-----------|------|---------|-----|--------|
| `limit` | int | 50 | 500 | `PaginationConfigType::DefaultLimit` |
| `offset` | int | 0 | — | Computed from page number or passed directly |
| `page` | int | 1 | — | Alternative to offset: `offset = (page - 1) * limit` |

### PaginationConfigType enum

```php
enum PaginationConfigType: int
{
    case DefaultLimit = 50;
    case MaxLimit     = 500;

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

### Pagination extraction pattern

```php
private function extractPagination(WP_REST_Request $request): array
{
    $rawLimit = $request->get_param('limit');
    $rawOffset = $request->get_param('offset');
    $rawPage = $request->get_param('page');

    $defaultLimit = PaginationConfigType::DefaultLimit->value;
    $maxLimit = PaginationConfigType::MaxLimit->value;

    $limit = ($rawLimit !== null) ? min(absint($rawLimit), $maxLimit) : $defaultLimit;
    $isLimitZero = ($limit === 0);

    if ($isLimitZero) {
        $limit = $defaultLimit;
    }

    // Support both offset and page-based pagination
    $hasPage = ($rawPage !== null);
    $offset = $hasPage
        ? (max(1, absint($rawPage)) - 1) * $limit
        : absint($rawOffset ?? 0);

    return [
        'limit'  => $limit,
        'offset' => $offset,
    ];
}
```

### Pagination in response

Include pagination metadata in the `Attributes` section of the envelope:

```json
{
  "Status": { "IsSuccess": true, "Code": 200, "Message": "OK" },
  "Attributes": {
    "RequestedAt": "/my-plugin/v1/logs",
    "TotalRecords": 1250,
    "Limit": 50,
    "Offset": 100,
    "Page": 3,
    "TotalPages": 25
  },
  "Results": [ ... ]
}
```

---
