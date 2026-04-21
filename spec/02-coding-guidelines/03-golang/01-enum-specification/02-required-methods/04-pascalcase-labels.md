# PascalCase Label Convention

> **Parent:** [`00-overview.md`](./00-overview.md)

---

**Mandatory rule (since v4.1.0):** All `variantLabels` entries MUST use **PascalCase** strings matching the constant name, with abbreviations treated as words (first letter only caps). This aligns Go enum serialization with the cross-language standard (PHP, TypeScript).

| ❌ Forbidden | ✅ Required |
|-------------|-----------|
| `"per_table"` | `"PerTable"` |
| `"serpapi"` | `"SerpApi"` |
| `"SerpAPI"` | `"SerpApi"` |
| `"maps_scraper"` | `"MapsScraper"` |
| `"baseURL"` | `"BaseUrl"` |

**Exception:** Protocol-driven enums (`content_type`, `endpoint`, `header`, `response_key`, `response_message`) preserve their functional values (e.g., `"application/json"`, `"X-Riseup-Auth"`).

**Parse() compatibility:** `Parse()` uses `strings.EqualFold()`, so it accepts both old snake_case and new PascalCase inputs during migration.

---

*Required methods for enum compliance.*

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-complete-example.md`](./03-complete-example.md) — `variantLabels` shown applied in a full enum
