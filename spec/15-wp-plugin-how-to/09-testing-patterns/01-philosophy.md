# 9.1 Testing Philosophy

> **Parent:** [Phase 9 overview](./00-overview.md)

---

| Principle | Rule |
|-----------|------|
| **Unit tests don't need WordPress** | Helpers, enums, and pure logic are tested standalone with PHPUnit |
| **Integration tests use WP test suite** | REST endpoints, hooks, and database are tested with `wp-phpunit` |
| **Every public method has a test** | Enums, helpers, and trait public methods are all covered |
| **Test names describe behaviour** | `testValidationRejectsEmptyName` not `testValidation1` |
| **No test depends on another** | Each test sets up its own state and tears it down |
