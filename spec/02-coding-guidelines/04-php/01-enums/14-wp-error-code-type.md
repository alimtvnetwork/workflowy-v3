# WpErrorCodeType — WordPress REST API Error Codes

> **Parent:** [00-overview.md](00-overview.md)

`WpErrorCodeType` centralizes all `WP_Error` code strings used in REST API permission callbacks, validation, and error responses. Eliminates magic strings in `new WP_Error()` calls.

```php
namespace RiseupAsia\Enums;

enum WpErrorCodeType: string
{
    // Auth & Permission
    case RestForbidden          = 'rest_forbidden';
    case NotAuthenticated       = 'not_authenticated';
    case InsufficientPermissions = 'insufficient_permissions';
    case NoToken                = 'no_token';
    case InvalidToken           = 'invalid_token';
    case RateLimited            = 'rate_limited';

    // Validation
    case ValidationFailed       = 'validation_failed';
    case ValidationError        = 'validation_error';

    // Operations
    case UploadFailed           = 'upload_failed';
    case AuthenticationFailed   = 'authentication_failed';
    case FatalError             = 'fatal_error';

    public function isEqual(self $other): bool {
        return $this->value === $other->value;
    }
}
```

## Usage

```php
use RiseupAsia\Enums\WpErrorCodeType;

// ❌ FORBIDDEN
return new WP_Error('not_authenticated', 'Authentication required', ['status' => 401]);

// ✅ REQUIRED
return new WP_Error(WpErrorCodeType::NotAuthenticated->value, 'Authentication required', ['status' => 401]);
```
