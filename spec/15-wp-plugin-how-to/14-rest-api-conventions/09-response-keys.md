# 14.9 Response Key Convention

> **Parent:** [Phase 14 overview](./00-overview.md)

---

All response JSON keys use PascalCase, defined in `ResponseKeyType`:

```php
// Response keys — PascalCase
enum ResponseKeyType: string
{
    // Envelope keys
    case Success  = 'Success';
    case Error    = 'Error';
    case Message  = 'Message';
    case Data     = 'Data';

    // Pagination keys
    case Total    = 'Total';
    case Limit    = 'Limit';
    case Offset   = 'Offset';

    // Domain keys — named per resource
    case Plugins  = 'Plugins';
    case Agents   = 'Agents';
    case Logs     = 'Logs';
    // ...
}
```

### Key naming rules

| Layer | Convention | Example |
|-------|-----------|---------|
| Request body fields | snake_case | `plugin_zip`, `upload_source` |
| Query parameters | camelCase | `triggeredBy`, `uploadSource` |
| Response keys | PascalCase | `PluginSlug`, `TotalRecords`, `IsSuccess` |
| URL path segments | kebab-case | `upload-active`, `sync-manifest` |

---
