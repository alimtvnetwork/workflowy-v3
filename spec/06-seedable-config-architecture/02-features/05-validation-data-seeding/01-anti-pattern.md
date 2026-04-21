# 1. Anti-Pattern: Hardcoded Arrays ❌

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

```go
// ❌ WRONG: Hardcoded validation data
func validateTransitionDensity(content string, _ *SeoConfig) ValidationResult {
    transitions := []string{
        "however", "therefore", "additionally", "moreover", "furthermore",
        "consequently", "meanwhile", "nevertheless", "accordingly", "hence",
    }
    // ...
}
```

**Why this is forbidden:**

- Cannot be changed without a new build/deploy
- Not user-configurable
- Not version-tracked
- Duplicates emerge across packages
- No single source of truth

---

## Correct Pattern: CW Config → Root DB ✅

The fix follows a 5-step pattern documented in subsequent files:

1. [Define in config.seed.json](./02-config-seed-json.md)
2. [Persist into ValidationData table](./03-database-storage.md)
3. [Expose typed Go constants](./04-go-typed-constants.md)
4. [Service + validator implementation](./05-validation-data-service.md)
5. [Categories, versioning, runtime API](./06-categories-and-versioning.md)
