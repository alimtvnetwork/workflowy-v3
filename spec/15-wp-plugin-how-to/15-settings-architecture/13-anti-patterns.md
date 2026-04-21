# 15.13 Anti-Patterns (NEVER DO)

> **Parent:** [Phase 15 overview](./00-overview.md)

---

1. ❌ Hardcode option names as strings — always use `OptionNameType::Case->value`
2. ❌ Store settings in individual options — group related settings in arrays
3. ❌ Skip sanitize callbacks in `register_setting()`
4. ❌ Use `$_POST` directly — always use WordPress Options API or `wp_verify_nonce()`
5. ❌ Default to `null` — always provide explicit defaults via enums or constants
6. ❌ Mix snake_case and PascalCase keys — migrate legacy keys via `SettingsKeyType::migrateArray()`
7. ❌ Use `<input type="submit">` for AJAX actions — use `type="button"`
8. ❌ Show/hide conditional fields with JavaScript only — set initial state server-side
9. ❌ Place action buttons outside a `<table class="form-table">` in settings context
10. ❌ Skip the `BooleanHelpers::hasValue()` check for checkbox values
