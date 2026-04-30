# Data File Patterns — Adding Files, Validation & Checklist

> **Split from** [`17-data-file-patterns.md`](./17-data-file-patterns.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 17.5 Adding a New Data File

### Checklist

1. **Create the JSON file** in `data/` with a clear, descriptive name (kebab-case)
2. **Create a corresponding enum** (if the file has keyed groups) in `includes/Enums/`
3. **Document the schema** — add field descriptions in this spec or a dedicated section
4. **Read via `file_get_contents` + `json_decode`** — never use `require` or `include` for JSON
5. **Cache when read >100×/request** — for frequently accessed data, cache the decoded array in a static property
6. **Never write at runtime** — data files are deployment artifacts, not runtime state

### Caching Pattern

```php
final class ColorRegistry
{
    private static ?array $cache = null;

    public static function get(ColorGroupType $group): array
    {
        if (self::$cache === null) {
            $path = plugin_dir_path(__FILE__) . '../../data/colors.json';
            self::$cache = json_decode(file_get_contents($path), true) ?: [];
        }
        return self::$cache[$group->value] ?? [];
    }
}
```

---

## 17.6 Validation Rules

### At Development Time

| Check | Tool | Trigger |
|-------|------|---------|
| Valid JSON syntax | `json_decode` returns non-null | Build/CI |
| Enum sync | All JSON keys have matching enum cases | Code review |
| No duplicate paths | `endpoints.json` paths are unique | CI lint |

### At Runtime

| Check | Action |
|-------|--------|
| File missing | Log error via `InitHelpers::errorLogWithPrefix()`, use empty defaults |
| Decode failure | Log error, return empty array — never throw |
| Missing key | Return `null` or default — never access without null-safe check |

---

## 17.7 Checklist

- [ ] `data/` directory with `.gitkeep`
- [ ] `colors.json` with `ColorGroupType` enum covering all top-level keys
- [ ] `endpoints.json` synchronized with `EndpointType` enum
- [ ] `openapi.json` version-matched with `endpoints.json`
- [ ] Enum-driven access for all keyed data (never hardcode string keys)
- [ ] Static cache pattern for frequently accessed data files
- [ ] Runtime fallbacks: missing file → log + empty default, never throw

---

*Last Updated: 2026-04-09*
