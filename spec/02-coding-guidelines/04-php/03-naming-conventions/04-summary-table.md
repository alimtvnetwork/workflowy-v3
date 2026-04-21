# Summary Table

| Element                    | Convention                     | Example                          |
|----------------------------|--------------------------------|----------------------------------|
| Class / Interface          | PascalCase                     | `SnapshotFactory`                |
| Enum                       | PascalCase + `Type` suffix     | `UploadSourceType`               |
| Trait                      | PascalCase                     | `HasTimestamps`                  |
| Method / Function          | camelCase                      | `processUpload()`                |
| Variable                   | camelCase                      | `$maxRetries`                    |
| Boolean variable           | `$is` / `$has` + camelCase     | `$isActive`, `$hasErrors`        |
| Constant                   | UPPER_SNAKE_CASE               | `MAX_RETRIES`                    |
| Enum case                  | PascalCase                     | `RestApi`                        |
| Namespace                  | PascalCase                     | `RiseupAsia\Enums`               |
| File (class/trait)         | PascalCase.php                 | `SnapshotFactory.php`            |
| File (enum)                | PascalCase + Type.php          | `UploadSourceType.php`           |
| File (config/procedural)   | lowercase_with_underscores.php | `constants.php`                  |
| Directory (domain folder)  | PascalCase                     | `Snapshot/`, `Database/`         |
| Log context array key      | camelCase                      | `'postId'`, `'masterDir'`        |
| DB column array key        | PascalCase                     | `'PluginSlug'`, `'CreatedAt'`    |
| API response array key     | PascalCase                     | `'PluginVersion'`, `'Timestamp'` |

---

*Part of [PHP Naming Conventions](./00-overview.md) — summary table*
