# 5.1.1 BooleanHelpers — Semantic Guard Class

> **Parent:** [00-overview.md](./00-overview.md)

BooleanHelpers is a **static utility class** providing readable boolean checks for common conditions. It eliminates negation-heavy code like `!class_exists()` and `!function_exists()` in favour of intention-revealing method names.

## Structure

```
Helpers/
├── BooleanHelpers.php           ← Shell class, composes trait
└── Traits/
    └── BooleanDomainTrait.php   ← All boolean methods
```

## Method categories

### Environment guards

| Method | Replaces |
|--------|----------|
| `isClassExists($name)` | `class_exists($name)` |
| `isClassMissing($name)` | `!class_exists($name)` |
| `isClassUnregistered($name)` | `!class_exists($name, false)` — no autoload |
| `isFuncExists($name)` | `function_exists($name)` |
| `isFuncMissing($name)` | `!function_exists($name)` |
| `isExtensionLoaded($name)` | `extension_loaded($name)` |
| `isExtensionMissing($name)` | `!extension_loaded($name)` |
| `isConstantMissing($name)` | `!defined($name)` |

### Data guards

| Method | Replaces |
|--------|----------|
| `isKeySet($data, $key)` | `isset($data[$key])` |
| `isKeyMissing($data, $key)` | `!isset($data[$key])` |
| `hasValue($value)` | `!empty($value)` |
| `isValueEmpty($value)` | `empty($value)` |
| `isNull($value)` | `$value === null` |
| `isAbsentFromList($needle, $haystack)` | `!in_array($needle, $haystack)` |

### String inspection

| Method | Replaces |
|--------|----------|
| `hasSubstring($haystack, $needle)` | `str_contains()` |
| `lacksSubstring($haystack, $needle)` | `!str_contains()` |
| `hasPrefix($haystack, $prefix)` | `str_starts_with()` |
| `hasSuffix($haystack, $suffix)` | `str_ends_with()` |
| `isStringPopulated($value)` | `$value !== ''` |
| `isStringEmpty($value)` | `$value === ''` |

### WordPress guards

| Method | Replaces |
|--------|----------|
| `isWpScheduleMissing($hook)` | `!wp_next_scheduled($hook)` |
| `isCapabilityMissing($cap)` | `!current_user_can($cap)` |
| `isDbConnected($db)` | Checks `$db !== null && $db->isReady()` |
| `isDbDisconnected($db)` | Negation of connected check |

## Usage pattern

```php
// Before (negation-heavy, easy to misread)
if (!class_exists('PDO')) { return null; }
if (!extension_loaded('pdo_sqlite')) { return null; }

// After (intention-revealing)
if (BooleanHelpers::isClassMissing('PDO')) { return null; }
if (BooleanHelpers::isExtensionMissing('pdo_sqlite')) { return null; }
```

## Related

- [01-helper-classes.md](./01-helper-classes.md) — Standard helpers inventory
- [03-init-helpers.md](./03-init-helpers.md) — InitHelpers (uses BooleanHelpers internally)
