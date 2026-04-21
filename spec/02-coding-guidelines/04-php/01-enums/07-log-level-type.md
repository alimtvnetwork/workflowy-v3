# LogLevelType — Log Severity Levels

> **Parent:** [00-overview.md](00-overview.md)

```php
enum LogLevelType: string
{
    case Debug = 'DEBUG';
    case Info  = 'INFO';
    case Warn  = 'WARN';
    case Error = 'ERROR';

    public function isEqual(self $other): bool { return $this === $other; }

    public function isError(): bool { return $this->isEqual(self::Error); }
    public function isWarn(): bool  { return $this->isEqual(self::Warn); }
    public function isInfo(): bool  { return $this->isEqual(self::Info); }
    public function isDebug(): bool { return $this->isEqual(self::Debug); }

    public function isErrorOrWarn(): bool
    {
        return $this->isEqual(self::Error) || $this->isEqual(self::Warn);
    }
}
```

## Usage

```php
use RiseupAsia\Enums\LogLevelType;

// ❌ FORBIDDEN
if ($level === LogLevelType::Error) { ... }

// ✅ REQUIRED — use domain helper or isEqual()
if ($level->isError()) { ... }

if ($level->isEqual(LogLevelType::Error)) { ... }
```
