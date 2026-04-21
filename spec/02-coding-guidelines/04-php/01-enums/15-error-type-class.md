# ErrorType — PHP Error Type Constants (Non-Enum Class)

> **Parent:** [00-overview.md](00-overview.md)

`ErrorType` holds arrays/maps — not a backed enum. Does NOT get `isEqual()`.

```php
final class ErrorType
{
    public const FATAL_TYPES = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];
    public const WARNING_TYPES = [E_WARNING, E_CORE_WARNING, E_USER_WARNING, E_NOTICE, ...];
    public const RECOVERABLE_TYPES = [E_RECOVERABLE_ERROR, E_STRICT];
    public const TYPE_LABELS = [E_ERROR => 'E_ERROR', ...];
}
```
