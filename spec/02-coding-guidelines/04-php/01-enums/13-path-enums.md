# Path Enums — 4 Domain-Specific Enums (replaces PathConst)

> **Parent:** [00-overview.md](00-overview.md)

The former `PathConst` final class has been decomposed into 4 backed enums. Each answers "which one?" for its domain, qualifying as a proper enum with the `Type` suffix. All include `isEqual()`.

## PathSubdirType — Plugin Subdirectories

```php
enum PathSubdirType: string
{
    case Logs      = '/logs';
    case Temp      = '/temp';
    case Snapshots = '/snapshots';
    case Exports   = '/exports';

    public function isEqual(self $other): bool { return $this === $other; }
}
```

## PathDatabaseType — SQLite Database Files

```php
enum PathDatabaseType: string
{
    case Root     = '/a-root.db';
    case Activity = '/activity.db';
    case Snapshot = '/snapshots.db';
    case Plugin   = '/riseup-asia-uploader.db';

    public function isEqual(self $other): bool { return $this === $other; }
}
```

## PathLogFileType — Log File Names

```php
enum PathLogFileType: string
{
    case Log        = '/log.txt';
    case FatalError = '/fatal-errors.log';
    case Stacktrace = '/stacktrace.txt';
    case Error      = '/error.txt';

    public function isEqual(self $other): bool { return $this === $other; }
}
```

## PathConfigType — Config File Names

```php
enum PathConfigType: string
{
    case Detection = '/wp-plugin-detected.json';

    public function isEqual(self $other): bool { return $this === $other; }
}
```

## Usage in PathHelper

```php
use RiseupAsia\Enums\PathSubdirType;
use RiseupAsia\Enums\PathDatabaseType;

// ❌ FORBIDDEN
$logsDir = self::join(self::getBaseDir(), LOGS_SUBDIR);

// ✅ REQUIRED
$logsDir = self::join(self::getBaseDir(), PathSubdirType::Logs->value);
$dbPath  = self::join(self::getBaseDir(), PathDatabaseType::Plugin->value);
```
