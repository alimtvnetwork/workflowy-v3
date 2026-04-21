# 15.1 Data Model

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 1.1 Option Name Registry (`OptionNameType`)

Every WordPress option key used by the plugin MUST be registered as a case in the `OptionNameType` enum. This prevents typos, enables IDE autocomplete, and makes option usage searchable.

```php
enum OptionNameType: string
{
    case SnapshotSettings   = 'RiseupSnapshotSettings';
    case LogRetrieval       = 'RiseupLogRetrievalSettings';
    case UpdateSettings     = 'RiseupUpdateSettings';
    case PluginSettings     = 'RiseupAsiaSettings';
    case ErrorNotification  = 'RiseupErrorNotificationSettings';
    case SupportSettings    = 'RiseupSupportSettings';
    case LastPluginVersion  = 'riseup_asia_last_version';

    /** WordPress core — value must remain snake_case. */
    case ActivePlugins      = 'active_plugins';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

**Rules:**
1. Plugin option names use PascalCase prefix + PascalCase suffix (e.g., `RiseupSnapshotSettings`)
2. WordPress core option names retain their original format (e.g., `active_plugins`)
3. Every `get_option()` and `update_option()` call MUST use `OptionNameType::Case->value`
4. Helper methods (`isEqual`, `isAnyOf`) follow the standard enum metadata pattern (Phase 02)

---

## 1.2 Settings Key Registry (`SettingsKeyType`)

Individual keys within a settings array MUST be registered in `SettingsKeyType`. This enum also handles migration from legacy snake_case to PascalCase:

```php
enum SettingsKeyType: string
{
    case PreferredProvider     = 'PreferredProvider';
    case ScheduleEnabled       = 'ScheduleEnabled';
    case ScheduleFrequency     = 'ScheduleFrequency';
    case WorkerPoolSize        = 'WorkerPoolSize';
    case StorageMode           = 'StorageMode';
    // ...

    public static function legacyMap(): array {
        return [
            'preferred_provider' => self::PreferredProvider,
            'schedule_enabled'   => self::ScheduleEnabled,
            // ...
        ];
    }

    public static function migrateArray(array $data): array {
        $map = self::legacyMap();
        $migrated = [];
        foreach ($data as $key => $value) {
            $enumCase = $map[$key] ?? self::tryFrom($key);
            if ($enumCase instanceof self) {
                $migrated[$enumCase->value] = $value;
            } else {
                $migrated[$key] = $value;
            }
        }
        return $migrated;
    }

    public static function isLegacyKey(string $key): bool {
        return isset(self::legacyMap()[$key]);
    }
}
```

**Rules:**
1. All settings keys use PascalCase as the enum value
2. The `legacyMap()` provides backward compatibility with snake_case keys
3. `migrateArray()` transforms an entire array in one call
4. Settings accessed via `$settings[SettingsKeyType::WorkerPoolSize->value]`

---

## 1.3 Storage Pattern

Settings are stored as serialized arrays in WordPress options:

```php
// Read
$settings = get_option(OptionNameType::SnapshotSettings->value, []);

// Write
update_option(OptionNameType::SnapshotSettings->value, $settings);

// Delete
delete_option(OptionNameType::SnapshotSettings->value);
```

Each `OptionNameType` case maps to one WordPress option row containing a serialized associative array. Individual keys within the array are defined by `SettingsKeyType` or inline strings for simpler option groups.
