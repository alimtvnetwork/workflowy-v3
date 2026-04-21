# 19.4 OrmMutationTrait — Write Operations

> **Parent:** [Phase 19 overview](./00-overview.md)

## Insert flow

```php
$id = Orm::forTable('Transactions')
    ->create()
    ->set('Action', ActionType::Upload->value)
    ->set('Status', 'Success')
    ->set('CreatedAt', DateHelper::nowUtc())
    ->save();
// Returns: int (last insert ID) or false on failure
```

Internally:
1. `create()` sets `$isNew = true` and clears `$data`
2. `set($col, $val)` accumulates column-value pairs
3. `save()` dispatches to `doInsert()` which builds `INSERT INTO ... VALUES (...)`

## Update flow

```php
$affected = Orm::forTable('Transactions')
    ->where('Id', $id)
    ->set('Status', 'Completed')
    ->save();
// Returns: int (rows affected) or false
```

When `$isNew` is false, `save()` dispatches to `doUpdate()` which builds `UPDATE ... SET ... WHERE ...`. **Requires at least one WHERE clause** — bare updates are blocked (returns 0).

## Delete flow

```php
$deleted = Orm::forTable('Transactions')
    ->where('Status', 'Failed')
    ->whereLt('CreatedAt', $cutoffDate)
    ->delete();
// Returns: int (rows deleted)
```

**Safety:** `delete()` refuses to execute without WHERE clauses (returns 0) — prevents accidental `DELETE FROM table`.
