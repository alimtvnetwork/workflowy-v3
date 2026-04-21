# 14.11 endpoints.json — Endpoint Registry Data File

> **Parent:** [Phase 14 overview](./00-overview.md)

---

Every plugin maintains an `endpoints.json` file in `data/` that documents all registered REST routes. This file is:

1. **Human-readable documentation** — developers can scan all endpoints in one place
2. **Machine-consumable** — admin UI can render endpoint tables from this data
3. **Synchronised with `EndpointType`** — every enum case should have a matching entry

### File location

```
plugin-slug/
├── data/
│   └── endpoints.json
```

### Format specification

```json
{
  "namespace": "{plugin-slug}/v{major}",
  "version": "2.0.0",
  "description": "Complete listing of all REST API endpoints.",
  "endpoints": [
    {
      "path": "status",
      "methods": ["GET"],
      "category": "system",
      "description": "Plugin status, version, and registered routes",
      "auth": true
    },
    {
      "path": "upload",
      "methods": ["POST"],
      "category": "plugins",
      "description": "Upload plugin via base64-encoded ZIP",
      "auth": true,
      "body": {
        "plugin_zip": "base64",
        "slug": "string",
        "activate": "boolean"
      }
    },
    {
      "path": "logs",
      "methods": ["GET"],
      "category": "diagnostics",
      "description": "Query transaction logs",
      "auth": true
    }
  ]
}
```

### Field definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | ✅ | Route path fragment (matches `EndpointType` value) |
| `methods` | string[] | ✅ | HTTP methods: `["GET"]`, `["POST"]`, `["GET", "POST"]` |
| `category` | string | ✅ | Grouping key from §14.2 categories |
| `description` | string | ✅ | One-line human-readable description |
| `auth` | boolean | ✅ | Whether authentication is required |
| `body` | object | ❌ | For POST/PUT — field names and their types |

### Body field type values

| Type string | Meaning |
|-------------|---------|
| `"string"` | Text field |
| `"boolean"` | `true` / `false` |
| `"integer"` | Whole number |
| `"base64"` | Base64-encoded binary data |
| `"array"` | JSON array |
| `"object"` | JSON object |
| `"string (slug)"` | Plugin slug identifier |

### Maintenance rules

| Rule | Detail |
|------|--------|
| Every `EndpointType` case must have a matching entry | Except internal-only cases like `WpJson` |
| Update `endpoints.json` when adding/removing endpoints | Keep synchronised with code |
| `version` field matches the file's revision | Bump when endpoints change |
| Categories match the grouping in §14.2 | Consistent across code and documentation |

---
