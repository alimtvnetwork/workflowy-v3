# 15.3 Default Values

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 3.1 Default Value Sources

Defaults come from two sources:

1. **Config enums** — Numeric/string defaults defined in a config enum:
   ```php
   enum SnapshotConfigType: int|string {
       case RetentionDaysDefault  = 30;
       case RetentionCountDefault = 10;
       case BatchSize             = 1000;
       case WorkerPoolDefault     = 5;
       case WorkerPoolMin         = 1;
       case MaxSizeMb             = 500;
   }
   ```

2. **Value enums** — Defaults selected from value-type enums:
   ```php
   $preferredProvider = $settings[SettingsKeyType::PreferredProvider->value]
       ?? SnapshotProviderType::Auto->value;
   $storageMode = $settings[SettingsKeyType::StorageMode->value]
       ?? StorageModeType::PerTable->value;
   ```

---

## 3.2 Default Extraction Pattern

At the top of each settings partial, extract all values with defaults:

```php
$preferredProvider = $snapshotSettings[SettingsKeyType::PreferredProvider->value]
    ?? SnapshotProviderType::Auto->value;
$scheduleEnabled   = $snapshotSettings[SettingsKeyType::ScheduleEnabled->value]
    ?? false;
$scheduleFrequency = $snapshotSettings[SettingsKeyType::ScheduleFrequency->value]
    ?? SnapshotFrequencyType::Daily->value;
$retentionDays     = $snapshotSettings[SettingsKeyType::RetentionDays->value]
    ?? SnapshotConfigType::RetentionDaysDefault->value;
```

**Rules:**
1. ALWAYS use null coalescing (`??`) with an explicit default
2. Enum defaults reference the enum's `->value`, not the case itself
3. Boolean defaults use `false` (opt-in) or `true` (opt-out) explicitly
4. Extract all values at the top of the template/partial, before HTML output
