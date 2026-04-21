# Envelope Quick Reference & PascalCase Data Flow

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Envelope Quick Reference

All responses use the [Universal Response Envelope](../../03-error-manage/02-error-architecture/05-response-envelope/04-response-envelope-reference.md). Summary:

| Section | Type | Present | Description |
|---------|------|---------|-------------|
| `Status` | object | ✅ Always | `IsSuccess`, `IsFailed`, `Code`, `Message`, `Timestamp` |
| `Attributes` | object | ✅ Always | Shape flags (`IsSingle`, `IsMultiple`, `IsEmpty`), pagination, error flag |
| `Results` | array | ✅ Always | Payload — **always an array**, even for single items or deletes |
| `Navigation` | object\|null | ⚙️ Conditional | Pagination links (paginated lists only) |
| `Errors` | object\|null | ⚙️ Conditional | Error details (when `HasAnyErrors` is `true` AND reporting enabled) |
| `MethodsStack` | object\|null | ⚙️ Conditional | Debug call-chain trace (when enabled in config) |

> **Key rule:** `Results` is ALWAYS an array. Delete returns `[]`. Single item returns `[{...}]`.

---

## Data Flow — PascalCase End-to-End

```
Database Column     →  ORM Struct/Model   →  API Response JSON  →  Frontend Type
───────────────────────────────────────────────────────────────────────────────
PluginSlug TEXT      →  PluginSlug string  →  "PluginSlug": "x"  →  PluginSlug: string
IsActive BOOLEAN     →  IsActive bool      →  "IsActive": true   →  IsActive: boolean
StatusTypeId INT     →  StatusTypeId int   →  "StatusTypeId": 1  →  StatusTypeId: number
CreatedAt TEXT       →  CreatedAt string   →  "CreatedAt": "..."  →  CreatedAt: string
```

> **No transformation layer needed.** PascalCase flows from DB to frontend without any key mapping or conversion.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-rest-samples.md`](./02-rest-samples.md) — Concrete envelope examples
- [`04-language-implementation.md`](./04-language-implementation.md) — How each language preserves the casing
