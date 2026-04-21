# Rules and Conventions

> **Parent:** [00-overview.md](00-overview.md)

## Naming Convention: `Type` Suffix

All enums MUST use the **`Type` suffix** in their name. This clearly distinguishes enums from classes and makes the type nature explicit at every usage site.

| ❌ Forbidden Name | ✅ Required Name |
|------------------|-----------------|
| `UploadSource` | `UploadSourceType` |
| `Capability` | `CapabilityType` |
| `HttpMethod` | `HttpMethodType` |
| `Hook` | `HookType` |

> **Non-enum constant classes** (`ErrorType`) keep their existing names — they are `final class`, not `enum`. The former `PathConst` class has been decomposed into 4 domain-specific enums (see [13-path-enums.md](13-path-enums.md)).

## Architectural Rules

1. **All enums live in `includes/Enums/`** — one file per enum.
2. **File name = Definition name** — e.g., `UploadSourceType.php` → contains `enum UploadSourceType: string`.
3. **Namespace:** `RiseupAsia\\Enums` — every enum file declares this namespace.
4. **`Type` suffix required** — use `UploadSourceType`, not `UploadSource`.
5. **String-backed** (`enum Foo: string`) for all enums whose values are strings.
6. **Case names use PascalCase** — `case RestApi`, not `case REST_API`.
7. **No `RISEUP_` prefix** on anything — namespace provides scoping.
8. **`define()` constants are prohibited** for values that belong in an enum.
9. **Access pattern:** `UploadSourceType::Script` (the enum case) or `UploadSourceType::Script->value` (the raw string).
10. **Validation helpers** go as `static` methods on the enum itself (camelCase: `validValues()`, `isValid()`).
11. **Non-enum constants classes** (ErrorType) use the same namespace and folder but remain `final class` with `public const`.
12. **`isEqual()` method required** — every backed enum MUST include the `isEqual(self $other): bool` instance method (see [02-isequal-method.md](02-isequal-method.md)).

## File Loading

Enum files are loaded via `require_once` before the dependency loader:

```php
// In riseup-asia-uploader.php (bootstrap)
require_once __DIR__ . '/includes/Enums/UploadSourceType.php';
require_once __DIR__ . '/includes/Enums/CapabilityType.php';
require_once __DIR__ . '/includes/Enums/HttpMethodType.php';
require_once __DIR__ . '/includes/Enums/HookType.php';
require_once __DIR__ . '/includes/Enums/EndpointType.php';
require_once __DIR__ . '/includes/Enums/PathSubdirType.php';
require_once __DIR__ . '/includes/Enums/PathDatabaseType.php';
require_once __DIR__ . '/includes/Enums/PathLogFileType.php';
require_once __DIR__ . '/includes/Enums/PathConfigType.php';
require_once __DIR__ . '/includes/Enums/WpErrorCodeType.php';
require_once __DIR__ . '/includes/Enums/ErrorType.php';
```

At call sites, use the `use` import:

```php
use RiseupAsia\\Enums\\UploadSourceType;
use RiseupAsia\\Enums\\CapabilityType;
```
