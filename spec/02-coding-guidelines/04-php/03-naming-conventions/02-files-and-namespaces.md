# Files, Namespaces, and Directory Structure

## Namespaces

Use **PascalCase**, structured by domain.

```php
namespace App\Domain\Upload;
namespace App\Infrastructure\Http;
```

**Rules:**

- Reflect architecture, not folders alone
- Avoid generic buckets like `Utils` or `Helpers`

## Files

File names follow **PSR-4 autoloading** — the file name must match the class, enum, or interface inside it exactly.

### Class / Enum / Interface / Trait files

Use **PascalCase** and match the symbol name 1:1.

```
UploadManager.php
HttpClient.php
CacheDriver.php
SnapshotFactory.php
```

**Rules:**

- One class or enum per file
- File name equals class name exactly
- Case-sensitive on Linux servers
- No underscores, no `snake_case`, no `class-kebab-case` prefixes

```php
// ❌ Bad
class-upload-manager.php
upload_source.php
Upload_Source.php
uploadsource.php

// ✅ Good
UploadManager.php
UploadSource.php
```

### Domain-based directory structure

Files are organized into **domain folders** within `includes/`:

```
includes/
  Admin/           — Admin UI and settings
  Agent/           — Agent management
  Database/        — Database, ORM, caching
  Enums/           — Backed enums (PSR-4 namespace)
  Helpers/         — Utility classes (path, envelope, error checking)
  Logging/         — Logger implementations
  Post/            — Post/content management
  Snapshot/        — Snapshot system (backup, restore, providers)
  Update/          — Auto-update resolver
  Upload/          — Upload ignore rules
  constants.php    — Global constants (unprefixed)
```

### Namespaced directory structure

Directory structure mirrors the namespace:

```php
namespace RiseupAsia\Enums;
```

```
includes/
  Enums/
    CapabilityType.php
    ErrorType.php
    HookType.php
    HttpMethodType.php
    UploadSourceType.php
    PathSubdirType.php
    PathDatabaseType.php
    PathLogFileType.php
    PathConfigType.php
```

Autoloaders depend on this mapping.

### Files without classes (rare)

For procedural or config files, use **lowercase with underscores**:

```
constants.php
constants-compat.php
```

These are exceptions and should be limited to PSR-4-incompatible legacy code paths (≤5% of files).

---

*Part of [PHP Naming Conventions](./00-overview.md) — files & namespaces*
