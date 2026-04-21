# 19.8 Key Patterns Summary

> **Parent:** [Phase 19 overview](./00-overview.md)

| Pattern | Where used | Rule |
|---------|-----------|------|
| Static PDO configuration | `Orm::configure()` | Configure once during Database init; available globally after |
| Factory method | `Orm::forTable()` | Fresh instance per query — prevents state leakage |
| Refuse bare mutations | `doUpdate()`, `delete()` | Require WHERE clause — never allow unguarded UPDATE/DELETE |
| Unique param naming | `generateParamName()` | Static counter prevents parameter collisions |
| Separate PDO per manifest | `RootDb::create()` | Each snapshot gets its own independent `a-root.db` |
| Legacy compatibility | `resolveRootDbTableName()` | Always check PascalCase first, then fall back to snake_case |
| Error swallowing | `findMany()`, `count()`, `save()` | ORM catches exceptions and returns empty/zero/false — never throws |
| Typed result wrappers | `TypedQuery` | Never return raw arrays — wrap in `DbResult<T>` / `DbResultSet<T>` / `DbExecResult` |
| Closure mappers | `TypedQuery::queryOne()` | Caller supplies a `Closure(array): T` — like Go's scanner functions |
| Trait decomposition | `FileCache` | Shell class with `FileCacheScanTrait` + `FileCacheStoreTrait` |
