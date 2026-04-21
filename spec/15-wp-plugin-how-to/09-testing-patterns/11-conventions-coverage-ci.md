# 9.11–9.13 Conventions, Coverage & CI

> **Parent:** [Phase 9 overview](./00-overview.md)

---

## 9.11 Test Naming Convention

| Pattern | Example |
|---------|---------|
| `test{Action}{Condition}` | `testValidationRejectsEmptyName` |
| `test{Subject}{Behaviour}` | `testEnvelopeBuilderOmitsErrorsOnSuccess` |
| `test{Subject}{EdgeCase}` | `testIsArrayRejectsArrayObject` |

### Rules

- Test method names are `camelCase` starting with `test`
- Describe **what** is tested and **what** the expected outcome is
- Never use numeric suffixes (`testCase1`, `testCase2`)
- Group related tests with `// ── Section ──` comments

---

## 9.12 Coverage Targets

| Category | Minimum coverage | Notes |
|----------|-----------------|-------|
| Enums | 100% | All cases, all helper methods |
| TypeCheckerTrait | 100% | All type methods, all edge cases |
| EnvelopeBuilder | 95%+ | Both success and error paths, debug ON/OFF |
| Validation patterns | 90%+ | All field types, boundary values |
| Helpers (DateHelper, PathHelper) | 90%+ | All public methods |
| REST endpoints (integration) | 80%+ | Happy path + auth rejection + validation failure |
| FileLogger | 70%+ | Log levels, rotation trigger, dedup |

### Running with coverage

```bash
vendor/bin/phpunit --testsuite Unit --coverage-text --coverage-html coverage/
```

---

## 9.13 CI Integration

### GitHub Actions workflow

```yaml
name: PHPUnit
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php: ['8.1', '8.2', '8.3']

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          extensions: sqlite3
          coverage: xdebug

      - name: Install dependencies
        run: composer install --no-interaction

      - name: Run unit tests
        run: vendor/bin/phpunit --testsuite Unit

      - name: Run integration tests
        if: matrix.php == '8.2'  # Only run integration once
        run: vendor/bin/phpunit --testsuite Integration
        env:
          WP_TESTS_DIR: /tmp/wordpress-tests-lib
```
