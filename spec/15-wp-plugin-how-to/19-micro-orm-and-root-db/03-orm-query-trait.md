# 19.3 OrmQueryTrait — SELECT Operations

> **Parent:** [Phase 19 overview](./00-overview.md)

## Column selection

| Method | Purpose |
|--------|---------|
| `select($columns)` | Set columns (array or variadic args) |
| `selectColumn($column)` | Single column shorthand |
| `selectCount($alias)` | `COUNT(*) as {alias}` |

## Ordering, grouping, pagination

| Method | Purpose |
|--------|---------|
| `orderByAsc($col)` | `ORDER BY column ASC` |
| `orderByDesc($col)` | `ORDER BY column DESC` |
| `orderBy($col, $dir)` | Custom direction with validation |
| `groupBy($col)` | `GROUP BY column` |
| `limit($n)` | `LIMIT n` |
| `offset($n)` | `OFFSET n` |

## Query execution

| Method | Returns | Purpose |
|--------|---------|---------|
| `findOne($id)` | `?array` | Single record by primary key |
| `findMany()` | `array` | Execute built query, return all rows |
| `count()` | `int` | Count matching records |

## SQL builder

`buildSelectSql()` assembles the final SQL from accumulated state:

```
SELECT {columns} FROM {table}
  [WHERE {clauses}]
  [GROUP BY {columns}]
  [ORDER BY {columns}]
  [LIMIT {n}]
  [OFFSET {n}]
```

All queries are wrapped in try-catch with `InitHelpers::errorLog()` fallback — the ORM never throws.
