# 14.8 RequestFieldType Enum — Body Field Names

> **Parent:** [Phase 14 overview](./00-overview.md)

---

For POST endpoints that accept JSON bodies, all field names are defined in `RequestFieldType`:

```php
enum RequestFieldType: string
{
    case PluginZip     = 'plugin_zip';
    case Slug          = 'slug';
    case Activate      = 'activate';
    case UploadSource  = 'upload_source';
    case PluginVersion = 'plugin_version';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

### Body field naming rules

| Rule | Detail |
|------|--------|
| snake_case for body fields | `plugin_zip`, `upload_source` |
| Defined in `RequestFieldType` enum | No inline string literals |
| Usage in handler: `$body[RequestFieldType::Slug->value]` | Type-safe field access |
| Required fields validated with guard clauses | See Phase 6 — Input Validation |

---
