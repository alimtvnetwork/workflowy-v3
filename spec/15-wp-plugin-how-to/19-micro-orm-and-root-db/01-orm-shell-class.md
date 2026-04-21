# 19.1 Micro-ORM — Fluent Query Builder

> **Parent:** [Phase 19 overview](./00-overview.md)

The micro-ORM is a lightweight, Idiorm-style fluent query builder for SQLite. It provides method chaining for SELECT, INSERT, UPDATE, and DELETE without requiring a full ORM framework.

## Architecture

```
Database/
├── Orm.php                      ← Shell class (static PDO, forTable factory)
└── Traits/
    ├── OrmWhereTrait.php        ← WHERE clause builders
    ├── OrmQueryTrait.php        ← SELECT, ORDER BY, GROUP BY, LIMIT, findOne/findMany
    └── OrmMutationTrait.php     ← create(), set(), save(), delete()
```

## Shell class — Orm.php

The Orm class holds shared static state and composes all three traits:

```php
class Orm {
    use OrmWhereTrait;
    use OrmQueryTrait;
    use OrmMutationTrait;

    private static ?PDO $pdo = null;
    private string $tableName = '';
    private array $data = [];
    private array $whereClauses = [];
    private array $whereParams = [];
    private array $orderBy = [];
    private ?int $limitValue = null;
    private ?int $offsetValue = null;
    private array $selectColumns = ['*'];
    private array $groupBy = [];
    private bool $isNew = false;
    private string $idColumn = 'Id';
    private static int $paramCounter = 0;

    public static function configure(PDO $pdo): void { self::$pdo = $pdo; }
    public static function getPdo(): ?PDO { return self::$pdo; }
    public static function forTable(string $tableName): self { /* factory */ }
    public static function rawExecute(string $sql, array $params = []): array { /* escape hatch */ }

    private function __construct() {}
}
```

## Key design decisions

| Decision | Rationale |
|----------|-----------|
| Static `$pdo` | Configured once via `Orm::configure($pdo)` during `Database::initDatabase()` — no injection needed |
| `forTable()` factory | Returns a fresh instance per query chain — prevents state leakage between queries |
| Private constructor | Forces use of `forTable()` — no accidental bare instantiation |
| `$paramCounter` static | Generates unique parameter names across all WHERE clauses to prevent collisions |
