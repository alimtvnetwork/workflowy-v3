# 6. Format Reference & Usage

> **Parent:** [Error Code Registry overview](../00-overview.md)

---

## Error Code Format Reference

The ecosystem uses **two** error code formats:

| Format | Used By | Example | Pattern |
|--------|---------|---------|---------|
| `XX-NNN-NN` | General specs, PHP plugins | `SM-400-01` | `^[A-Z]{2,4}-[0-9]{3}-[0-9]{2}$` |
| Integer | Go CLI tools | `7001`, `9301` | `^[0-9]{4,5}$` |

Both formats are valid. Go CLI tools use flat integers in API responses, constants, and logs. PHP plugins and general specs use the prefixed format. The JSON schema supports both.

---

## Adding New Codes

1. Check the Range Allocation Map in [01-overview.md](./01-overview.md)
2. Claim a project prefix in the Registered Project Prefixes table
3. Use the next available number in the category
4. Follow naming convention: `ErrPascalCase` (PascalCase with `Err` prefix)
5. Provide clear, actionable message
6. Update this registry in the same commit
7. Never reuse deprecated or retired codes
8. If the code is a Go domain error, also register it as an `apperrtype` enum — see [05-apperrtype-enums/00-overview.md](../../02-error-architecture/06-apperror-package/01-apperror-reference/05-apperrtype-enums/00-overview.md)

---

## Relationship to `apperrtype` Enums

The `apperror` package uses a separate `E{x}xxx` string code format for Go-internal domain errors (e.g., `E2010` = site not found). These do **not** collide with this registry's prefixed format (`GEN-000-01`, `AB-9301`, etc.) because the formats are distinguishable at parse time.

For the full `apperrtype` enum reference and collision analysis, see:
→ [apperrtype Domain Error Enums](../../02-error-architecture/06-apperror-package/01-apperror-reference/05-apperrtype-enums/00-overview.md)
