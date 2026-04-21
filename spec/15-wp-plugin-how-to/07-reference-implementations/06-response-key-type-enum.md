# 7.6 ResponseKeyType Enum — `includes/Enums/ResponseKeyType.php`

> **Parent:** [Phase 7 overview](./00-overview.md)

```php
<?php
/**
 * ResponseKeyType — Standard keys used in the API response envelope.
 *
 * @package PluginName\Enums
 * @since   1.0.0
 */

namespace PluginName\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum ResponseKeyType: string
{
    // Status block
    case Status      = 'Status';
    case IsSuccess   = 'IsSuccess';
    case IsFailed    = 'IsFailed';
    case Code        = 'Code';
    case Message     = 'Message';
    case Timestamp   = 'Timestamp';

    // Attributes block
    case Attributes   = 'Attributes';
    case RequestedAt  = 'RequestedAt';
    case TotalRecords = 'TotalRecords';

    // Data blocks
    case Results = 'Results';
    case Errors  = 'Errors';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```
