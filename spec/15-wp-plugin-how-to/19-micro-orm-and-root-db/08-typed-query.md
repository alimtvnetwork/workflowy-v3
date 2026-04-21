# 19.9 TypedQuery — Go-Style Typed Database Results

> **Parent:** [Phase 19 overview](./00-overview.md)

`TypedQuery` provides a **type-safe alternative to the fluent ORM** for cases where you need explicit SQL control with structured result handling. It mirrors Go's `dbutil.Result[T]` pattern.

## Architecture

```
Database/
├── TypedQuery.php       ← Query executor with closure-based row mapping
├── DbResult.php         ← Single-row result wrapper (value | empty | error)
├── DbResultSet.php      ← Multi-row result wrapper (items | error)
└── DbExecResult.php     ← Mutation result wrapper (affectedRows, lastInsertId | error)
```

## TypedQuery class

Takes a PDO instance (not static like Orm) and provides three methods:

```php
final class TypedQuery {
    public function __construct(private readonly PDO $pdo) {}

    /** @return DbResult<T> */
    public function queryOne(string $sql, array $params, Closure $mapper): DbResult;

    /** @return DbResultSet<T> */
    public function queryMany(string $sql, array $params, Closure $mapper): DbResultSet;

    /** Non-query (INSERT/UPDATE/DELETE) */
    public function exec(string $sql, array $params = []): DbExecResult;
}
```

**Key difference from Orm:** TypedQuery uses raw SQL + closure mappers. The caller controls the SQL; TypedQuery handles error wrapping and row-to-object mapping.

## Result wrappers

### DbResult\<T\> — Single row

| Method | Returns | Purpose |
|--------|---------|---------|
| `DbResult::of($value)` | `self<T>` | Successful result with mapped value |
| `DbResult::empty()` | `self<T>` | No row found (not an error) |
| `DbResult::error($e)` | `self<T>` | Query or mapping failed |
| `->isDefined()` | `bool` | True when a row was mapped |
| `->isEmpty()` | `bool` | True when no row found |
| `->hasError()` | `bool` | True when query failed |
| `->isSafe()` | `bool` | True when defined AND no error |
| `->value()` | `T\|null` | The mapped value |
| `->getError()` | `?Throwable` | The underlying error |
| `->stackTrace()` | `string` | Captured stack trace |

### DbResultSet\<T\> — Multiple rows

| Method | Returns | Purpose |
|--------|---------|---------|
| `DbResultSet::of($items)` | `self<T>` | Successful result set |
| `DbResultSet::error($e)` | `self<T>` | Query or mapping failed |
| `->items()` | `array<T>` | The mapped items |
| `->count()` | `int` | Number of items |
| `->hasAny()` | `bool` | True when at least one item |
| `->isEmpty()` | `bool` | True when zero items |
| `->first()` | `DbResult<T>` | First item as a DbResult |
| `->isSafe()` | `bool` | True when no error |

### DbExecResult — Mutations

| Method | Returns | Purpose |
|--------|---------|---------|
| `DbExecResult::of($affected, $lastId)` | `self` | Successful mutation |
| `DbExecResult::error($e)` | `self` | Mutation failed |
| `->affectedRows()` | `int` | Rows changed |
| `->lastInsertId()` | `int` | Auto-increment ID |
| `->isEmpty()` | `bool` | True when zero rows affected |
| `->isSafe()` | `bool` | True when no error |

## Usage example

```php
$query = new TypedQuery($pdo);

// Single row with mapper closure
$result = $query->queryOne(
    "SELECT Id, Name, Version FROM Plugins WHERE Slug = ?",
    [$slug],
    fn(array $row) => new PluginInfo(
        id: (int) $row['Id'],
        name: $row['Name'],
        version: $row['Version'],
    ),
);

if ($result->isSafe()) {
    $plugin = $result->value();  // PluginInfo instance
}

// Multi-row
$resultSet = $query->queryMany(
    "SELECT * FROM Transactions WHERE Status = ? ORDER BY CreatedAt DESC",
    ['Success'],
    fn(array $row) => TransactionDto::fromRow($row),
);

if ($resultSet->hasAny()) {
    foreach ($resultSet->items() as $tx) { /* ... */ }
}

// Mutation
$execResult = $query->exec(
    "UPDATE Plugins SET Version = ? WHERE Slug = ?",
    [$newVersion, $slug],
);

if ($execResult->isSafe()) {
    $affected = $execResult->affectedRows();
}
```

## When to use TypedQuery vs Orm

| Use case | Tool |
|----------|------|
| Simple CRUD, pagination, filters | `Orm::forTable()` fluent builder |
| Complex SQL (JOINs, subqueries, CTEs) | `TypedQuery` with raw SQL |
| Need typed return objects (not arrays) | `TypedQuery` with closure mappers |
| Quick counts, existence checks | `Orm::forTable()->count()` |
| Mutation with affected-row tracking | `TypedQuery::exec()` → `DbExecResult` |
