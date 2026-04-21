# 20.17 Final Checklist — "Is My Plugin Gold Standard?"

> **Parent:** [Phase 20 overview](./00-overview.md)

---

Run through this checklist before shipping:

- [ ] Every PHP file has ABSPATH guard after namespace
- [ ] Zero magic strings — all constants are enum cases
- [ ] Every REST handler wrapped in `safeExecute()`
- [ ] Every catch block catches `Throwable` with stack trace logged
- [ ] No forbidden error patterns (Phase 4, §4.8)
- [ ] All validation uses `$this->validationError()` with guard clauses
- [ ] All strings sanitised after validation, not instead of
- [ ] FileLogger with rotation and dedup configured
- [ ] Version in `PluginConfigType::Version` only
- [ ] Template files ≤200 lines
- [ ] Admin pages use capability checks
- [ ] `uninstall.php` removes ALL plugin data
- [ ] Tests cover every enum and every public helper method
- [ ] No `array()` syntax — only `[]`
- [ ] No `is_array()` / `is_string()` — use `TypeCheckerTrait`

---

*This walkthrough demonstrates a complete plugin. For production plugins with more features, repeat Steps 4 (enums), 9 (migration), and 10 (handler traits) for each new domain.*
