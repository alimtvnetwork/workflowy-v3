# 20.5 Step 4 — Enums (No Dependencies)

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 2** — Backed enums for all constants. Create these first because every other file depends on them.

---

## 4a. PluginConfigType — The identity enum

> **Phase 7, §7.8** — Single source of truth for all metadata.

**File: `includes/Enums/PluginConfigType.php`**

```php
<?php
namespace TaskTracker\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum PluginConfigType: string
{
    case Slug          = 'task-tracker';
    case ShortName     = 'TaskTracker';
    case Name          = 'Task Tracker';
    case Version       = '1.0.0';
    case MinWpVersion  = '5.6';
    case MinPhpVersion = '8.1';
    case ApiNamespace  = 'task-tracker-api';
    case ApiVersion    = 'v1';
    case LogPrefix     = '[TaskTracker]';
    case SettingsGroup = 'task_tracker_settings';
    case DebugConstant = 'TASK_TRACKER_DEBUG';

    public static function apiFullNamespace(): string
    {
        return self::ApiNamespace->value . '/' . self::ApiVersion->value;
    }

    public static function isDebugMode(): bool
    {
        $constantName = self::DebugConstant->value;
        $isDefined = defined($constantName);

        return $isDefined && constant($constantName) === true;
    }

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

## 4b. TaskStatusType — Domain enum

> **Phase 2, §2.1** — Every domain concept gets a backed enum.

**File: `includes/Enums/TaskStatusType.php`**

```php
<?php
namespace TaskTracker\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum TaskStatusType: string
{
    case Pending = 'pending';
    case Done    = 'done';

    /** Label for display in admin UI. */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Done    => 'Done',
        };
    }

    /** CSS class for badge styling. */
    public function cssClass(): string
    {
        return match ($this) {
            self::Pending => 'badge--warning',
            self::Done    => 'badge--success',
        };
    }

    public function isPending(): bool { return $this === self::Pending; }
    public function isDone(): bool { return $this === self::Done; }

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

## 4c. EndpointType — Route paths

> **Phase 14, §14.2** — Resource-based, kebab-case route naming.

**File: `includes/Enums/EndpointType.php`**

```php
<?php
namespace TaskTracker\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum EndpointType: string
{
    case Tasks         = 'tasks';
    case TaskComplete  = 'tasks/complete';
    case Status        = 'status';

    /** Route path with leading slash for register_rest_route(). */
    public function route(): string
    {
        return '/' . $this->value;
    }

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

## 4d. Remaining enums

Create these by copying patterns from Phase 7 and Phase 2:

| Enum | Cases | Source |
|------|-------|--------|
| `HttpMethodType` | GET, POST, PUT, DELETE | Phase 14, §14.3 |
| `HttpStatusType` | Ok=200, Created=201, BadRequest=400, Unauthorized=401, InternalError=500 | Phase 5, §5.2 |
| `ResponseKeyType` | Status, IsSuccess, IsFailed, Code, Message, Timestamp, Attributes, RequestedAt, TotalRecords, Results, Errors | Phase 7, §7.6 |
| `PhpNativeType` | PhpArray='array', PhpString='string', PhpInteger='integer', etc. | Phase 3, §3.8 |
| `CapabilityType` | ManageOptions='manage_options', ActivatePlugins='activate_plugins' | Phase 3, §3.6 |
| `LogLevelType` | Debug, Info, Warn, Error | Phase 4, §4.3 |
| `OptionNameType` | NotificationsEnabled='task_tracker_notifications' | Phase 15 |
| `HookType` | RestApiInit='rest_api_init', AdminMenu='admin_menu', AdminInit='admin_init' | Phase 8, §8.1 |

**Each enum file follows the same template:**

1. Namespace declaration
2. ABSPATH guard
3. Enum with backed values
4. `match`-based metadata methods where useful
5. `isEqual()`, `isOtherThan()`, `isAnyOf()` comparison trio
