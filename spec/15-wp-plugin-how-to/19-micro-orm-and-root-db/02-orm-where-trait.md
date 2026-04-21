# 19.2 OrmWhereTrait — WHERE Clause Building

> **Parent:** [Phase 19 overview](./00-overview.md)

All WHERE methods return `$this` for chaining. Parameters are auto-named via `generateParamName()` to prevent collisions in complex queries.

## Methods

| Method | SQL Output |
|--------|-----------|
| `where($col, $val)` | `column = :param` |
| `whereEqual($col, $val)` | Alias for `where()` |
| `whereNotEqual($col, $val)` | `column != :param` |
| `whereGt($col, $val)` | `column > :param` |
| `whereGte($col, $val)` | `column >= :param` |
| `whereLt($col, $val)` | `column < :param` |
| `whereLte($col, $val)` | `column <= :param` |
| `whereLike($col, $val)` | `column LIKE :param` |
| `whereNull($col)` | `column IS NULL` |
| `whereNotNull($col)` | `column IS NOT NULL` |
| `whereIn($col, $values)` | `column IN (:p1, :p2, ...)` |
| `whereNotIn($col, $values)` | `column NOT IN (:p1, :p2, ...)` |
| `whereRaw($clause, $params)` | Raw SQL clause with manual params |

## Parameter generation

```php
private function generateParamName(string $column): string {
    self::$paramCounter++;
    $safeColumn = preg_replace('/[^a-zA-Z0-9_]/', '', $column);
    return ':' . $safeColumn . '_' . self::$paramCounter;
}
```

This ensures parameters like `:Status_1`, `:Status_2` never collide, even with multiple `where()` calls on the same column.

## Edge case — empty `whereIn()`

```php
public function whereIn(string $column, array $values) {
    if (empty($values)) {
        $this->whereClauses[] = '1 = 0';  // Always-false — returns no rows
        return $this;
    }
    // ...
}
```
