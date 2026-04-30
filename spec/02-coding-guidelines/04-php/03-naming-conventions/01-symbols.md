# Symbols — Classes, Methods, Variables, Constants, Enum Cases

## Classes, Interfaces, Traits, Enums

Use **PascalCase**. Enums MUST use the **`Type` suffix**.

```php
class UploadManager {}
interface CacheDriver {}
trait HasTimestamps {}
enum UploadSourceType: string {}  // ✅ Type suffix required
enum CapabilityType: string {}    // ✅ Type suffix required
```

**Rules:**

- One class per file
- File name matches class name
- Names should be nouns
- Avoid abbreviations unless universal (`HTTP`, `API`, `CLI`)

## Methods and Functions

Use **camelCase**.

```php
function processUpload() {}
function getRetryCount() {}
```

**Rules:**

- Verb or verb phrase
- Describe behavior, not implementation
- Avoid prefixes like `do`, `handle`, `run`

```php
// ✅ Good
calculateChecksum()

// ❌ Bad
doChecksumThing()
```

## Variables

Use **camelCase**.

```php
$maxRetries = 3;
$uploadSource = UploadSource::Script;
```

**Rules:**

- Clear intent over short names
- Avoid Hungarian notation
- Avoid `snake_case` for variables in PHP 8.1+ code
- Boolean variables must use `$is` or `$has` prefix in **camelCase** (e.g., `$isActive`, `$hasErrors`) — not `$is_active` or `$has_errors`. The prefix follows the same camelCase rule as all other variables

## Constants

Use **UPPER_SNAKE_CASE**.

```php
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 30;
```

For class constants:

```php
class Limits
{
    public const MAX_RETRIES = 3;
}
```

Enums are the exception: enum cases follow **PascalCase**, not uppercase. Enum names use `Type` suffix.

```php
UploadSourceType::RestApi
CapabilityType::ManageOptions
```

## Enum Cases

Use **PascalCase**. Enum names MUST have `Type` suffix.

```php
enum UploadSourceType: string
{
    case Script;
    case RestApi;
    case AdminUi;
    case WpCli;
}
```

**Rules:**

- Match domain naming
- Avoid screaming uppercase
- Treat them like class names

---

*Part of [PHP Naming Conventions](./00-overview.md) — symbols section*
