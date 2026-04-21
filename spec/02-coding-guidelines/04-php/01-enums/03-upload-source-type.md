# UploadSourceType — Upload Origin

> **Parent:** [00-overview.md](00-overview.md)

Identifies how a plugin upload was initiated.

```php
enum UploadSourceType: string
{
    case Script  = 'upload_script';
    case RestApi = 'rest_api';
    case AdminUi = 'admin_ui';
    case WpCli   = 'wp_cli';

    public function isEqual(self $other): bool { return $this === $other; }

    public static function validValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function isValid(string $source): bool
    {
        return self::tryFrom($source) !== null;
    }
}
```

## Usage

```php
use RiseupAsia\\Enums\\UploadSourceType;

// ❌ FORBIDDEN
define('UPLOAD_SOURCE_SCRIPT', 'upload_script');

if ($source === UploadSourceType::Script) { ... }

// ✅ REQUIRED
$source  = UploadSourceType::Script;
$value   = UploadSourceType::Script->value;
$parsed  = UploadSourceType::tryFrom('rest_api');
$isValid = UploadSourceType::isValid($input);

if ($source->isEqual(UploadSourceType::RestApi)) { ... }
```
