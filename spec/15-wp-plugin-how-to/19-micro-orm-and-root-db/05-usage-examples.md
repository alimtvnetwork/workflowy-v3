# 19.5 Usage Examples & Database Integration

> **Parent:** [Phase 19 overview](./00-overview.md)

## Paginated query with filters

```php
$results = Orm::forTable('Transactions')
    ->select('Id', 'Action', 'Status', 'CreatedAt')
    ->where('Status', 'Success')
    ->whereLike('Action', '%Upload%')
    ->orderByDesc('CreatedAt')
    ->limit(25)
    ->offset(50)
    ->findMany();
```

## Count with filters

```php
$total = Orm::forTable('Transactions')
    ->where('Status', 'Success')
    ->count();
```

## Raw SQL escape hatch

```php
$rows = Orm::rawExecute(
    "SELECT Action, COUNT(*) as Total FROM Transactions GROUP BY Action ORDER BY Total DESC",
);
```

Use `rawExecute()` only for complex queries that the builder cannot express (aggregations with HAVING, subqueries, JOINs).

---

## 19.6 Integration with Database class

The ORM is configured during `Database::initDatabase()` via the ConnectionTrait:

```php
// Inside DatabaseConnectionTrait::initDatabase()
$this->pdo = InitHelpers::initSqliteConnection($this->dbPath, $this->fileLogger);
Orm::configure($this->pdo);  // ← ORM now shares the same PDO
$this->createTables();        // ← migrations run
```

After this, `Orm::forTable()` is available anywhere in the plugin without passing a PDO instance.
