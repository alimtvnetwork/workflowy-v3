# 4. Enum Standard Violations

> **Parent:** [00-overview.md](./00-overview.md)

---

## Issue #12 — Magic Strings Instead of Enum Values

**Scope:** ~40 PHP call sites across 15 files  
**Root Cause:** Hardcoded strings used where enum values should be referenced.

**Before (❌):**
```php
if ($status === 'success') { ... }
$scope = 'all';
register_rest_route($ns, '/upload', ['methods' => 'POST', ...]);
if (current_user_can('manage_options')) { ... }
```

**After (✅):**
```php
if ($status->isEqual(StatusType::Success)) { ... }
$scope = SnapshotScopeType::All->value;
register_rest_route($ns, '/upload', ['methods' => HttpMethodType::Post->value, ...]);

if (current_user_can(CapabilityType::ManageOptions->value)) { ... }
```

**Prevention:** Zero magic strings policy. Every domain string must reference an enum case.

---

## Issue #13 — Go Enum Labels Using snake_case

**Scope:** Go enum packages (pre-standard)  
**Root Cause:** Early Go enums used snake_case or lowercase strings in `variantLabels`.

**Before (❌):**
```go
var variantLabels = [...]string{
    Invalid:  "invalid",
    PerTable: "per_table",
    SingleDb: "single_db",
}
```

**After (✅):**
```go
var variantLabels = [...]string{
    Invalid:  "Invalid",
    PerTable: "PerTable",
    SingleDb: "SingleDb",
}
```

**Prevention:** `variantLabels` must use PascalCase strings matching the constant names. Protocol-driven enums (`content_type`, `endpoint`, `header`, `response_key`, `response_message`) are exempt.

**v2.1.0 Update (2026-02-25):** The dual-table pattern (`variantStrings` + `variantLabels`) is now fully deprecated. All enums must use a single `variantLabels` table with PascalCase values. `Label()` delegates to `String()`. `Parse()` must use `strings.EqualFold()` for case-insensitive matching. Migration notices added to `spec/08`, `spec/10`, `spec/13` enum architecture files.

---

## Issue #14 — PHP Raw `===` for Enum Comparison

**Scope:** All PHP enum usage sites  
**Root Cause:** Code used `$status === StatusType::Success` instead of `$status->isEqual(StatusType::Success)`.

**Before (❌):**
```php
if ($status === StatusType::Success) { ... }
if ($level === LogLevelType::Error || $level === LogLevelType::Warn) { ... }
```

**After (✅):**
```php
if ($status->isEqual(StatusType::Success)) { ... }

if ($level->isErrorOrWarn()) { ... }
```

**Prevention:** `isEqual()` is mandatory on all backed enums. Raw `===` is forbidden for enum comparison.
