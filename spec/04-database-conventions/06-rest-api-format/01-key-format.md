# Response Key Format

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Response Key Format

```json
// ✅ CORRECT — PascalCase keys
{
    "TransactionId": 42,
    "PluginSlug": "my-awesome-plugin",
    "Amount": 29.99,
    "StatusName": "Pending",
    "IsActive": true,
    "HasLicense": false,
    "CreatedAt": "2026-04-02T10:30:00Z"
}

// ❌ WRONG — camelCase
{
    "transactionId": 42,
    "pluginSlug": "my-awesome-plugin",
    "isActive": true
}

// ❌ WRONG — snake_case
{
    "transaction_id": 42,
    "plugin_slug": "my-awesome-plugin",
    "is_active": true
}
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-rest-samples.md`](./02-rest-samples.md) — Full request/response samples using these keys
