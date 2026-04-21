# 14.7 Filtering

> **Parent:** [Phase 14 overview](./00-overview.md)

---

### FilterKeyType enum

Standardise all filter parameter names via an enum:

```php
enum FilterKeyType: string
{
    case Status        = 'status';
    case Plugin        = 'plugin';
    case Action        = 'action';
    case User          = 'user';
    case TriggeredBy   = 'triggeredBy';
    case UploadSource  = 'uploadSource';
    case From          = 'from';
    case To            = 'to';
    case SourceMachine = 'sourceMachine';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

### Filter extraction pattern

```php
private function extractFilters(WP_REST_Request $request): array
{
    $filters = [];

    foreach (FilterKeyType::cases() as $filter) {
        $value = $request->get_param($filter->value);
        $hasValue = ($value !== null && $value !== '');

        if ($hasValue) {
            $filters[$filter->value] = sanitize_text_field($value);
        }
    }

    return $filters;
}
```

### Filter naming rules

| Rule | Detail |
|------|--------|
| camelCase for filter keys | `triggeredBy`, not `triggered_by` |
| Match FilterKeyType enum values | No ad-hoc filter parameter names |
| Date filters use ISO 8601 format | `from=2026-01-01`, `to=2026-12-31` |
| String filters are sanitised | Always `sanitize_text_field()` |
| Empty string means "no filter" | Never treat `""` as a valid filter value |

---
